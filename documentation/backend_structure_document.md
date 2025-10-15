# Backend Structure Document

# Backend Structure Document

This document outlines the complete backend setup for the hotel room booking application. It explains the architecture, database design, API structure, hosting choices, infrastructure components, security, and maintenance practices in everyday language.

## 1. Backend Architecture

### Overall Design

- The backend is built into the same Next.js project using the **App Router**. Server-side code lives alongside page code, and API routes are next to the UI that calls them.
- **TypeScript** provides type safety across all code, reducing bugs.
- **Drizzle ORM** is used to define and run database queries in a type-safe way.
- **Better Auth** handles user sessions and role checks.

### Design Patterns & Frameworks

- **Modular Structure**: Separate folders for API routes (`/app/api`), database schemas (`/db/schema`), UI components (`/components`), and utilities (`/lib`).
- **Server Components** (Next.js): Major data fetching and rendering happen on the server, keeping pages fast and SEO-friendly.
- **Client Components**: Used only for interactive elements (forms, tables).
- **ORM Layer**: Drizzle ORM shields raw SQL, automatically maps results to TypeScript types.

### Scalability, Maintainability & Performance

- **Scalability**: Serverless functions on Vercel automatically scale with traffic. The database is hosted on a managed service that can be resized.
- **Maintainability**: Clear separation of concerns and strong typing make it easy to add or update features with minimal risk.
- **Performance**: Server-side rendering and strategic caching (CDN and Redis) ensure pages and data load quickly.

## 2. Database Management

### Technologies Used

- Type: **SQL (Relational)**
- System: **PostgreSQL**
- ORM: **Drizzle ORM**

### Data Organization & Practices

- **Schemas in `/db/schema`**: Each table is defined in its own file (e.g., `auth.ts`, `rooms.ts`, `bookings.ts`).
- **Migrations**: Managed via Drizzle’s migration tooling to keep the database schema in sync across environments.
- **Connection Pooling**: Reusing database connections for efficiency.
- **Indexing**: Indexes on frequently filtered columns (e.g., `room_number`, `check_in_date`, `check_out_date`) to speed up searches.
- **Backups & Snapshots**: Automated daily backups of the PostgreSQL instance.

## 3. Database Schema

Below is the SQL definition of the main tables. This is a human-readable format that you can run directly against PostgreSQL.

```sql
-- Users table, including role-based flag
drop table if exists users cascade;
create table users (
  id serial primary key,
  email text not null unique,
  password_hash text not null,
  is_admin boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Rooms table to register each room in the hotel
drop table if exists rooms cascade;
create table rooms (
  id serial primary key,
  room_number varchar(50) not null unique,
  type varchar(100) not null,
  price_per_night numeric(10,2) not null,
  capacity integer not null,
  created_at timestamp with time zone default now()
);

-- Bookings table linking users and rooms with dates
drop table if exists bookings cascade;
create table bookings (
  id serial primary key,
  room_id integer not null references rooms(id) on delete cascade,
  user_id integer not null references users(id) on delete cascade,
  check_in_date date not null,
  check_out_date date not null,
  created_at timestamp with time zone default now(),
  constraint chk_dates check (check_out_date > check_in_date)
);

-- Indexes to speed up availability queries
create index idx_bookings_room_dates on bookings(room_id, check_in_date, check_out_date);
```  

## 4. API Design and Endpoints

### Approach: RESTful with Next.js Route Handlers

- All API routes live under **`/app/api`**.
- Each feature has its own file for clarity and modularity.

### Key Endpoints

1. **Authentication** (`/app/api/auth/route.ts`)
   - POST `/api/auth/signup` – Create a new user account.
   - POST `/api/auth/signin` – Log in and establish a session.
   - POST `/api/auth/signout` – Clear the session.

2. **Rooms Management** (`/app/api/rooms/route.ts`)
   - GET `/api/rooms` – List all rooms or filter by type, capacity.
   - POST `/api/rooms` – Create a new room (admin only).
   - PUT `/api/rooms/:id` – Update room details (admin only).
   - DELETE `/api/rooms/:id` – Remove a room (admin only).

3. **Bookings** (`/app/api/bookings/route.ts`)
   - GET `/api/bookings` – List bookings (can be filtered by user or room).
   - POST `/api/bookings` – Create a booking after checking availability.

### Communication Flow

- Frontend components call these endpoints using `fetch`.
- Middleware in each route verifies the user session and, for protected routes, checks `is_admin`.
- Drizzle ORM runs the actual SQL queries.

## 5. Hosting Solutions

- **Next.js App (API + Frontend)**: Hosted on **Vercel** as serverless functions.
  - Automatic global deployment and CDN caching for static assets.
  - Native support for Next.js App Router functions.

- **PostgreSQL Database**: Hosted on **AWS RDS** (PostgreSQL engine).
  - Multi-AZ deployment for high availability.
  - Automated backups and point-in-time recovery.

- **Local Development**: Docker Compose spins up PostgreSQL locally for fast iteration.

## 6. Infrastructure Components

- **Load Balancer**: Handled by Vercel, distributing requests across serverless instances.
- **Caching**
  - **CDN**: Vercel’s built-in CDN caches static assets and can cache API responses where safe.
  - **Redis (optional)**: AWS ElastiCache can be introduced for session or hot-data caching.
- **Content Delivery Network**: Vercel + Cloudflare in front for low latency worldwide.

## 7. Security Measures

- **Authentication & Authorization**
  - Sessions managed by Better Auth with secure, HTTP-only cookies.
  - Role-based access control: `is_admin` flag protects admin endpoints.
- **Data Encryption**
  - TLS (HTTPS) everywhere (Vercel auto-configured).
  - Encryption at rest for AWS RDS volumes.
- **Input Validation**
  - Zod schemas validate and sanitize all incoming request bodies.
- **Rate Limiting & DDOS Protection**
  - Vercel provides basic rate limiting and edge security.
- **Environment Variables**
  - Stored securely in Vercel and local `.env` files (never committed to Git).

## 8. Monitoring and Maintenance

- **Logging**
  - Structured logs from serverless functions collected in Vercel Analytics.
  - Optional integration with Sentry for error tracking.
- **Performance Monitoring**
  - Vercel’s built-in metrics dashboard shows response times and error rates.
  - Database metrics monitored via AWS CloudWatch.
- **Alerts & Alerts**
  - CloudWatch alarms for CPU, memory, and error thresholds on RDS.
  - Vercel can notify on deploy failures or spike in errors.
- **Maintenance Practices**
  - Regular Drizzle migrations applied via CI/CD.
  - Periodic dependency updates and security patching.

- **Unified Codebase**: Next.js App Router integrates UI and API for smoother development.
- **Type Safety**: TypeScript + Drizzle ORM catch errors early.
- **Modular APIs**: Clear, RESTful endpoints with role-based protection.
- **Robust Hosting**: Vercel for serverless functions and AWS RDS for managed PostgreSQL.
- **Strong Security**: End-to-end encryption, input validation, and role checks.
- **Monitoring & Maintenance**: Built-in analytics, logging, and automated backups keep the system healthy.

This backend structure combines modern frameworks and cloud services to deliver a reliable, scalable, and secure foundation for your hotel booking application. Key strengths include:

- **Unified Codebase**: Next.js App Router integrates UI and API for smoother development.
- **Type Safety**: TypeScript + Drizzle ORM catch errors early.
- **Modular APIs**: Clear, RESTful endpoints with role-based protection.
- **Robust Hosting**: Vercel for serverless functions and AWS RDS for managed PostgreSQL.
- **Strong Security**: End-to-end encryption, input validation, and role checks.
- **Monitoring & Maintenance**: Built-in analytics, logging, and automated backups keep the system healthy.

Together, these components meet the project goals of registering rooms, preventing booking conflicts, and monitoring empty rooms in real time, all while maintaining clarity and ease of future expansion.

---
**Document Details**
- **Project ID**: 92f98f0b-12b5-4786-bc48-10fca2a1f253
- **Document ID**: b12d0ebb-3b67-4b5d-b4a8-362f3229421b
- **Type**: custom
- **Custom Type**: backend_structure_document
- **Status**: completed
- **Generated On**: 2025-10-14T10:49:43.045Z
- **Last Updated**: N/A
