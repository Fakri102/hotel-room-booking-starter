# App Flowchart

flowchart TD
    Start[User opens app] --> AuthCheck
    AuthCheck{User logged in} -->|Yes| Dashboard
    AuthCheck -->|No| LoginPage
    LoginPage -->|Submit credentials| AuthAPI
    AuthAPI --> AuthCheck

    Dashboard --> RoomsPage[Manage Rooms]
    RoomsPage --> RoomForm[Room Form]
    RoomForm --> CreateRoomAPI[/POST api rooms/]
    CreateRoomAPI --> AuthMiddleware
    AuthMiddleware --> RoomDB[Drizzle ORM DB Operation]
    RoomDB --> RoomsPage

    Dashboard --> BookingsPage[Manage Bookings]
    BookingsPage --> BookingForm[Booking Form]
    BookingForm --> CreateBookingAPI[/POST api bookings/]
    CreateBookingAPI --> AuthMiddleware
    AuthMiddleware --> BookingDB[Drizzle ORM DB Operation]
    BookingDB --> BookingsPage

    PublicPage[Public Room Listing] --> AvailableRooms[Available Rooms Page]
    AvailableRooms --> QueryRooms[Server Component Query DB]
    QueryRooms --> RoomDB

---
**Document Details**
- **Project ID**: 92f98f0b-12b5-4786-bc48-10fca2a1f253
- **Document ID**: 1cac2826-18cf-4853-a631-ac9c1b5ff3bb
- **Type**: custom
- **Custom Type**: app_flowchart
- **Status**: completed
- **Generated On**: 2025-10-14T10:50:16.149Z
- **Last Updated**: N/A
