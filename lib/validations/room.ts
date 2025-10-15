import { z } from "zod";

export const createRoomSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  type: z.enum(["single", "double", "suite", "deluxe"], {
    required_error: "Room type is required",
  }),
  capacity: z.number().min(1, "Capacity must be at least 1").max(10, "Capacity cannot exceed 10"),
  pricePerNight: z.number().min(0, "Price must be positive"),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;