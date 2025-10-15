"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoomRegistrationForm } from "./RoomRegistrationForm";
import { Room } from "@/db/schema/rooms";
import { Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";

interface RoomWithStatus extends Room {
    isAvailable: boolean;
    currentBooking?: {
        guestName: string;
        checkOutDate: string;
    };
}

export function RoomStatusDashboard() {
    const [rooms, setRooms] = useState<RoomWithStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/rooms");
            if (!response.ok) {
                throw new Error("Failed to fetch rooms");
            }
            const roomsData = await response.json();
            setRooms(roomsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch rooms");
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (!confirm("Are you sure you want to delete this room?")) {
            return;
        }

        try {
            const response = await fetch(`/api/rooms/${roomId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete room");
            }

            toast.success("Room deleted successfully");
            fetchRooms(); // Refresh the room list
        } catch (err) {
            console.error("Error deleting room:", err);
            toast.error(err instanceof Error ? err.message : "Failed to delete room");
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.isAvailable).length;
    const occupiedRooms = totalRooms - availableRooms;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const getRoomTypeLabel = (type: string) => {
        const typeLabels: { [key: string]: string } = {
            single: "Single",
            double: "Double",
            suite: "Suite",
            deluxe: "Deluxe",
            presidential: "Presidential",
        };
        return typeLabels[type] || type;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="pb-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-red-600">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">{error}</p>
                    <Button onClick={fetchRooms} className="mt-4">
                        Try Again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRooms}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupied Rooms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{occupiedRooms}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{occupancyRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Room List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Room Status</CardTitle>
                        <CardDescription>
                            View and manage all hotel rooms
                        </CardDescription>
                    </div>
                    <RoomRegistrationForm />
                </CardHeader>
                <CardContent>
                    {rooms.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No rooms registered yet</p>
                            <RoomRegistrationForm />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Room Number</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Price/Night</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Current Guest</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">
                                            {room.roomNumber}
                                        </TableCell>
                                        <TableCell>
                                            {getRoomTypeLabel(room.type)}
                                        </TableCell>
                                        <TableCell>{room.capacity}</TableCell>
                                        <TableCell>${room.pricePerNight}</TableCell>
                                        <TableCell>
                                            <Badge variant={room.isAvailable ? "default" : "secondary"}>
                                                {room.isAvailable ? "Available" : "Occupied"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {room.currentBooking ? (
                                                <div className="text-sm">
                                                    <div className="font-medium">{room.currentBooking.guestName}</div>
                                                    <div className="text-gray-500">
                                                        Until {new Date(room.currentBooking.checkOutDate).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteRoom(room.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}