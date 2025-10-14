import { pgTable, text, integer, decimal, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const rooms = pgTable("rooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    roomNumber: text("room_number").notNull().unique(),
    type: text("type").notNull(), // e.g., "single", "double", "suite", "deluxe"
    capacity: integer("capacity").notNull(), // number of guests
    pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
    status: text("status").notNull().default("available"), // "available", "occupied", "maintenance", "out_of_order"
    description: text("description"),
    amenities: text("amenities"), // JSON string of amenities array
    createdAt: timestamp("created_at")
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => new Date())
        .notNull(),
});

export const bookings = pgTable("bookings", {
    id: uuid("id").primaryKey().defaultRandom(),
    roomId: uuid("room_id")
        .notNull()
        .references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    checkInDate: timestamp("check_in_date").notNull(),
    checkOutDate: timestamp("check_out_date").notNull(),
    status: text("status").notNull().default("pending"), // "pending", "confirmed", "checked_in", "checked_out", "cancelled"
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    specialRequests: text("special_requests"),
    createdAt: timestamp("created_at")
        .$defaultFn(() => new Date())
        .notNull(),
    updatedAt: timestamp("updated_at")
        .$defaultFn(() => new Date())
        .notNull(),
});

// Types for TypeScript
export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;