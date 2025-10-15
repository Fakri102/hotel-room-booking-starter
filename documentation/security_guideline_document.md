# Security Guideline Document

# Security Guidelines for `hotel-room-booking-starter`

This document outlines mandatory security best practices tailored to the `hotel-room-booking-starter` repository. Adhere to these guidelines to ensure your hotel room registration and availability-monitoring application is secure, resilient, and maintainable.

---

## 1. Authentication & Access Control

- **Robust Password Policies**  
  - Enforce a minimum length (e.g., 12+ characters), complexity (upper/lowercase, digits, symbols), and disallow common passwords via a blocklist.  
  - Implement password rotation or expiration policies for administrative accounts.
- **Secure Hashing**  
  - Use Argon2 or bcrypt (with a unique per-password salt) for storing user passwords in PostgreSQL.
- **Session Management**  
  - If using session cookies, set `HttpOnly`, `Secure`, `SameSite=Strict` attributes.  
  - Enforce both idle and absolute timeouts (e.g., 15 min idle, 12 hr absolute).  
  - Regenerate session identifiers on privilege changes (login, logout) to prevent fixation.
- **JWT Best Practices** (if used)  
  - Use strong signing algorithms (e.g., `HS256` or `RS256`), avoid `none`.  
  - Validate `exp`, `iat`, and `aud`/`iss` claims server-side.  
  - Store secrets securely (see Section 3).
- **Multi-Factor Authentication (MFA)**  
  - Offer MFA (TOTP or push) for the admin role to protect sensitive endpoints.
- **Role-Based Access Control (RBAC)**  
  - Extend your users schema with an `isAdmin` boolean or a roles table.  
  - Perform server-side checks in every API route (`/api/rooms`, `/api/bookings`, dashboard pages) to ensure only admins can create/update/delete resources.

---

## 2. Input Handling & Processing

- **Server-Side Validation**  
  - Use Zod (or a similar schema-validation library) in Next.js API route handlers to enforce types and constraints on all incoming JSON payloads.  
  - Validate that `roomNumber` is unique, `pricePerNight` is a positive number, and booking dates are logical (`checkOutDate > checkInDate`).
- **Prevent Injection**  
  - Always use Drizzle ORM’s parameterized queries—never concatenate user input.  
  - For any raw SQL usage, sanitize inputs or prefer prepared statements.
- **Cross-Site Scripting (XSS) Prevention**  
  - Escape or encode dynamic content in React (`dangerouslySetInnerHTML` should be avoided).  
  - Adopt a strict Content Security Policy (CSP) header to restrict inline scripts and external resources.
- **Redirect Validation**  
  - If you implement redirects after login or logout, ensure the `next` parameter matches an allow-list of internal routes.
- **Secure File Uploads**  
  - If room images or documents are uploaded in the future, validate MIME type, file size limits, and store files outside the webroot (e.g., in an S3 bucket with presigned URLs).

---

## 3. Data Protection & Privacy

- **Encryption in Transit**  
  - Enforce HTTPS/TLS 1.2+ for all client–server and server–database connections.  
  - Redirect all HTTP requests to HTTPS in production (use HSTS header).
- **Encryption at Rest**  
  - Rely on PostgreSQL’s data-at-rest encryption or disk-level encryption for sensitive columns (e.g., PII).  
  - Consider application-level encryption (e.g., AES-256) for highly sensitive fields.
- **Secrets Management**  
  - Do not commit `.env` files to Git.  
  - Use a dedicated secrets vault (e.g., AWS Secrets Manager, HashiCorp Vault) to store DB credentials, JWT signing keys, and third-party API keys.  
  - Rotate secrets regularly and on suspicion of compromise.
- **Logging & Monitoring**  
  - Mask or omit PII (user emails, booking dates) in logs.  
  - Use a centralized, write-only log store (e.g., ELK stack, Datadog) and configure role-based access to logs.

---

## 4. API & Service Security

- **HTTPS Enforcement**  
  - Configure the front-end and API endpoints under Next.js to require TLS.  
  - Use `getServerSideProps` or Server Components over HTTPS to fetch data.
- **Rate Limiting & Throttling**  
  - Implement rate limiting (e.g., 100 requests/minute per IP) for all public and authenticated endpoints to mitigate brute-force and DoS attacks.
- **CORS Configuration**  
  - Restrict `Access-Control-Allow-Origin` to your front-end domain(s) only.  
  - Disallow credentials on cross-origin requests that don’t require them.
- **API Versioning**  
  - Prefix routes with `/api/v1/…` to allow safe iterative changes and deprecations.
- **Least Privilege on DB User**  
  - Use a database role that has only the necessary privileges (SELECT/INSERT/UPDATE/DELETE) on the `users`, `rooms`, and `bookings` tables.  
  - Avoid using a superuser for application connections.

---

## 5. Web Application Security Hygiene

- **Security Headers**  
  - Content-Security-Policy (CSP): Restrict scripts, styles, and images to trusted sources.  
  - X-Frame-Options: `DENY` or `SAMEORIGIN` to prevent clickjacking.  
  - X-Content-Type-Options: `nosniff`.  
  - Referrer-Policy: `no-referrer-when-downgrade` or stricter.
- **CSRF Protection**  
  - For any state-changing form or fetch request, include anti-CSRF tokens (NextAuth or a custom synchronizer token).  
  - Verify tokens server-side before processing the request.
- **Cookie Security**  
  - Set all session/auth cookies with `Secure`, `HttpOnly`, and `SameSite=Strict` or `Lax` as appropriate.
- **Subresource Integrity (SRI)**  
  - If loading third-party scripts/styles via CDN, include integrity hashes to detect tampering.
- **Disable Client-Side Debug**  
  - Ensure `NEXT_PUBLIC_*` debugging flags are disabled in production builds.  
  - Remove or guard any `console.log` statements that reveal internal logic.

---

## 6. Infrastructure & Configuration Management

- **Hardened Server Configuration**  
  - Disable all unused server features (e.g., default Next.js diagnostics routes) in production.  
  - Remove default accounts and change all default passwords.
- **Port and Service Minimization**  
  - Expose only ports 80/443 (or the Next.js production port) and the necessary database port on internal networks.
- **Dependency & OS Updates**  
  - Regularly apply security patches to the host OS, Docker base images, Node.js, and PostgreSQL.
- **Restrictive File Permissions**  
  - Ensure application files are owned by a non-root user and have minimal permissions (e.g., 750 for directories, 640 for files).
- **Disable Debug in Production**  
  - Set `NODE_ENV=production` and disable Next.js React DevTools.  
  - Remove any `.env.local` or debug routes from the production image.

---

## 7. Dependency Management

- **Secure Dependencies**  
  - Vet all npm packages (`better-auth`, `drizzle-orm`, `shadcn/ui`, `tailwindcss`) for maintenance status and known vulnerabilities.  
  - Prefer official, actively maintained libraries.
- **Vulnerability Scanning**  
  - Integrate SCA tools (e.g., `npm audit`, Snyk, GitHub Dependabot) into your CI pipeline to detect and fail builds on high/critical issues.
- **Use Lockfiles**  
  - Commit `package-lock.json` to ensure reproducible installs and prevent unwanted version upgrades.
- **Minimize Attack Surface**  
  - Remove unused dependencies and only install packages required for production.

---

By integrating these security controls throughout your development lifecycle, you will ensure the `hotel-room-booking-starter` application remains robust against common threats and aligns with industry best practices. Always conduct periodic security reviews and update controls as new threats emerge.

---
**Document Details**
- **Project ID**: 92f98f0b-12b5-4786-bc48-10fca2a1f253
- **Document ID**: 81691679-4c2d-4fbb-be46-cef86fb184ae
- **Type**: custom
- **Custom Type**: security_guideline_document
- **Status**: completed
- **Generated On**: 2025-10-14T10:50:34.677Z
- **Last Updated**: N/A
