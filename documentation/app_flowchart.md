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