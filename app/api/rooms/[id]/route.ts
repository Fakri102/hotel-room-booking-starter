import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { rooms } from "@/db/schema/rooms";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

const updateRoomSchema = z.object({
    roomNumber: z.string().min(1, "Room number is required").optional(),
    type: z.string().min(1, "Room type is required").optional(),
    pricePerNight: z.number().positive("Price must be positive").optional(),
    capacity: z.number().int().positive("Capacity must be positive").optional(),
    isActive: z.boolean().optional(),
});

// GET /api/rooms/[id] - Get a specific room
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const roomId = parseInt(resolvedParams.id);
        if (isNaN(roomId)) {
            return NextResponse.json(
                { error: "Invalid room ID" },
                { status: 400 }
            );
        }

        const room = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!room) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(room);
    } catch (error) {
        console.error("Error fetching room:", error);
        return NextResponse.json(
            { error: "Failed to fetch room" },
            { status: 500 }
        );
    }
}

// PUT /api/rooms/[id] - Update a room (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // TODO: Add proper admin check when auth system is ready
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized. Admin access required." },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const roomId = parseInt(resolvedParams.id);
        if (isNaN(roomId)) {
            return NextResponse.json(
                { error: "Invalid room ID" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateRoomSchema.parse(body);

        // Check if room exists
        const existingRoom = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // If updating room number, check if it's already taken by another room
        if (validatedData.roomNumber) {
            const roomWithSameNumber = await db.query.rooms.findFirst({
                where: eq(rooms.roomNumber, validatedData.roomNumber),
            });

            if (roomWithSameNumber && roomWithSameNumber.id !== roomId) {
                return NextResponse.json(
                    { error: "Room number already exists" },
                    { status: 409 }
                );
            }
        }

        const updatedRoom = await db
            .update(rooms)
            .set({ ...validatedData, updatedAt: new Date() })
            .where(eq(rooms.id, roomId))
            .returning();

        return NextResponse.json(updatedRoom[0]);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Validation failed", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Error updating room:", error);
        return NextResponse.json(
            { error: "Failed to update room" },
            { status: 500 }
        );
    }
}

// DELETE /api/rooms/[id] - Delete a room (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        // TODO: Add proper admin check when auth system is ready
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized. Admin access required." },
                { status: 403 }
            );
        }

        const resolvedParams = await params;
        const roomId = parseInt(resolvedParams.id);
        if (isNaN(roomId)) {
            return NextResponse.json(
                { error: "Invalid room ID" },
                { status: 400 }
            );
        }

        // Check if room exists
        const existingRoom = await db.query.rooms.findFirst({
            where: eq(rooms.id, roomId),
        });

        if (!existingRoom) {
            return NextResponse.json(
                { error: "Room not found" },
                { status: 404 }
            );
        }

        // Soft delete by setting isActive to false
        const deletedRoom = await db
            .update(rooms)
            .set({ isActive: false, updatedAt: new Date() })
            .where(eq(rooms.id, roomId))
            .returning();

        return NextResponse.json({
            message: "Room deleted successfully",
            room: deletedRoom[0],
        });
    } catch (error) {
        console.error("Error deleting room:", error);
        return NextResponse.json(
            { error: "Failed to delete room" },
            { status: 500 }
        );
    }
}