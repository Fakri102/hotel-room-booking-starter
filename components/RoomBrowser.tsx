"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Room } from "@/db/schema/rooms";
import { toast } from "sonner";

export function RoomBrowser() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(false);
    const [checkIn, setCheckIn] = useState<Date>();
    const [checkOut, setCheckOut] = useState<Date>();
    const [searched, setSearched] = useState(false);

    const searchAvailableRooms = async () => {
        if (!checkIn || !checkOut) {
            toast.error("Please select both check-in and check-out dates");
            return;
        }

        if (checkIn >= checkOut) {
            toast.error("Check-out date must be after check-in date");
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                checkIn: checkIn.toISOString().split('T')[0],
                checkOut: checkOut.toISOString().split('T')[0],
            });

            const response = await fetch(`/api/rooms?${params}`);
            if (!response.ok) {
                throw new Error("Failed to fetch available rooms");
            }

            const availableRooms = await response.json();
            setRooms(availableRooms);
            setSearched(true);
        } catch (error) {
            console.error("Error searching rooms:", error);
            toast.error("Failed to search available rooms");
        } finally {
            setLoading(false);
        }
    };

    const handleBookRoom = async (room: Room) => {
        // This would typically open a booking form or redirect to booking page
        // For now, we'll show a message
        toast.success(`Booking process for room ${room.roomNumber} would start here`);
    };

    const getRoomTypeLabel = (type: string) => {
        const typeLabels: { [key: string]: string } = {
            single: "Single Room",
            double: "Double Room",
            suite: "Suite",
            deluxe: "Deluxe Room",
            presidential: "Presidential Suite",
        };
        return typeLabels[type] || type;
    };

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const calculateTotalPrice = (pricePerNight: number) => {
        const nights = calculateNights();
        return pricePerNight * nights;
    };

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Find Available Rooms</CardTitle>
                    <CardDescription>
                        Search for available rooms by selecting your check-in and check-out dates
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="check-in">Check-in Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !checkIn && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {checkIn ? format(checkIn, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={checkIn}
                                        onSelect={setCheckIn}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="check-out">Check-out Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !checkOut && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {checkOut ? format(checkOut, "PPP") : "Pick a date"}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={checkOut}
                                        onSelect={setCheckOut}
                                        disabled={(date) => date < new Date() || date <= (checkIn || new Date())}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <Button
                        onClick={searchAvailableRooms}
                        className="w-full"
                        disabled={loading || !checkIn || !checkOut}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        {loading ? "Searching..." : "Search Available Rooms"}
                    </Button>
                </CardContent>
            </Card>

            {/* Results Section */}
            {searched && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">
                        {rooms.length > 0 ? `Available Rooms (${rooms.length})` : "No Available Rooms"}
                    </h2>
                    {checkIn && checkOut && (
                        <p className="text-muted-foreground">
                            {format(checkIn, "PPP")} - {format(checkOut, "PPP")} ({calculateNights()} nights)
                        </p>
                    )}

                    {rooms.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground mb-4">
                                    No rooms are available for the selected dates.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Try adjusting your dates or contact us directly for assistance.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {rooms.map((room) => (
                                <Card key={room.id} className="overflow-hidden">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">
                                                    Room {room.roomNumber}
                                                </CardTitle>
                                                <CardDescription>
                                                    {getRoomTypeLabel(room.type)}
                                                </CardDescription>
                                            </div>
                                            <Badge variant="outline">
                                                ${room.pricePerNight}/night
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                            <div className="flex items-center">
                                                <Users className="mr-1 h-4 w-4" />
                                                {room.capacity} guests
                                            </div>
                                            <div className="flex items-center">
                                                <DollarSign className="mr-1 h-4 w-4" />
                                                {calculateNights()} nights
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm text-muted-foreground">Total</span>
                                                <span className="text-lg font-bold">
                                                    ${calculateTotalPrice(parseFloat(room.pricePerNight.toString()))}
                                                </span>
                                            </div>
                                            <Button
                                                className="w-full"
                                                onClick={() => handleBookRoom(room)}
                                            >
                                                Book Now
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}