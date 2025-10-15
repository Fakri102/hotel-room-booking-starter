import { pgTable, serial, varchar, integer, timestamp, boolean, numeric } from "drizzle-orm/pg-core";

export const rooms = pgTable("rooms", {
    id: serial("id").primaryKey(),
    roomNumber: varchar("room_number", { length: 50 }).notNull().unique(),
    type: varchar("type", { length: 100 }).notNull(),
    pricePerNight: numeric("price_per_night", { precision: 10, scale: 2 }).notNull(),
    capacity: integer("capacity").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Room = typeof rooms.$inferSelect;
export type NewRoom = typeof rooms.$inferInsert;
