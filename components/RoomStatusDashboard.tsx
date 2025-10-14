"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Bed, Users, DollarSign } from "lucide-react";
import { RoomRegistrationForm } from "./RoomRegistrationForm";

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  pricePerNight: string;
  status: string;
  description?: string;
  amenities?: string;
  createdAt: string;
  updatedAt: string;
  isAvailable: boolean;
  activeBookingsCount: number;
}

export function RoomStatusDashboard() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      
      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }
      
      const roomsData = await response.json();
      setRooms(roomsData);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to load rooms data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRooms();
  };

  const handleRoomCreated = () => {
    fetchRooms();
  };

  const getStatusBadgeVariant = (status: string, isAvailable: boolean) => {
    if (!isAvailable) return "destructive";
    if (status === "maintenance") return "secondary";
    if (status === "out_of_order") return "outline";
    return "default";
  };

  const getStatusText = (status: string, isAvailable: boolean) => {
    if (!isAvailable) return "Occupied";
    if (status === "maintenance") return "Maintenance";
    if (status === "out_of_order") return "Out of Order";
    return "Available";
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "single": return "text-blue-600";
      case "double": return "text-green-600";
      case "suite": return "text-purple-600";
      case "deluxe": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(room => room.isAvailable).length;
  const occupiedRooms = totalRooms - availableRooms;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Room Status Dashboard</h2>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Room Status Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor room availability and manage hotel rooms
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <RoomRegistrationForm onRoomCreated={handleRoomCreated} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
            <p className="text-xs text-muted-foreground">
              Registered rooms
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{availableRooms}</div>
            <p className="text-xs text-muted-foreground">
              Ready for booking
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupied</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{occupiedRooms}</div>
            <p className="text-xs text-muted-foreground">
              Currently booked
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <p className="text-xs text-muted-foreground">
              Current occupancy
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Room List</CardTitle>
          <CardDescription>
            All registered rooms and their current availability status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <Bed className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No rooms registered</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by adding your first room.
              </p>
              <div className="mt-6">
                <RoomRegistrationForm onRoomCreated={handleRoomCreated} />
              </div>
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
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.roomNumber}</TableCell>
                    <TableCell>
                      <span className={`capitalize font-medium ${getRoomTypeColor(room.type)}`}>
                        {room.type}
                      </span>
                    </TableCell>
                    <TableCell>{room.capacity} guests</TableCell>
                    <TableCell>${room.pricePerNight}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(room.status, room.isAvailable)}>
                        {getStatusText(room.status, room.isAvailable)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {room.description || "-"}
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