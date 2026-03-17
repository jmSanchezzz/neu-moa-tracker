# NEU MOA Tracker

NEU MOA Tracker is a web-based Memorandum of Agreement (MOA) management system developed for the Professional Elective course. It is designed to streamline and centralize the tracking of institutional partnerships at New Era University.

Built with Next.js and Firebase, the system transitions MOA management from scattered records to a secure, role-based digital environment. It provides university administrators and faculty with the tools needed to track active agreements, monitor expiration dates, and maintain a clear audit trail of all partnership activities.

## Live Demo
## https://neu-moa-tracker.vercel.app

## Core Features

* **Role-Based Access Control (RBAC):** Secure access tiers via `@neu.edu.ph` Google Sign-In, ensuring Admin, Faculty, and Student users only interact with appropriate data.
* **MOA Lifecycle Management:** * Create, edit, view, and securely archive (soft-delete) partnership records.
  * Automated tracking of MOA statuses (`PROCESSING`, `APPROVED`, `EXPIRED`).
* **Command Center Dashboard:** Real-time analytics displaying active agreements, processing queues, and critical expiring contracts.
* **Advanced Search & Filtering:** Quickly locate MOAs by company name, HTE ID, college department, or expiration timeline.
* **Audit Logging:** Comprehensive, automated tracking of all system modifications for security and oversight.

## Technology Stack

* **Frontend:** Next.js 15 (App Router), React 19, TypeScript
* **Styling & UI:** Tailwind CSS, Radix UI, shadcn/ui, Lucide React
* **Backend & Database:** Firebase Authentication, Firebase Firestore

## Setup & Installation

### Prerequisites
* Node.js v20 or later
* Access to the configured Firebase project (Authentication and Firestore enabled)

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory based on `.env.example`:
```env
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:9002](http://localhost:9002) in your browser to view the application.

## Author
**John Marc Sanchez**
