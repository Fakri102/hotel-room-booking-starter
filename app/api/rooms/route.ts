import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { rooms } from "@/db/schema/rooms";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

const roomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required"),
    type: z.string().min(1, "Room type is required"),
    pricePerNight: z.number().positive("Price must be positive"),
    capacity: z.number().int().positive("Capacity must be positive"),
});

// GET /api/rooms - List all rooms or check availability
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const checkIn = searchParams.get("checkIn");
        const checkOut = searchParams.get("checkOut");

        if (checkIn && checkOut) {
            // Check availability for specific dates
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            if (checkInDate >= checkOutDate) {
                return NextResponse.json(
                    { error: "Check-out date must be after check-in date" },
                    { status: 400 }
                );
            }

            const availableRooms = await db
                .select({
                    id: rooms.id,
                    roomNumber: rooms.roomNumber,
                    type: rooms.type,
                    pricePerNight: rooms.pricePerNight,
                    capacity: rooms.capacity,
                    isActive: rooms.isActive,
                })
                .from(rooms)
                .where(
                    and(
                        eq(rooms.isActive, true),
                        sql`${rooms.id} NOT IN (
                            SELECT DISTINCT ${sql.identifier('bookings.room_id')}
                            FROM ${sql.identifier('bookings')}
                            WHERE ${sql.identifier('bookings.is_active')} = true
                            AND ${sql.identifier('bookings.status')} = 'confirmed'
                            AND (
                                (${sql.identifier('bookings.check_in_date')} <= ${checkInDate}
                                AND ${sql.identifier('bookings.check_out_date')} > ${checkInDate})
                                OR (${sql.identifier('bookings.check_in_date')} < ${checkOutDate}
                                AND ${sql.identifier('bookings.check_out_date')} >= ${checkOutDate})
                                OR (${sql.identifier('bookings.check_in_date')} >= ${checkInDate}
                                AND ${sql.identifier('bookings.check_out_date')} <= ${checkOutDate})
                            )
                        )`
                    )
                );

            return NextResponse.json(availableRooms);
        } else {
            // List all rooms
            const allRooms = await db
                .select()
                .from(rooms)
                .where(eq(rooms.isActive, true))
                .orderBy(rooms.roomNumber);

            return NextResponse.json(allRooms);
        }
    } catch (error) {
        console.error("Error fetching rooms:", error);
        return NextResponse.json(
            { error: "Failed to fetch rooms" },
            { status: 500 }
        );
    }
}

// POST /api/rooms - Create a new room (admin only)
export async function POST(request: NextRequest) {
    try {
        // For now, we'll disable admin check until we implement proper session management
        // In a real app, you'd verify the user session and check admin status
        // const session = await getSessionFromRequest(request);
        // if (!session?.user?.isAdmin) {
        //     return NextResponse.json(
        //         { error: "Unauthorized. Admin access required." },
        //         { status: 403 }
        //     );
        // }

        const body = await request.json();
        const validatedData = roomSchema.parse(body);

        // Check if room number already exists
        const existingRooms = await db
            .select()
            .from(rooms)
            .where(eq(rooms.roomNumber, validatedData.roomNumber));

        if (existingRooms.length > 0) {
            return NextResponse.json(
                { error: "Room number already exists" },
                { status: 409 }
            );
        }

        const newRoom = await db.insert(rooms).values(validatedData).returning();

        return NextResponse.json(newRoom[0], { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating room:", error);
        return NextResponse.json(
            { error: "Failed to create room" },
            { status: 500 }
        );
    }
}