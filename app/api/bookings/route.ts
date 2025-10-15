import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { bookings } from "@/db/schema/bookings";
import { rooms } from "@/db/schema/rooms";
import { eq, and, or, lte, gte } from "drizzle-orm";

const bookingSchema = z.object({
    roomId: z.number().int().positive("Room ID is required"),
    checkInDate: z.string().min(1, "Check-in date is required"),
    checkOutDate: z.string().min(1, "Check-out date is required"),
    guestName: z.string().min(1, "Guest name is required"),
    guestEmail: z.string().email("Valid email is required"),
    notes: z.string().optional(),
});

// GET /api/bookings - List bookings (filtered by user or admin)
export async function GET(request: NextRequest) {
    try {
        // TODO: Implement proper session management
        // const session = await getSessionFromRequest(request);
        // if (!session?.user) {
        //     return NextResponse.json(
        //         { error: "Unauthorized" },
        //         { status: 401 }
        //     );
        // }

        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get("roomId");

        // For now, return all active bookings without user filtering
        // TODO: Implement proper user-based filtering when session management is ready
        let allBookings = await db
            .select({
                id: bookings.id,
                roomId: bookings.roomId,
                userId: bookings.userId,
                checkInDate: bookings.checkInDate,
                checkOutDate: bookings.checkOutDate,
                status: bookings.status,
                guestName: bookings.guestName,
                guestEmail: bookings.guestEmail,
                totalAmount: bookings.totalAmount,
                notes: bookings.notes,
                isActive: bookings.isActive,
                createdAt: bookings.createdAt,
                updatedAt: bookings.updatedAt,
                room: {
                    id: rooms.id,
                    roomNumber: rooms.roomNumber,
                    type: rooms.type,
                    pricePerNight: rooms.pricePerNight,
                    capacity: rooms.capacity,
                    isActive: rooms.isActive,
                }
            })
            .from(bookings)
            .leftJoin(rooms, eq(bookings.roomId, rooms.id))
            .where(eq(bookings.isActive, true))
            .orderBy(bookings.createdAt);

        if (roomId) {
            allBookings = await db
                .select({
                    id: bookings.id,
                    roomId: bookings.roomId,
                    userId: bookings.userId,
                    checkInDate: bookings.checkInDate,
                    checkOutDate: bookings.checkOutDate,
                    status: bookings.status,
                    guestName: bookings.guestName,
                    guestEmail: bookings.guestEmail,
                    totalAmount: bookings.totalAmount,
                    notes: bookings.notes,
                    isActive: bookings.isActive,
                    createdAt: bookings.createdAt,
                    updatedAt: bookings.updatedAt,
                    room: {
                        id: rooms.id,
                        roomNumber: rooms.roomNumber,
                        type: rooms.type,
                        pricePerNight: rooms.pricePerNight,
                        capacity: rooms.capacity,
                        isActive: rooms.isActive,
                    }
                })
                .from(bookings)
                .leftJoin(rooms, eq(bookings.roomId, rooms.id))
                .where(and(
                    eq(bookings.isActive, true),
                    eq(bookings.roomId, parseInt(roomId))
                ))
                .orderBy(bookings.createdAt);
        }

        const userBookings = allBookings;

        return NextResponse.json(userBookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
    try {
        // TODO: Implement proper session management
        // const session = await getSessionFromRequest(request);
        // if (!session?.user) {
        //     return NextResponse.json(
        //         { error: "Unauthorized" },
        //         { status: 401 }
        //     );
        // }

        const body = await request.json();
        const validatedData = bookingSchema.parse(body);

        const checkInDate = new Date(validatedData.checkInDate);
        const checkOutDate = new Date(validatedData.checkOutDate);

        if (checkInDate >= checkOutDate) {
            return NextResponse.json(
                { error: "Check-out date must be after check-in date" },
                { status: 400 }
            );
        }

        // Check if room exists and is active
        const roomResults = await db
            .select()
            .from(rooms)
            .where(eq(rooms.id, validatedData.roomId));

        if (roomResults.length === 0) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        const room = roomResults[0];

        if (!room.isActive) {
            return NextResponse.json(
                { error: "Room is not available" },
                { status: 400 }
            );
        }

        // Check for overlapping bookings
        const conflictingBookings = await db
            .select()
            .from(bookings)
            .where(and(
                eq(bookings.roomId, validatedData.roomId),
                eq(bookings.isActive, true),
                eq(bookings.status, "confirmed"),
                or(
                    and(
                        lte(bookings.checkInDate, checkInDate.toISOString().split('T')[0]),
                        gte(bookings.checkOutDate, checkInDate.toISOString().split('T')[0])
                    ),
                    and(
                        lte(bookings.checkInDate, checkOutDate.toISOString().split('T')[0]),
                        gte(bookings.checkOutDate, checkOutDate.toISOString().split('T')[0])
                    ),
                    and(
                        gte(bookings.checkInDate, checkInDate.toISOString().split('T')[0]),
                        lte(bookings.checkOutDate, checkOutDate.toISOString().split('T')[0])
                    )
                )
            ));

        if (conflictingBookings.length > 0) {
            return NextResponse.json(
                { error: "Room is already booked for the selected dates" },
                { status: 409 }
            );
        }

        // Calculate total amount
        const nights = Math.ceil(
            (checkOutDate.getTime() - checkInDate.getTime()) /
                (1000 * 60 * 60 * 24)
        );
        const totalAmount = parseFloat(room.pricePerNight.toString()) * nights;

        // Create the booking - use the existing test user ID for now
        // TODO: Replace with actual user ID from session
        const tempUserId = "zSfvRaYHc7MbVz-4hWoEY"; // This is the ID from our test user
        const newBooking = await db
            .insert(bookings)
            .values({
                roomId: validatedData.roomId,
                userId: tempUserId,
                checkInDate: checkInDate.toISOString().split('T')[0],
                checkOutDate: checkOutDate.toISOString().split('T')[0],
                guestName: validatedData.guestName,
                guestEmail: validatedData.guestEmail,
                notes: validatedData.notes,
                totalAmount,
                status: "confirmed",
            })
            .returning();

        return NextResponse.json(newBooking[0], { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error creating booking:", error);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 }
        );
    }
}