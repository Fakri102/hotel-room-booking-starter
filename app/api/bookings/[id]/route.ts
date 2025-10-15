import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

// GET /api/bookings/[id] - Get a specific booking
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const bookingId = parseInt(resolvedParams.id);
        if (isNaN(bookingId)) {
            return NextResponse.json(
                { error: "Invalid booking ID" },
                { status: 400 }
            );
        }

        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
            with: {
                room: true,
            },
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // Check if user owns this booking or is admin
        // TODO: Add proper admin check when auth system is ready
        if (booking.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        return NextResponse.json(booking);
    } catch (error) {
        console.error("Error fetching booking:", error);
        return NextResponse.json(
            { error: "Failed to fetch booking" },
            { status: 500 }
        );
    }
}

// DELETE /api/bookings/[id] - Cancel a booking
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const resolvedParams = await params;
        const bookingId = parseInt(resolvedParams.id);
        if (isNaN(bookingId)) {
            return NextResponse.json(
                { error: "Invalid booking ID" },
                { status: 400 }
            );
        }

        // Check if booking exists and belongs to user or user is admin
        const booking = await db.query.bookings.findFirst({
            where: eq(bookings.id, bookingId),
        });

        if (!booking) {
            return NextResponse.json(
                { error: "Booking not found" },
                { status: 404 }
            );
        }

        // TODO: Add proper admin check when auth system is ready
        if (booking.userId !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Check if booking is in the future (can only cancel future bookings)
        const checkInDate = new Date(booking.checkInDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkInDate < today) {
            return NextResponse.json(
                { error: "Cannot cancel past bookings" },
                { status: 400 }
            );
        }

        // Soft delete by setting isActive to false and updating status
        const cancelledBooking = await db
            .update(bookings)
            .set({
                isActive: false,
                status: "cancelled",
                updatedAt: new Date(),
            })
            .where(eq(bookings.id, bookingId))
            .returning();

        return NextResponse.json({
            message: "Booking cancelled successfully",
            booking: cancelledBooking[0],
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 }
        );
    }
}