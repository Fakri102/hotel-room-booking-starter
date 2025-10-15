import { RoomBrowser } from "@/components/RoomBrowser";

export default function RoomsPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Available Rooms</h1>
        <p className="text-muted-foreground">
          Search and book available hotel rooms for your stay
        </p>
      </div>
      <RoomBrowser />
    </div>
  )
}