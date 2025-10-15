import { RoomStatusDashboard } from "@/components/RoomStatusDashboard"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage hotel rooms and monitor occupancy
        </p>
      </div>
      <RoomStatusDashboard />
    </div>
  )
}