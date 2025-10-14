# Frontend Guideline Document

This document outlines the frontend architecture, design principles, and technologies used in the hotel-room-booking application. It’s written in everyday language so that anyone—from designers to new developers—can understand how our frontend is organized and how to work with it.

## 1. Frontend Architecture

**Framework & Language**
- We use **Next.js** (App Router) paired with **React** and **TypeScript**. Next.js gives us file-based routing, server and client components, and built-in support for API routes.

**Key Libraries**
- **shadcn/ui**: A set of pre-built, accessible React components that speed up UI development.
- **Tailwind CSS**: A utility-first CSS framework that lets us style quickly without writing custom CSS every time.
- **Better Auth**: Handles sign-in/sign-up and session management.

**How It Supports Our Goals**
- **Scalability**: The file-based structure (with `/app`, `/components`, `/lib`) keeps concerns separated as the project grows. Adding new pages, components, or API routes is straightforward.
- **Maintainability**: TypeScript and Drizzle ORM (for database schemas) give us type safety. Mistakes in data shapes or queries are caught at compile time.
- **Performance**: Next.js server components and static rendering minimize client-side JavaScript. We lazy-load heavy components and optimize assets automatically.

## 2. Design Principles

1. **Usability**: Every page and form is built with clear labels, intuitive flows, and feedback (like toast messages). We avoid clutter and guide users through tasks step by step.
2. **Accessibility**: We use semantic HTML, ARIA roles, focus states, and keyboard navigation. All shadcn/ui components meet WCAG standards out of the box.
3. **Responsiveness**: Mobile-first approach ensures the UI works gracefully from small phones to large desktops. Tailwind’s responsive utilities make breakpoints easy to manage.
4. **Consistency**: With a shared component library and design tokens (colors, fonts, spacing), all parts of the app look and behave the same.

## 3. Styling and Theming

**Approach & Methodology**
- We rely on **Tailwind CSS** for styling, leveraging its utility-first classes rather than writing custom CSS files. This keeps styles co-located with components.

**Theming**
- Dark mode is enabled via Tailwind’s `dark:` variants. A toggle in the header switches the `class` on `<html>`, applying dark styles everywhere.

**Visual Style**
- Clean, **modern flat design** with soft shadows and rounded corners. Some elements (like cards) use light **glassmorphism** effects (semi-transparent backgrounds with subtle blur).

**Color Palette**
- Primary: #3B82F6 (blue)
- Secondary: #10B981 (green)
- Accent: #F59E0B (amber)
- Background Light: #F9FAFB
- Background Dark: #1F2937
- Text Light: #111827
- Text Dark: #F3F4F6

**Font**
- We use **Inter** (via Google Fonts) for its readability and modern look.

## 4. Component Structure

**Directory Layout**
- `/app`: Next.js App Router files. Each folder here maps to a route, with optional `layout.tsx` files for nested layouts.
- `/components`: Reusable UI pieces (forms, cards, tables, modals). Example: `RoomForm.tsx`, `RoomList.tsx`, `AvailabilityCalendar.tsx`.
- `/lib`: Utilities and shared logic (auth helpers, API clients).
- `/db`: Drizzle ORM schema definitions for `users`, `rooms`, `bookings`.

**Why Component-Based?**
- Breaking the UI into small, self-contained pieces makes it easy to test, reuse, and update. If you need a new form field or button style, you add or tweak one component rather than searching through dozens of pages.

## 5. State Management

- Local state is handled with React hooks (`useState`, `useEffect`). 
- Global or cross-cutting state (like the currently authenticated user, theme preference) is managed via React Context.
- We keep things simple—no heavy state libraries—because most of our data lives on the server and is fetched via Next.js data fetching.

## 6. Routing and Navigation

- **File-Based Routing**: Every folder under `/app` becomes a route. Example: `/app/dashboard/rooms/page.tsx` maps to `/dashboard/rooms`.
- **Nested Layouts**: Shared UI (like the dashboard sidebar) lives in a `layout.tsx` at `/app/dashboard/layout.tsx`, so all child pages inherit it.
- **Linking**: We use Next.js `<Link>` for client-side navigation and `<NavLink>` from shadcn/ui for styling active links.

## 7. Performance Optimization

1. **Server Components**: Fetch data on the server and send minimal JavaScript to the client.
2. **Code Splitting & Lazy Loading**: Heavy components (like charts or date pickers) are loaded only when needed using `next/dynamic`.
3. **Image Optimization**: Next.js `<Image>` automatically serves appropriately sized images.
4. **Tailwind Purge**: Unused CSS classes are removed in production builds, keeping CSS bundles small.
5. **Static Rendering**: Public pages (like the list of available rooms) use static generation when possible for blazing-fast load times.

## 8. Testing and Quality Assurance

- **Unit Tests**: Jest + React Testing Library for components and utility functions.
- **Integration Tests**: Test API routes and data fetching using supertest or MSW (Mock Service Worker).
- **End-to-End (E2E)**: Cypress for simulating user flows (e.g., admin registers a room, user views availability).
- **Linting & Formatting**: ESLint with TypeScript rules and Prettier to keep code consistent.
- **Type Checking**: Continuous TypeScript builds catch errors before merging.
- **Accessibility Checks**: Axe + jest-axe in unit tests to ensure basic WCAG compliance.

## 9. Conclusion and Overall Frontend Summary

This frontend is built to be **scalable**, **maintainable**, and **performant**. By using Next.js App Router, TypeScript, shadcn/ui, and Tailwind CSS, we ensure a rapid development experience and a consistent, accessible user interface. Server Components and Drizzle ORM give us type-safe data flows, while a simple hook/context state model keeps the app lightweight.

Unique aspects of our setup:
- Deep integration of **Next.js Server Components** and **Drizzle ORM** for direct, type-safe database queries.
- A shared **shadcn/ui** component library that ensures consistent look and accessibility.
- **Tailwind CSS** theming with dark mode out of the box.

Together, these guidelines form the foundation for building and extending your hotel room booking application with confidence and clarity.