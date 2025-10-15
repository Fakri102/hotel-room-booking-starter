import { pgTable, serial, integer, date, timestamp, text, varchar, boolean, numeric } from "drizzle-orm/pg-core";
import { rooms } from "./rooms";
import { user } from "./auth";

export const bookings = pgTable("bookings", {
    id: serial("id").primaryKey(),
    roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    checkInDate: date("check_in_date").notNull(),
    checkOutDate: date("check_out_date").notNull(),
    status: varchar("status", { length: 20 }).default("confirmed").notNull(),
    guestName: varchar("guest_name", { length: 255 }).notNull(),
    guestEmail: varchar("guest_email", { length: 255 }).notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }),
    notes: text("notes"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;