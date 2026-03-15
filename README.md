# NEU MOA Tracker

NEU MOA Tracker is a Next.js and Firebase application for managing Memoranda of Agreement (MOAs) at New Era University. The current build includes a role-aware dashboard, full MOA CRUD workflows, archive/restore, status and college filtering, interactive stat cards, and admin-only IAM and audit pages.

## Overview

This project is an internal registry for institutional partnership records. Users type the local-part of their institutional email, complete Google Sign-In with the matching `@neu.edu.ph` account, and are routed to dashboards that match their access level.

The system centers on four areas:

- MOA record viewing, filtering, creation, editing, soft delete, and archive/restore.
- Role-based access for Admin, Faculty, and Student users.
- Admin pages for user access control (IAM) and audit trail review.
- An interactive Command Center dashboard with clickable stat cards.

## Current System Behavior

### Authentication and Roles

- Login uses Firebase Google Sign-In.
- Users type only the local-part of their NEU email on the login page; the `@neu.edu.ph` suffix is fixed in the UI.
- The Google account selected during sign-in must exactly match the typed institutional email.
- Firebase Auth is the source of truth for the signed-in identity and session persistence.
- Role assignment defaults from the authenticated email for newly bootstrapped users:
  - Admin emails: `johnmarc.sanchez@neu.edu.ph`, `johnmarc@neu.edu.ph`, `admin@neu.edu.ph`
  - Faculty emails: `faculty@neu.edu.ph`, `professor@neu.edu.ph`
  - Any other `@neu.edu.ph` address defaults to Student
- User profiles are written to the `users` Firestore collection.
- Prototype (anonymous) sign-in is supported for demo accounts using a custom provider bypass in Firestore rules.

### MOA Management

- Admin and Faculty users with edit rights can create and edit MOA records.
- Records are soft-deleted (`isDeleted: true`) rather than permanently removed.
- Soft-deleted records are moved to the **Archived / Trash** view, accessible from the sidebar.
- Archived records can be individually restored (`isDeleted: false`) with a full audit log entry.
- Every create, edit, delete, and restore action is written to the `audit_logs` Firestore collection.
- MOA records have a `primaryStatus` (`PROCESSING`, `APPROVED`, `EXPIRED`) and a `subStatus` for stage detail.
- Each MOA stores an `effectiveDate` and an `expirationDate`.

### MOA Directory (All Roles)

- Accessible at `/dashboard/moas`.
- Supports keyword search across company name and HTE ID.
- **Filter by College** dropdown filters results by the NEU college linked to the MOA.
- **Filter by Status** dropdown (Admin and Faculty only) filters by `PROCESSING`, `APPROVED`, or `EXPIRED`.
- **View Expiring (60 Days)** button (Admin and Faculty only) switches to a Firestore-backed query that returns only `APPROVED` records expiring within the next 60 days.
- Full record details are accessible via **View Details** for all roles.
- Students see only `APPROVED` records and a simplified 4-column table (Company Name, Address, Contact Person, Contact Email) with no action controls.
- The archive view (`?filter=deleted`) shows only soft-deleted records with a **Restore** action.

### Command Center Dashboard (Admin and Faculty)

- Accessible at `/dashboard`.
- Displays four clickable stat cards: **Active Agreements**, **Processing Queue**, **Critical Expiring**, and **Total Partners**.
- Clicking a card navigates to the MOA Directory pre-filtered to that status.
- Includes a full MOA table with search, college, industry, and status filters.
- Admin users can create new records directly from this page.

### Administration (Admin only)

- **IAM Management** — block or unblock users and toggle per-user edit rights.
- **System Audit Logs** — reads the latest entries from the `audit_logs` collection.
- **Control Panel** — configure default validity period and notification thresholds. Presentational controls that do not yet persist changes are clearly scoped.

## Implemented Pages

- [src/app/login/page.tsx](src/app/login/page.tsx): Fixed-domain institutional email input with Google Sign-In.
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx): Admin and Faculty command center with stats and full MOA table.
- [src/app/dashboard/moas/page.tsx](src/app/dashboard/moas/page.tsx): MOA Directory for all roles — normal and archive views.
- [src/app/dashboard/users/page.tsx](src/app/dashboard/users/page.tsx): Admin-only IAM management.
- [src/app/dashboard/audit/page.tsx](src/app/dashboard/audit/page.tsx): Admin-only audit log viewer.
- [src/app/dashboard/settings/page.tsx](src/app/dashboard/settings/page.tsx): Admin control panel.

## Tech Stack

- Next.js 15 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Firebase Auth and Firestore
- Lucide React

## Local Development

### Prerequisites

- Node.js 20 or later is recommended.
- npm is used as the package manager.
- A Firebase project with Auth and Firestore enabled is required for full data persistence.

### Install

```bash
npm install
```

### Environment

Create a `.env.local` file using `.env.example` as the template.

The app reads these public Firebase web config values:

```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
```

The current Firebase config in [src/firebase/config.ts](src/firebase/config.ts) uses these environment variables first and falls back to local defaults when they are not set.

### Run the app

```bash
npm run dev
```

The development server runs on port `9002`.

### Available scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
```

## Firebase Notes

- Firebase client config is in [src/firebase/config.ts](src/firebase/config.ts).
- `.env.local` is gitignored. Use `.env.example` as the tracked template.
- Firebase web config values are public client configuration, not admin secrets.
- Google must be enabled as a sign-in provider in Firebase Authentication.
- Firestore is the source of truth for users, MOA records, and audit logs.
- Security rules and composite index definitions are in [firestore.rules](firestore.rules) and [firestore.indexes.json](firestore.indexes.json).
- A composite index on `memoranda_of_agreement` (`primaryStatus ASC`, `expirationDate ASC`) is required for the expiring-soon query.
- Expected Firestore collections: `users`, `memoranda_of_agreement`, `audit_logs`, `roles_admin`.

## Vercel Deployment

1. Import the repository into Vercel.
2. Let Vercel detect the app as a Next.js project.
3. Add the same `NEXT_PUBLIC_FIREBASE_*` values from your local `.env.local` to the Vercel project environment variables.
4. Redeploy after saving the environment variables.
5. In Firebase Authentication, add your Vercel domain to the list of authorized domains.

The default scripts used by Vercel are already present in [package.json](package.json): `npm install` and `npm run build`.

## Demo Access

Type one of these email local-parts on the login page, then choose the matching Google account during sign-in:

| Role | Email | Access |
| :--- | :--- | :--- |
| Admin | `johnmarc.sanchez` | Full access — Command Center, MOA Directory, IAM, Audit Logs, Control Panel, create/edit/delete/restore |
| Faculty | `faculty` | Command Center, MOA Directory with create/edit rights, archive view |
| Student | `student` | MOA Directory (approved records only, read-only, simplified table) |

Any other `@neu.edu.ph` email signs in as a Student user.

## Repository Structure

- [src/app](src/app): Route segments, pages, and layouts.
- [src/components](src/components): Shared UI building blocks and feature components.
- [src/components/moa](src/components/moa): MOA dialogs, table, stats, and search UI.
- [src/components/dashboard](src/components/dashboard): Sidebar and dashboard shell components.
- [src/firebase](src/firebase): Firebase initialization, hooks, providers, and non-blocking updates.
- [src/lib](src/lib): Auth context, data types, utility helpers, and placeholder assets.
- [docs](docs): Supporting project documents.

## Current Limitations

- Role defaults are derived from hardcoded email mappings for newly bootstrapped users; server-side role management is not yet implemented.
- Some Control Panel settings (notification thresholds, default validity) are still presentational and do not persist, while Institutional Security toggles now persist.
