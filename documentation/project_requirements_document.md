# Project Requirements Document

# Project Requirements Document: Hotel Room Booking Application

## 1. Project Overview

This project is a full-stack hotel room booking application designed to let administrators register rooms, manage reservations, and give end users a way to view and book empty rooms. Admins sign up and sign in via a secure authentication system, then use a protected dashboard to create, update, and remove room records. On the public side, visitors can filter available rooms by date and make new bookings without seeing conflicting reservations.

We’re building this app to streamline room inventory management and minimize double-booking errors. Key objectives for v1 include:
- A role-based access control system that separates admin functions from public booking flows.
- A reliable availability query that only shows rooms free in a given date range.
- Safe, type-checked data interactions with the database to avoid runtime booking conflicts.

## 2. In-Scope vs. Out-of-Scope

### In-Scope (v1)
- User signup and login with a simple `isAdmin` flag for RBAC.
- Admin dashboard under `/dashboard` with CRUD operations on rooms and view of all bookings.
- Public-facing “Available Rooms” page where users pick check-in and check-out dates to see open inventory.
- Booking creation endpoint that checks for overlapping date ranges before saving.
- PostgreSQL schema definitions for `users`, `rooms`, and `bookings` using Drizzle ORM.
- Input validation via Zod on all API routes to guard against invalid data.
- UI built with Next.js App Router, shadcn/ui components, and Tailwind CSS (including dark mode).
- Containerized development environment using Docker Compose for PostgreSQL.

### Out-of-Scope (Future Phases)
- Payment gateway or credit card processing.
- Email or SMS notifications for booking confirmations.
- Room photos or file uploads.
- Rich search filters (price range, amenities) or sorting.
- Detailed reports or analytics dashboards.
- Multi-language support and complex i18n.
- Mobile apps or separate native clients.

## 3. User Flow

**Admin Journey:** An administrator visits `/login` or `/signup`, registers with an email/password and receives an `isAdmin` flag in their profile. Once logged in, they land on `/dashboard` and see a sidebar: “Rooms” and “Bookings.” Clicking “Rooms” loads a table of existing rooms plus an “Add Room” button. The admin fills out fields (room number, type, price, capacity) in a shadcn/ui form and submits—behind the scenes, the form POSTs to `/api/rooms`, which validates input via Zod, checks the session with Better Auth, and writes to the rooms table via Drizzle. A success toast appears, and the table refreshes. Under “Bookings,” the admin sees a list of all reservations, including check-in/out dates and linked user emails.

**Public User Journey:** A visitor lands on `/rooms` and sees date pickers for check-in and check-out. After selecting dates and hitting “Search,” a Server Component calls Drizzle to fetch rooms with no overlapping bookings in that period. Available rooms appear in cards with basic info and a “Book Now” button. Clicking it prompts login/signup if needed. After authentication, the same form collects user details and submits to `/api/bookings`. The server validates date logic, records the booking, and returns a confirmation message.

## 4. Core Features

- **Authentication & RBAC**: Better Auth handles signup/signin; `isAdmin` flag protects `/dashboard` routes and admin API endpoints.
- **Room Management (Admin)**: Full CRUD on rooms via `/api/rooms` and Next.js pages under `/dashboard/rooms` with shadcn/ui forms and tables.
- **Booking Module**: `/api/bookings` supports booking creation, referencing `roomId` and `userId`; enforces non-overlap server-side.
- **Availability Query**: Server Component at `/rooms` filters rooms by date range using Drizzle ORM relational queries.
- **Input Validation**: Zod schemas for room and booking payloads to ensure data integrity.
- **UI & Theming**: Consistent design using Tailwind CSS and shadcn/ui primitives, with dark/light mode toggle.
- **Database ORM**: Drizzle ORM for type-safe schema definitions in `/db/schema` (users, rooms, bookings).
- **Containerized Development**: Docker Compose with PostgreSQL and environment variables via `.env`.

## 5. Tech Stack & Tools

- Frontend & Backend Framework: Next.js (App Router) with React Server & Client Components.
- Language: TypeScript for end-to-end type safety.
- Authentication: Better Auth library for session management and RBAC.
- Database: PostgreSQL, managed via Drizzle ORM.
- Styling & UI Components: Tailwind CSS + shadcn/ui.
- Validation: Zod for runtime input checks.
- Containerization: Docker & docker-compose.
- IDE & Plugins (optional): Visual Studio Code with Drizzle extension, Zod plugin, and passenger-friendly GitLens. (Cursor, Windsurf can be integrated for AI-assisted coding.)

## 6. Non-Functional Requirements

- **Performance**: API responses under 200ms; page hydration under 1s on a CDN edge.
- **Security**: HTTPS only; session cookies flagged `HttpOnly` and `Secure`; input sanitized; RBAC enforced on every protected endpoint.
- **Usability**: Accessible (ARIA-compliant) shadcn/ui components; responsive layout tested down to 320px width; visible loading states and error messages.
- **Scalability**: Database indexed on `roomId`, `checkInDate`, `checkOutDate` for fast availability queries.
- **Maintainability**: Clear folder separation (`/app`, `/components`, `/db`, `/lib`); documented Zod schemas and Drizzle models.

## 7. Constraints & Assumptions

- **Node Environment**: Requires Node.js v18+ and Docker installed locally.
- **Auth Dependency**: Better Auth must support Next.js App Router sessions out of the box.
- **Database Availability**: PostgreSQL instance spun up via Docker Compose or remote service.
- **Date Handling**: All dates are treated in UTC; users accept date-only bookings.
- **Role Model**: Single boolean `isAdmin`; no further roles or permissions in v1.

## 8. Known Issues & Potential Pitfalls

- **Date Overlap Logic**: Ensuring no bookings overlap is tricky—must test edge cases (adjacent dates). Use Drizzle transactions and SQL `NOT BETWEEN` checks.
- **Time Zones**: If a user’s locale differs, date inputs might shift; keep the app strictly date-only.
- **Docker Port Conflicts**: Default PostgreSQL port 5432 may clash—document how to override it in `.env`.
- **Drizzle Limitations**: Complex joins can be verbose; consider raw SQL fallback for performance-critical queries.
- **Authentication Drift**: Ensure middleware runs on every protected route; missing middleware can expose admin endpoints.
- **Scaling Queries**: Large room or booking tables may slow down availability checks—add proper indexes early.

---

This document captures the full scope of v1 requirements, user journeys, major technical decisions, and potential challenges. It should serve as the single source of truth for all subsequent design and implementation artifacts.

---
**Document Details**
- **Project ID**: 92f98f0b-12b5-4786-bc48-10fca2a1f253
- **Document ID**: 8142e7b5-01b5-4b09-a8ff-3abacc69bc46
- **Type**: custom
- **Custom Type**: project_requirements_document
- **Status**: completed
- **Generated On**: 2025-10-14T10:49:20.904Z
- **Last Updated**: N/A
