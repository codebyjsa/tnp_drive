# Training & Placement (TnP) Drive Management Portal

A centralized platform designed to streamline and automate Training & Placement drives across university departments. The system provides administration tools for managing student profiles, teacher coordinators, and company placement postings with strict schema validations and relational integrity.

---

## Table of Contents

- [Live Deployment & Demo Credentials](#live-deployment--demo-credentials)
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Project Setup](#project-setup)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation & Database Migration](#installation--database-migration)
  - [Running the Development Server](#running-the-development-server)
- [API Documentation](#api-documentation)
  - [Overview](#overview)
  - [1. GET `/api/admin`](#1-get-apiadmin)
  - [2. POST `/api/admin/student`](#2-post-apiadminstudent)
  - [3. POST `/api/admin/teacher`](#3-post-apiadminteacher)
  - [4. POST `/api/placement/post`](#4-post-apiplacementpost)
  - [5. GET `/api/placement/post`](#5-get-apiplacementpost)
- [Frontend Pages & UI Overview](#frontend-pages--ui-overview)
  - [1. Public Placement Drives Portal (`/`)](#1-public-placement-drives-portal-)
  - [2. Admin Authentication & Drive Posting Portal (`/admin`)](#2-admin-authentication--drive-posting-portal-admin)
- [Data Models Reference](#data-models-reference)
  - [Branch Enum](#branch-enum)
  - [JobType Enum](#jobtype-enum)

---

## Live Deployment & Demo Credentials

- **Live Web App**: [https://tnp-drive.vercel.app](https://tnp-drive-olive.vercel.app/) *(or your deployed Vercel domain)*
- **Admin Portal**: [https://tnp-drive.vercel.app/admin](https://tnp-drive-olive.vercel.app/admin)

### Demo Admin Credentials:
| Field | Value |
| :--- | :--- |
| **Email** | `davjasdeepsinghji9e17@gmail.com` |
| **Password** | `jsa@2006` |
| **Role** | Student Admin Coordinator (CSE, 4th Year) |

> [!NOTE]
> Alternative Superadmin account: `admin@tnp.edu` with password `admin@gndec2026`.

---

## Project Description

The **TnP Drive** system manages recruitment processes within an academic institution. It supports:
- **Admin Management**: Managing administrators who oversee students, faculty, and company placement drives.
- **Student Records**: Tracking student credentials including Roll Numbers (CRN/URN), branch/department, academic year, and placement eligibility.
- **Teacher/Coordinator Records**: Linking departmental teachers to the administrative workspace.
- **Placement Posts**: Scheduling and publishing company drive postings, job roles, eligibility criteria, and minimum CGPA requirements.

---

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **Database ORM**: [Prisma ORM](https://www.prisma.io) with PostgreSQL driver (`@prisma/adapter-pg` & `pg`)
- **Database**: PostgreSQL
- **Language**: JavaScript / Node.js
- **Validation & Utilities**: `uuid` (RFC-compliant UUID validation)

---

## Project Setup

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.17.0 or higher recommended)
- **npm**, **yarn**, or **pnpm**
- **PostgreSQL** instance running locally or via a cloud provider

### Environment Variables

Create a `.env` file in the root directory (or update the existing one) with your PostgreSQL connection URL:

```env
DATABASE_URL="postgres://<username>:<password>@<host>:<port>/<database_name>?schema=public"
```

*Example for local development:*
```env
DATABASE_URL="postgres://tnp:tnp@localhost:5432/tnp_local?schema=public"
```

### Installation & Database Migration

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client & Sync Database:**
   ```bash
   # Push schema directly to the database
   npx prisma db push

   # Or run migrations
   npx prisma migrate dev --name init

   # Generate Prisma client
   npx prisma generate
   ```

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Documentation

### Overview

- **Base URL**: `/api/admin`
- **Content-Type**: `application/json`
- **BigInt Handling**: All `BigInt` fields (such as `student_id`, `crn`, `urn`, `placement_id`) are automatically serialized as string values in JSON responses to prevent integer precision loss.

---

### 1. GET `/api/admin`

Fetches user records. Supports retrieving individual entities by their unique identifiers or returning all users grouped by category.

- **Method**: `GET`
- **Endpoint**: `/api/admin`
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `adminId` | `string` (UUID) | No | Fetches a specific Admin by ID, including their linked students and teachers. |
  | `studentId`| `string` / `number` | No | Fetches a specific Student by numeric ID, including linked Admin info. |
  | `teacherId`| `string` (UUID) | No | Fetches a specific Teacher by ID, including linked Admin info. |

#### Request Examples:
- Fetch all users: `GET /api/admin`
- Filter by single entity: `GET /api/admin?studentId=1`
- Filter across multiple: `GET /api/admin?adminId=b0a68d01-e283-4a1d-847d-2b36a3e5c9ef&studentId=1`

#### Response:

##### A. No filters provided (returns all users grouped) — `200 OK`
```json
{
  "admins": [
    {
      "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
      "admin_name": "TnP Admin",
      "admin_email": "admin@tnp.edu",
      "created_at": "2026-10-22T04:00:00.000Z",
      "updated_at": "2026-10-22T04:00:00.000Z"
    }
  ],
  "students": [
    {
      "student_id": "1",
      "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
      "student_name": "John Doe",
      "crn": "2101234",
      "urn": "2115678",
      "student_dept": "CSE",
      "student_year": 4,
      "created_at": "2026-10-22T04:30:00.000Z",
      "updated_at": "2026-10-22T04:30:00.000Z"
    }
  ],
  "teachers": [
    {
      "teacher_id": "c1f7a834-4b52-4e92-91f3-d5e67a8b9c0d",
      "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
      "teacher_name": "Dr. Sarah Connor",
      "teacher_dept": "CSE",
      "created_at": "2026-10-22T04:15:00.000Z",
      "updated_at": "2026-10-22T04:15:00.000Z"
    }
  ]
}
```

##### B. Single filter provided (e.g., `?studentId=1`) — `200 OK`
```json
{
  "student_id": "1",
  "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
  "student_name": "John Doe",
  "crn": "2101234",
  "urn": "2115678",
  "student_dept": "CSE",
  "student_year": 4,
  "created_at": "2026-10-22T04:30:00.000Z",
  "updated_at": "2026-10-22T04:30:00.000Z",
  "admin": {
    "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
    "admin_name": "TnP Admin",
    "admin_email": "admin@tnp.edu"
  }
}
```

##### C. Error Response — `400 Bad Request` or `404 Not Found`
```json
{
  "error": "Student with id \"999\" not found"
}
```

---

### 2. POST `/api/admin/student`

Registers a new student profile. Automatically creates an account in the Admin table using the provided `email` and `password`, and links the generated `admin_id` to the student record within a database transaction.

- **Method**: `POST`
- **Endpoint**: `/api/admin/student`
- **Headers**: `Content-Type: application/json`

#### Request Body Parameters:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Login email address (saved to `Admin` table; must be unique). |
| `password` | `string` | Yes | Account password (saved to `Admin` table). |
| `student_name` | `string` | Yes | Full name of the student (also used as admin name). |
| `crn` | `string` / `number` | Yes | College Roll Number (must be unique). |
| `urn` | `string` / `number` | Yes | University Roll Number (must be unique). |
| `student_dept` | `string` | Yes | Branch code (Must match [Branch Enum](#branch-enum), e.g. `CSE`). |
| `student_year` | `number` | Yes | Current year of study (positive integer, e.g. `1`, `2`, `3`, `4`). |

#### Example Request:
```json
{
  "email": "alice.johnson@tnp.edu",
  "password": "SecurePassword123!",
  "student_name": "Alice Johnson",
  "crn": "2201045",
  "urn": "2214089",
  "student_dept": "CSE",
  "student_year": 3
}
```

#### Example Response — `201 Created`:
```json
{
  "student_id": "2",
  "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
  "student_name": "Alice Johnson",
  "crn": "2201045",
  "urn": "2214089",
  "student_dept": "CSE",
  "student_year": 3,
  "created_at": "2026-10-22T05:00:00.000Z",
  "updated_at": "2026-10-22T05:00:00.000Z",
  "admin": {
    "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
    "admin_name": "Alice Johnson",
    "admin_email": "alice.johnson@tnp.edu"
  }
}
```

#### Error Responses:
- **`400 Bad Request`**: Validation error (missing fields, invalid branch, or non-integer roll numbers).
  ```json
  {
    "error": "Invalid student_dept: \"MECHANICAL\". Allowed values: CSE, IT, RAI, ME, CE, EE, ECE, BCA, MCA, BBA, MBA, BVoc, BArch"
  }
  ```
- **`409 Conflict`**: Email, CRN, or URN already in use.
  ```json
  {
    "error": "User with this email already exists"
  }
  ```

---

### 3. POST `/api/admin/teacher`

Registers a new departmental teacher coordinator. Automatically creates an account in the Admin table using the provided `email` and `password`, and links the generated `admin_id` to the teacher record within a database transaction.

- **Method**: `POST`
- **Endpoint**: `/api/admin/teacher`
- **Headers**: `Content-Type: application/json`

#### Request Body Parameters:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | `string` | Yes | Login email address (saved to `Admin` table; must be unique). |
| `password` | `string` | Yes | Account password (saved to `Admin` table). |
| `teacher_name` | `string` | Yes | Full name of the teacher (also used as admin name). |
| `teacher_dept` | `string` | Yes | Department/Branch of the teacher (e.g. `CSE`). |

#### Example Request:
```json
{
  "email": "alan.turing@tnp.edu",
  "password": "EnigmaPassword456!",
  "teacher_name": "Prof. Alan Turing",
  "teacher_dept": "CSE"
}
```

#### Example Response — `201 Created`:
```json
{
  "teacher_id": "e4a8b792-6f31-419b-bc83-918237d45610",
  "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
  "teacher_name": "Prof. Alan Turing",
  "teacher_dept": "CSE",
  "created_at": "2026-10-22T05:10:00.000Z",
  "updated_at": "2026-10-22T05:10:00.000Z",
  "admin": {
    "admin_id": "b0a68d01-e283-4a1d-847d-2b36a3e5c9ef",
    "admin_name": "Prof. Alan Turing",
    "admin_email": "alan.turing@tnp.edu"
  }
}
```

#### Error Responses:
- **`400 Bad Request`**: Missing required fields (`email`, `password`, `teacher_name`, or `teacher_dept`).
  ```json
  {
    "error": "teacher_name is required"
  }
  ```
- **`409 Conflict`**: Email already registered.
  ```json
  {
    "error": "User with this email already exists"
  }
  ```

---

### 4. POST `/api/placement/post`

Creates a new company placement drive post with job role details, eligibility criteria, and drive date.

- **Method**: `POST`
- **Endpoint**: `/api/placement/post`
- **Headers**: `Content-Type: application/json`

#### Request Body Parameters:
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `company_name` | `string` | Yes | Name of the hiring organization. |
| `job_role` | `string` | Yes | Job role / designation (e.g., `Software Engineer`). |
| `job_description` | `string` | Yes | Description of the job responsibilities and requirements. |
| `drive_date` | `string` | Yes | Date of placement drive in ISO 8601 format (e.g. `2026-11-20T10:00:00.000Z`). |
| `eligible_branches`| `string[]` | Yes | Non-empty array of branch codes matching [Branch Enum](#branch-enum). |
| `min_cgpa` | `number` | Yes | Minimum CGPA required (float between `0.0` and `10.0`). |
| `job_type` | `string` | Yes | Type of employment matching [JobType Enum](#jobtype-enum). |

#### Example Request:
```json
{
  "company_name": "Microsoft",
  "job_role": "Cloud Solutions Architect",
  "job_description": "Architecting Azure cloud services and enterprise infrastructure.",
  "drive_date": "2026-12-05T09:30:00.000Z",
  "eligible_branches": ["CSE", "IT", "ECE"],
  "min_cgpa": 7.5,
  "job_type": "FULL_TIME"
}
```

#### Example Response — `201 Created`:
```json
{
  "placement_id": "3",
  "company_name": "Microsoft",
  "job_role": "Cloud Solutions Architect",
  "job_description": "Architecting Azure cloud services and enterprise infrastructure.",
  "drive_date": "2026-12-05T09:30:00.000Z",
  "eligible_branches": ["CSE", "IT", "ECE"],
  "min_cgpa": 7.5,
  "job_type": "FULL_TIME",
  "created_at": "2026-10-22T13:35:42.463Z",
  "updated_at": "2026-10-22T13:35:42.463Z"
}
```

#### Error Responses:
- **`400 Bad Request`**: Missing required fields, invalid date, invalid branches, or invalid job type.
  ```json
  {
    "error": "min_cgpa must be a number between 0.0 and 10.0"
  }
  ```

---

### 5. GET `/api/placement/post`

Retrieves placement drive posts. Returns all placement posts ordered by creation date descending, or a single placement post if `placement_id` is specified as a query parameter.

- **Method**: `GET`
- **Endpoint**: `/api/placement/post`
- **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `placement_id` | `string` / `number` | No | Numeric ID of the specific placement post to retrieve. |

#### Request Examples:
- Fetch all posts: `GET /api/placement/post`
- Fetch specific post: `GET /api/placement/post?placement_id=3`

#### Example Response (Single Post) — `200 OK`:
```json
{
  "placement_id": "3",
  "company_name": "Microsoft",
  "job_role": "Cloud Solutions Architect",
  "job_description": "Architecting Azure cloud services and enterprise infrastructure.",
  "drive_date": "2026-12-05T09:30:00.000Z",
  "eligible_branches": ["CSE", "IT", "ECE"],
  "min_cgpa": 7.5,
  "job_type": "FULL_TIME",
  "created_at": "2026-10-22T13:35:42.463Z",
  "updated_at": "2026-10-22T13:35:42.463Z"
}
```

#### Example Response (All Posts) — `200 OK`:
```json
[
  {
    "placement_id": "3",
    "company_name": "Microsoft",
    "job_role": "Cloud Solutions Architect",
    "job_description": "Architecting Azure cloud services and enterprise infrastructure.",
    "drive_date": "2026-12-05T09:30:00.000Z",
    "eligible_branches": ["CSE", "IT", "ECE"],
    "min_cgpa": 7.5,
    "job_type": "FULL_TIME",
    "created_at": "2026-10-22T13:35:42.463Z",
    "updated_at": "2026-10-22T13:35:42.463Z"
  }
]
```

#### Error Response:
- **`404 Not Found`**:
  ```json
  {
    "error": "Placement post with id \"99999\" not found"
  }
  ```

---

## Frontend Pages & UI Overview

The frontend is built using **Next.js 16 (App Router)** and styled exclusively with **Tailwind CSS**. It is structured using familiar React Client Component patterns (`'use client'`) with `useState`, `useEffect`, and native `fetch` API calls.

---

### 1. Public Placement Drives Portal (`/`)

The public home page serves as the official portal for Guru Nanak Dev Engineering College (GNDEC) students to discover active recruitment drives.

![GNDEC Placement Drives Portal](public/screenshots/homepage.png)

#### Key Features:
- **Hero & Live Statistics**: Displays active drives count, full-time opportunities, and internship openings.
- **Search & Filtering**:
  - Real-time search across company names, job roles, and descriptions.
  - Dropdown filter by branch (`CSE`, `IT`, `ECE`, `ME`, `CE`, etc.).
  - Filter by employment type (`Full Time`, `Internship`, `Part Time`).
- **View Switcher (Card Grid vs Compact Table)**:
  - **Card Grid View**: Rich visual presentation with company initial avatar, role badge, formatted interview schedule, eligibility threshold (`Min CGPA`), and branch tags.
  - **Table View**: Classic corporate layout for fast comparison across companies and criteria.
- **Data Persistence**: Fetches directly from PostgreSQL via `GET /api/placement/post`. All changes persist across page reloads and server restarts.
- **Loading & Error States**: Graceful skeleton placeholders and error banners with a manual retry button.

---

### 2. Admin Authentication & Drive Posting Portal (`/admin`)

The admin portal allows TNP coordinators to log in and publish new campus placement drives to the database.

#### A. Admin Authentication Gate
![Admin Login Screen](public/screenshots/admin_login.png)

- Secure coordinator login validating `admin_email` and `admin_password` against the database via `POST /api/admin/login`.
- **Default Credentials**:
  - **Email**: `davjasdeepsinghji9e17@gmail.com`
  - **Password**: `jsa@2006`
- Stores the active admin profile in session storage (`{ admin_id, admin_name, admin_email }`) with a 1-click **Logout** action.

#### B. Placement Drive Registration Form & Management
![Admin Drive Registration Portal](public/screenshots/admin_portal.png)

- **Input Form** (`POST /api/placement/post`):
  - **Company Name**: e.g., `Microsoft`, `Amazon`, `Google`.
  - **Job Role / Designation**: e.g., `Cloud Solutions Architect`, `Software Development Engineer`.
  - **Drive Date & Time**: Native datetime picker validating ISO 8601 timestamps.
  - **Minimum CGPA Threshold**: Float value from `0.0` to `10.0`.
  - **Job Type**: Full-Time, Internship, or Part-Time.
  - **Eligible Branches**: Multi-select tags with quick **Select All** and **Clear All** controls.
  - **Job Description**: Detailed multi-line selection rounds and package description.
- **Instant Live Refresh**:
  - Displays a real-time **Recent Placement Drives** table directly beneath the form, updated immediately after creating a new drive.

---

## Data Models Reference

### Branch Enum

Allowed values for `student_dept` and `eligible_branches`:

| Branch Code | Full Department Name |
| :--- | :--- |
| `CSE` | Computer Science and Engineering |
| `IT` | Information Technology |
| `RAI` | Robotics and Artificial Intelligence |
| `ME` | Mechanical Engineering |
| `CE` | Civil Engineering |
| `EE` | Electrical Engineering |
| `ECE` | Electronics and Communication Engineering |
| `BCA` | Bachelor of Computer Applications |
| `MCA` | Master of Computer Applications |
| `BBA` | Bachelor of Business Administration |
| `MBA` | Master of Business Administration |
| `BVoc` | Bachelor of Vocation |
| `BArch` | Bachelor of Architecture |

### JobType Enum

Allowed values for `job_type`:

| Job Type | Description |
| :--- | :--- |
| `FULL_TIME` | Full-time employment position |
| `PART_TIME` | Part-time employment position |
| `INTERNSHIP` | Internship position |
