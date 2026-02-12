# NEU MOA Tracker

A professional, high-density **Academic Enterprise** management system designed for tracking and monitoring Memoranda of Agreement (MOA) at New Era University.

## 🚀 Overview

The NEU MOA Tracker serves as a centralized "Admin Command Center" for institutional partnerships. It provides real-time monitoring of agreement statuses, comprehensive user access management, and AI-powered intelligent search capabilities.

## ✨ Features

### 📊 Admin Command Center
- **Dynamic Stats:** Monitor Active, Processing, and Expiring agreements with trend indicators.
- **Master Data Table:** High-density grid for tracking company entities, industry segments, and effective dates.
- **Advanced Filtering:** Filter by College, Industry, and Status with global search.
- **Seeding Tool:** Ability for Admins to populate the system with sample institutional records for testing.

### 🔐 IAM Management (Identity & Access Management)
- **Role-Based Access Control (RBAC):** Three distinct access levels:
  - **ADMIN:** Full system control, user management, and audit logs.
  - **FACULTY:** Access to records with optional "Elevated Edit Rights."
  - **STUDENT:** Read-only access to approved agreements.
- **Account Controls:** Instantly block/unblock users and manage granular permissions.

### 🤖 Intelligent Features
- **AI Search Suggestions:** Integrated with **Genkit** to provide suggestive search terms based on partial queries or industry relationships.
- **Audit Trails:** Systematic logging of all create, edit, and delete operations.
- **Soft Delete:** Archive records to a "Trash" state for review before permanent removal.

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI (Radix UI)
- **Icons:** Lucide React
- **Backend/Database:** Firebase Firestore
- **Authentication:** Firebase Auth (Institutional Email restricted to `@neu.edu.ph`)
- **AI Engine:** Google Genkit (Gemini 2.5 Flash)

## 🧪 Testing & Access Levels

The system is configured for manual institutional email entry to facilitate testing of different access levels. 

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `johnmarc.sanchez@neu.edu.ph` | Full Access, Seed Data, IAM Control |
| **Faculty** | `faculty@neu.edu.ph` | View All, Edit Records (enabled by default) |
| **Student** | `student@neu.edu.ph` | Read-only access to Approved records |

*Note: Any new `@neu.edu.ph` email entered will default to a Student profile.*

## 📂 Project Structure

- `src/app`: Next.js pages and layouts.
- `src/components`: Reusable UI components (ShadCN and custom).
- `src/firebase`: Firebase configuration, hooks, and non-blocking update utilities.
- `src/ai`: Genkit flows and AI prompt definitions.
- `src/lib`: Mock data, types, and utility functions.

## 🎨 Design System

The application follows an **Academic Enterprise** aesthetic:
- **Primary Blue:** `#0d73d9`
- **Background Light:** `#f5f7f8`
- **NEU Navy:** `#001F3F` (Sidebar & Headers)
- **NEU Gold:** `#D4AF37` (Accents & Highlights)

---

Official Academic Enterprise System | Restricted Access • Monitoring Enabled