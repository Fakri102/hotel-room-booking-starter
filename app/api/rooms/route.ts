import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { rooms, bookings } from "@/db/schema/rooms";
import { eq, and, or, lt, gte } from "drizzle-orm";
import { createRoomSchema } from "@/lib/validations/room";

// GET /api/rooms - Fetch all rooms with availability status
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const allRooms = await db.select().from(rooms);

    // For each room, check if it's currently available
    const roomsWithAvailability = await Promise.all(
      allRooms.map(async (room) => {
        const now = new Date();
        
        // Check if there are any active bookings for this room
        const activeBookings = await db
          .select()
          .from(bookings)
          .where(
            and(
              eq(bookings.roomId, room.id),
              eq(bookings.status, "confirmed"),
              lt(bookings.checkInDate, now),
              gte(bookings.checkOutDate, now)
            )
          );

        const isAvailable = activeBookings.length === 0;

        return {
          ...room,
          isAvailable,
          activeBookingsCount: activeBookings.length,
        };
      })
    );

    return NextResponse.json(roomsWithAvailability);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

// POST /api/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // For now, we'll assume all authenticated users can create rooms
    // In a real app, you might want to check for admin role
    const body = await request.json();
    
    // Validate the request body
    const validatedData = createRoomSchema.parse(body);

    // Check if room number already exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.roomNumber, validatedData.roomNumber))
      .limit(1);

    if (existingRoom.length > 0) {
      return NextResponse.json(
        { error: "Room with this number already exists" },
        { status: 409 }
      );
    }

    // Create the new room
    const newRoom = await db
      .insert(rooms)
      .values({
        roomNumber: validatedData.roomNumber,
        type: validatedData.type,
        capacity: validatedData.capacity,
        pricePerNight: validatedData.pricePerNight.toString(),
        description: validatedData.description,
        amenities: validatedData.amenities ? JSON.stringify(validatedData.amenities) : null,
        status: "available",
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newRoom[0], { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid room data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}