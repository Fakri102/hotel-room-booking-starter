# AI Development Agent Guidelines

## Project Overview
**Project:** hotel-room-booking-starter
**** ## Comprehensive Repository Summary: `hotel-room-booking-starter` (Enhanced for Your Project Goals)

This repository, `hotel-room-booking-starter`, serves as a robust and well-structured starter template for building a full-stack hotel room booking application. It provides a foundational setup that accelerates development by integrating key modern web technologies, offering a solid base for user authentication, a structured UI, and database interaction. This analysis has been enhanced to directly address your goal of building an application to **register rooms and monitor empty rooms**.

### 1. What this codebase does (purpose and functionality)

The primary purpose of this codebase is to provide a ready-to-use boilerplate for a hotel room booking application. It handles the fundamental aspects required for such an application, allowing you to focus on your core business logic—room and booking management—rather than infrastructure setup. For your specific project, this starter provides the perfect launchpad.

Its core functionalities include:

*   **User Authentication:** Secure sign-up and sign-in processes are implemented using Better Auth. This is essential for creating an admin role to manage room registrations.
*   **Protected Dashboard:** A dedicated `dashboard` area accessible only to authenticated users. This is the ideal place to build the administrative interface for **registering new rooms** and viewing booking statuses.
*   **Modern User Interface:** Integrates `shadcn/ui` components for a pre-styled, accessible, and responsive UI, which will help you quickly build forms for room registration and tables/cards for **displaying available rooms**.
*   **Database Foundation:** Sets up a PostgreSQL database connection with Drizzle ORM. This provides the type-safe foundation you need to define your `rooms` and `bookings` tables and query them efficiently to **find empty rooms**.
*   **Theming:** Includes out-of-the-box dark mode support, a common feature in modern web applications.

### 2. Key Architecture and Technology Choices

The project leverages a modern and popular full-stack JavaScript ecosystem, which is highly suitable for your application's needs:

*   **Frontend & Backend Framework:** **Next.js (App Router)**: Provides a unified framework for both frontend rendering and backend API routes. The App Router and Server Components are particularly well-suited for efficiently fetching and displaying the list of available rooms from the database.
*   **Language:** **TypeScript**: Ensures type safety across the entire application. This will be critical as you define the data structures for your rooms (e.g., `price`, `capacity`, `type`) and bookings, preventing common errors.
*   **Authentication:** **Better Auth**: A library specifically chosen for its ease of integration. You can leverage its session management to easily protect the API routes and UI pages dedicated to room management.
*   **Database & ORM:** **PostgreSQL with Drizzle ORM**: This combination is a major asset for your project. PostgreSQL is a robust relational database ideal for handling the relationships between users, rooms, and bookings. Drizzle ORM will allow you to define these relationships in a type-safe TypeScript schema, making it straightforward to write queries for complex tasks like "find all rooms that do not have a booking between date X and date Y."
*   **UI Components:** **shadcn/ui**: A collection of re-usable, accessible, and highly customizable UI components. This will significantly speed up the development of your admin forms for registering rooms and the public-facing UI for displaying them.
*   **Styling:** **Tailwind CSS**: A utility-first CSS framework that enables rapid UI development.
*   **State Management:** Primarily **React hooks (`useState`, `useEffect`)** for local component state.
*   **Containerization:** **Docker**: Provides a `docker-compose.yml` for easily spinning up a local PostgreSQL instance, streamlining your development environment setup.

### 3. Main Components and how they interact

The codebase is logically structured, and you can easily extend this structure to add your required features.

*   **`/app` Directory:** The heart of the application.
    *   **`/app/(auth)`:** Handles user sign-in/sign-up.
    *   **`/app/dashboard`:** The protected area where you will build your **room management interface**. You could create a new route like `/app/dashboard/rooms/page.tsx` for this.
    *   **`/app/api/auth/[...all]/route.ts`:** Handles authentication. You will create new API routes here (e.g., `/app/api/rooms/route.ts`) for handling the creation, updating, and deletion of rooms.
*   **`/components` Directory:** Houses reusable React components. You will create new components here, such as `RoomForm.tsx`, `RoomList.tsx`, and `AvailabilityCalendar.tsx`, using the existing `shadcn/ui` primitives.
*   **`/lib` Directory:** Contains utility functions and core logic. The existing `auth.ts` is a great example of how to structure your core logic.
*   **`/db` Directory:** This is where you will define your application's data model.
    *   **`/db/schema/auth.ts`:** Defines the existing authentication schema.
    *   **Your Task:** You will create new files here, like `/db/schema/rooms.ts` and `/db/schema/bookings.ts`, to define the tables and relationships needed for your application.
*   **`/documentation` Directory:** Contains project documentation.

**Interaction Flow Example (Admin Registering a Room):**

1.  An admin user signs in and navigates to the `/dashboard/rooms` page.
2.  `app/dashboard/rooms/page.tsx` renders a form (e.g., your `RoomForm.tsx` component) to add a new room.
3.  Upon form submission, a client component makes a `POST` request to your new API endpoint, `/api/rooms`.
4.  Your new route handler at `app/api/rooms/route.ts` receives the request. It first verifies the user is an authenticated admin using `Better Auth`.
5.  The handler then uses Drizzle to insert the new room data into the `rooms` table in the PostgreSQL database.
6.  The API responds with a success message, and the UI updates to show the newly registered room.

### 4. Notable Patterns, Configurations, or Design Decisions

The patterns in this starter are highly relevant to your goals:

*   **Next.js App Router & Server Components:** This pattern is ideal for your "monitor empty rooms" feature. You can create a Server Component that directly queries the database for available rooms and renders the list, resulting in a fast, SEO-friendly page with minimal client-side JavaScript.
*   **Component-Driven UI:** The use of `shadcn/ui` means you can build a professional-looking room management dashboard and booking interface quickly and consistently.
*   **Type-Safe Development:** The combination of TypeScript and Drizzle is a powerful advantage. It will ensure that your database queries for finding available rooms are correct at build time, preventing runtime errors related to complex date-based logic.
*   **Environment Variable Management:** Utilizes `.env` files for secure configuration.
*   **Modular Authentication:** `Better Auth` is integrated cleanly, making it easy to protect your new room management API endpoints and pages.
*   **Docker for Development:** Simplifies setting up your PostgreSQL database, so you can immediately start defining your `rooms` and `bookings` schemas.

### 5. Overall Code Structure and Organization

The codebase's high degree of organization makes it an excellent foundation. The clear separation of concerns (UI in `/components`, API in `/app/api`, database in `/db`) means you can add your `rooms` and `bookings` logic in a clean, maintainable way without disrupting the existing structure.

### 6. Code Quality Observations and Recommendations

**Observations:**

*   **High Initial Quality:** The code is clean and follows modern best practices, providing a solid, professional base for your project.
*   **Strong Typing:** Excellent use of TypeScript, which will be invaluable when you implement your booking logic.
*   **Modular Design:** Good separation of concerns and componentization.

**Recommendations Tailored to Your Goals:**

*   **Comprehensive Error Handling:** Implement robust error handling for key user flows. For example, handle cases where an admin tries to register a room with a duplicate room number or a user tries to book a room that is no longer available.
*   **Logging:** Introduce a structured logging solution to monitor API requests for room creation and booking attempts, which will be crucial for debugging.
*   **Testing Strategy:** As you build, implement a testing strategy. Focus on unit tests for your database queries (e.g., does the "find empty rooms" query work correctly?) and integration tests for the end-to-end flow of an admin registering a room.
*   **Role-Based Access Control (RBAC):** To properly secure your room registration feature, you'll need to extend the user model. A simple approach is to add an `isAdmin` boolean flag to the `users` schema in `/db/schema/auth.ts` and check this flag in your API routes and dashboard pages.

### 7. Actionable Next Steps to Build Your Features

This starter has laid the groundwork. Here are the key areas to extend to achieve your specific goals:

*   **1. Implement Room and Booking Schemas:** This is your first and most important step.
    *   In the `/db/schema/` directory, create a `rooms.ts` file to define your `rooms` table (e.g., with columns for `id`, `roomNumber`, `type`, `pricePerNight`, `capacity`).
    *   Create a `bookings.ts` file to define the `bookings` table (e.g., with `id`, `roomId`, `userId`, `checkInDate`, `checkOutDate`).
    *   Use Drizzle's relation helpers to define the relationships between users, rooms, and bookings.
*   **2. Build the Room Management API:**
    *   Create a new route handler at `/app/api/rooms/[...slug]/route.ts` to handle full CRUD (Create, Read, Update, Delete) operations for rooms.
    *   Secure these endpoints to ensure only authenticated admins can access them.
*   **3. Develop the Admin UI:**
    *   Create new pages within the `/app/dashboard/` directory for managing rooms.
    *   Use `shadcn/ui` components to build forms for creating/editing rooms and a data table to display all registered rooms.
*   **4. Create the "Monitor Empty Rooms" Feature:**
    *   Build a public-facing page (e.g., `/app/rooms/page.tsx`) that displays available rooms.
    *   The core of this feature will be a Drizzle query that selects rooms that do not have an overlapping booking for a given date range. This logic will likely live in a server-side data-fetching function.
*   **5. Implement Input Validation:** Use a library like Zod to validate all incoming data to your API endpoints. This is crucial for ensuring that room prices are valid numbers and booking dates are logical (e.g., `checkOutDate` is after `checkInDate`).
*   **6. Enhance UI/UX:** For a better user experience, add loading states (skeletons) while fetching room data and use toast notifications to provide feedback after an admin successfully registers a room or a user makes a booking.

By following these steps, you can effectively leverage the strong foundation of the `hotel-room-booking-starter` to build your specific application features efficiently and with high quality.

## CodeGuide CLI Usage Instructions

This project is managed using CodeGuide CLI. The AI agent should follow these guidelines when working on this project.

### Essential Commands

#### Project Setup & Initialization
```bash
# Login to CodeGuide (first time setup)
codeguide login

# Start a new project (generates title, outline, docs, tasks)
codeguide start "project description prompt"

# Initialize current directory with CLI documentation
codeguide init
```

#### Task Management
```bash
# List all tasks
codeguide task list

# List tasks by status
codeguide task list --status pending
codeguide task list --status in_progress
codeguide task list --status completed

# Start working on a task
codeguide task start <task_id>

# Update task with AI results
codeguide task update <task_id> "completion summary or AI results"

# Update task status
codeguide task update <task_id> --status completed
```

#### Documentation Generation
```bash
# Generate documentation for current project
codeguide generate

# Generate documentation with custom prompt
codeguide generate --prompt "specific documentation request"

# Generate documentation for current codebase
codeguide generate --current-codebase
```

#### Project Analysis
```bash
# Analyze current project structure
codeguide analyze

# Check API health
codeguide health
```

### Workflow Guidelines

1. **Before Starting Work:**
   - Run `codeguide task list` to understand current tasks
   - Identify appropriate task to work on
   - Use `codeguide task update <task_id> --status in_progress` to begin work

2. **During Development:**
   - Follow the task requirements and scope
   - Update progress using `codeguide task update <task_id>` when significant milestones are reached
   - Generate documentation for new features using `codeguide generate`

3. **Completing Work:**
   - Update task with completion summary: `codeguide task update <task_id> "completed work summary"`
   - Mark task as completed: `codeguide task update <task_id> --status completed`
   - Generate any necessary documentation

### AI Agent Best Practices

- **Task Focus**: Work on one task at a time as indicated by the task management system
- **Documentation**: Always generate documentation for new features and significant changes
- **Communication**: Provide clear, concise updates when marking task progress
- **Quality**: Follow existing code patterns and conventions in the project
- **Testing**: Ensure all changes are properly tested before marking tasks complete

### Project Configuration
This project includes:
- `codeguide.json`: Project configuration with ID and metadata
- `documentation/`: Generated project documentation
- `AGENTS.md`: AI agent guidelines

### Getting Help
Use `codeguide --help` or `codeguide <command> --help` for detailed command information.

---
*Generated by CodeGuide CLI on 2025-10-15T10:21:11.626Z*
