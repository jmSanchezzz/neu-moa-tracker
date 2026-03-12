# NEU MOA Tracker

NEU MOA Tracker is a Next.js and Firebase application for managing Memoranda of Agreement (MOAs) at New Era University. The current build includes a role-aware dashboard, MOA CRUD workflows, admin-only IAM and audit pages, seeded demo data, and an optional Genkit-powered search suggestion flow.

## Overview

This project is built as an internal registry for institutional partnership records. Users type the local-part of their institutional email, complete Google Sign-In with the matching `@neu.edu.ph` account, and are routed to dashboards that match their access level.

The system currently centers on four areas:

- MOA record viewing, filtering, creation, editing, and soft delete.
- Role-based access for Admin, Faculty, and Student users.
- Admin pages for user access control, audit trail review, and sample-data seeding.
- AI-assisted search suggestions through Genkit and Gemini.

## Current System Behavior

### Authentication and Roles

- Login now uses Firebase Google Sign-In.
- Users type only the local-part of their NEU email on the login page, while the `@neu.edu.ph` suffix is fixed in the UI.
- The Google account selected during sign-in must exactly match the typed institutional email.
- Firebase Auth is now the source of truth for the signed-in identity and session persistence.
- Role assignment still defaults from the authenticated email for newly bootstrapped users:
  - Admin emails: `johnmarc.sanchez@neu.edu.ph`, `johnmarc@neu.edu.ph`, `admin@neu.edu.ph`
  - Faculty emails: `faculty@neu.edu.ph`, `professor@neu.edu.ph`
  - Any other `@neu.edu.ph` address defaults to Student
- User profiles are written to the `users` collection in Firestore.
- Existing Firestore user profiles continue to be used for blocked-state checks and persisted permissions.

### MOA Management

- Admin and Faculty users with edit rights can create MOA records.
- Admin and Faculty users with edit rights can edit existing MOA records.
- Records can be soft-deleted by setting `isDeleted: true`.
- The main MOA views support keyword search and college filtering.
- Expiring agreements can be filtered to those within the next 60 days.
- Status reporting is based on `PROCESSING`, `APPROVED`, and `EXPIRED`, with additional sub-status detail.

### Administration

- The admin dashboard shows high-level MOA stats and filtering controls.
- IAM Management lets admins block or restore users and toggle edit rights.
- Audit Logs reads the latest entries from the `audit_logs` collection.
- Settings includes a seed action that inserts sample MOA data and matching audit log entries.

### AI Search

- The MOA search UI includes an AI suggestion button.
- Suggestions are generated through a Genkit flow in [src/ai/flows/intelligent-moa-search.ts](src/ai/flows/intelligent-moa-search.ts).
- The configured model is Gemini 2.5 Flash in [src/ai/genkit.ts](src/ai/genkit.ts).
- AI suggestions are optional. The rest of the app works without using that feature.

## Implemented Pages

- [src/app/login/page.tsx](src/app/login/page.tsx): Fixed-domain institutional email input with Google Sign-In.
- [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx): Admin and Faculty command center.
- [src/app/dashboard/moas/page.tsx](src/app/dashboard/moas/page.tsx): MOA records view for all roles.
- [src/app/dashboard/users/page.tsx](src/app/dashboard/users/page.tsx): Admin-only IAM management.
- [src/app/dashboard/audit/page.tsx](src/app/dashboard/audit/page.tsx): Admin-only audit log viewer.
- [src/app/dashboard/settings/page.tsx](src/app/dashboard/settings/page.tsx): Admin control panel and seeding tools.

## Tech Stack

- Next.js 15 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Radix UI / shadcn-style components
- Firebase Auth and Firestore
- Genkit with `@genkit-ai/google-genai`
- Lucide React

## Local Development

### Prerequisites

- Node.js 20 or later is recommended.
- npm is used as the package manager.
- A Firebase project with Auth and Firestore enabled is required if you want full data persistence beyond local UI behavior.
- Google AI credentials are required only if you want the AI suggestion feature to work.

### Install

```bash
npm install
```

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
npm run genkit:dev
npm run genkit:watch
```

## Firebase Notes

- Firebase client config is defined in [src/firebase/config.ts](src/firebase/config.ts).
- Google must be enabled as a sign-in provider in Firebase Authentication for login to work.
- Firestore is the source of truth for users, MOA records, and audit logs.
- Security rules and index definitions are included in [firestore.rules](firestore.rules) and [firestore.indexes.json](firestore.indexes.json).
- The code expects collections such as `users`, `memoranda_of_agreement`, `audit_logs`, and `roles_admin`.

## Demo Access

Type one of these email local-parts on the login page, then choose the matching Google account during sign-in:

| Role | Email | Behavior |
| :--- | :--- | :--- |
| Admin | `johnmarc.sanchez` | Sign in as `johnmarc.sanchez@neu.edu.ph` for full access to dashboard, users, audit, settings, create/edit, and seed actions |
| Faculty | `faculty` | Sign in as `faculty@neu.edu.ph` for dashboard and MOA management with edit rights enabled by default |
| Student | `student` | Sign in as `student@neu.edu.ph` for the MOA records page with read-only behavior |

Any other `@neu.edu.ph` email signs in as a Student user.

## Repository Structure

- [src/app](src/app): Route segments, pages, and layouts.
- [src/components](src/components): Shared UI building blocks and feature components.
- [src/components/moa](src/components/moa): MOA dialogs, table, stats, and search UI.
- [src/components/dashboard](src/components/dashboard): Sidebar and dashboard-specific shell components.
- [src/firebase](src/firebase): Firebase initialization, hooks, providers, and non-blocking updates.
- [src/ai](src/ai): Genkit setup and AI flows.
- [src/lib](src/lib): Auth context, mock data, utility helpers, and placeholder assets.
- [docs](docs): Supporting project documents.

## Current Limitations

- Role defaults are still derived from hardcoded email mappings for newly bootstrapped users; they are not yet managed server-side.
- Some settings controls are presentational and do not yet persist configuration changes.
- The sidebar includes an archived/trash link, but the MOA page does not currently apply a dedicated deleted-record filter from the query string.
- AI search depends on external model credentials and availability.
