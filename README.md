# 🎓 AIMS 2.0 – Academic Information Management System

AIMS 2.0 is a modern educational platform designed for managing academic materials, user access, and class assignments. Built with **Next.js**, **Clerk**, **Firebase**, **MongoDB**, and **Resend**, it provides secure and efficient access to course documents for students, teachers, and administrators.

![AIMS Platform](public/img/academic.png)

---

## 🚀 Features

- **User Access Management:** Role-based access (admin, teacher, student) with request/approval system  
- **Admin Dashboard:** Manage user roles, upload PDFs, and assign materials by class/subject  
- **Student Dashboard:** Access course documents filtered by class and subject  
- **Security:** CAPTCHA, rate limiting, access control, JWT authentication, email alerts  
- **Document Management:** Efficient upload, retrieval, and rendering using MongoDB GridFS  

---

## 🛠️ Tech Stack

| Layer              | Technology                               |
|--------------------|------------------------------------------|
| **Frontend**       | Next.js, React, TypeScript, Tailwind CSS |
| **Authentication** | Clerk + Firebase Authentication          |
| **Database**       | MongoDB (with GridFS), Firebase Firestore|
| **Storage**        | Firebase Storage, MongoDB GridFS         |
| **Backend**        | Next.js API Routes, Firebase Admin SDK   |
| **Email**          | Resend API                               |
| **Hosting**        | Vercel, MongoDB Atlas                    |

---

## 🧭 Application Flow & User Journey

### 🎯 Core User Paths

1. **New User Journey:**
   - Discovers AIMS through landing page (`/`)
   - Clicks "Request Access" → `/request-access`
   - Completes form with email + CAPTCHA verification
   - System sends email notification to admin
   - Waits for admin approval via admin dashboard

2. **Admin Workflow:**
   - Signs in → Auto-redirected to `/admin` dashboard
   - Reviews pending requests in "Access Requests" tab
   - Approves users and assigns class/subject combinations
   - Uploads PDFs via "PDF Management" with class/subject metadata
   - Manages existing users via "User Management" tab

3. **Student Learning Path:**
   - Signs in → Auto-redirected to `/study` dashboard  
   - Views personalized document library filtered by their class/subject
   - Accesses PDFs directly in browser via MongoDB GridFS streaming
   - Studies materials assigned by admin

### 🔐 Role-Based Access Control

| Role | Access Level | Available Routes | Permissions |
|------|-------------|------------------|-------------|
| **Admin** | Full Platform | `/admin`, `/study`, all API routes | User management, PDF upload, approve requests |
| **Student** | Study Materials | `/study`, student API routes | View assigned PDFs, download materials |
| **Unapproved** | Limited | `/`, `/request-access`, `/sign-in` | Submit access requests only |
| **Revoked** | Blocked | Public pages only | Must re-request access |

### 🌊 Navigation States

**Public Navigation (Unauthenticated):**
- Landing page with course information and testimonials
- Sign In button in navbar → `/sign-in`
- Request Access flow → `/request-access`

**Authenticated Navigation:**
- **Admin:** Persistent sidebar with tabs (PDF Management, Access Requests, User Management)
- **Student:** Study dashboard with document library and filters
- **Both:** Logout functionality via Clerk UserButton component

---

## 🔐 Security Overview

- **Authentication:** Firebase Auth + Clerk, JWT sessions, CAPTCHA protection  
- **Role-based Access:** Distinct access for admins, teachers, and students  
- **Secure Document Streaming:** GridFS streaming with access control  
- **API Protections:** Input validation, method filtering, error shielding  

---

## 🗃️ System Architecture

### 🔑 Authentication & User Management
- **Firebase Authentication + Clerk:** User registration, login, and session handling
- **Role Assignment:** Managed via Firestore and Firebase Admin SDK

### 📄 Document Management
- **MongoDB + GridFS:** Secure, scalable file storage with metadata for class/subject association
- **In-browser PDF Viewing:** Via `pdf.js` for seamless access

### 🧭 User Navigation Flow

```mermaid
graph TD
    Start([User Visits Platform]) --> Landing{Landing Page}
    Landing --> |"New User"| RequestAccess[Request Access Form]
    Landing --> |"Existing User"| SignIn[Sign In Page]
    
    %% Request Access Flow
    RequestAccess --> ValidateForm{Form Valid + CAPTCHA?}
    ValidateForm --> |"No"| RequestAccess
    ValidateForm --> |"Yes"| SubmitRequest[Submit to Firebase]
    SubmitRequest --> EmailAdmin[Email Notification to Admin]
    EmailAdmin --> WaitApproval[Waiting for Approval]
    
    %% Admin Review Process
    WaitApproval --> AdminNotified[Admin Reviews Request]
    AdminNotified --> AdminAction{Admin Decision}
    AdminAction --> |"Approve"| AssignRole[Assign Role & Class/Subject]
    AdminAction --> |"Reject"| RejectRequest[Request Rejected]
    AssignRole --> NotifyUser[Email User Approval]
    
    %% Sign In Flow
    SignIn --> ClerkAuth[Clerk Authentication]
    ClerkAuth --> AuthSuccess{Auth Successful?}
    AuthSuccess --> |"No"| SignIn
    AuthSuccess --> |"Yes"| CheckRole[Check User Role in Firebase]
    
    %% Role-Based Routing
    CheckRole --> RoleDecision{User Role?}
    RoleDecision --> |"Admin"| AdminDash[Admin Dashboard]
    RoleDecision --> |"Student"| StudentDash[Study Dashboard]
    RoleDecision --> |"Unapproved/None"| RequestAccess
    RoleDecision --> |"Revoked"| RequestAccess
    
    %% Admin Dashboard Flow
    AdminDash --> AdminTabs{Admin Functions}
    AdminTabs --> |"PDF Management"| UploadPDF[Upload & Assign PDFs]
    AdminTabs --> |"Access Requests"| ReviewRequests[Review Pending Requests]
    AdminTabs --> |"User Management"| ManageUsers[Manage User Roles]
    
    UploadPDF --> GridFS[Store in MongoDB GridFS]
    ReviewRequests --> AdminAction
    ManageUsers --> UpdateRoles[Update User Roles & Classes]
    
    %% Student Dashboard Flow
    StudentDash --> CheckApproval{Approved User?}
    CheckApproval --> |"No"| AccessDenied[Access Denied Message]
    CheckApproval --> |"Yes"| FetchPDFs[Fetch Class/Subject PDFs]
    FetchPDFs --> DisplayPDFs[Display Available Documents]
    DisplayPDFs --> ViewPDF[View PDF in Browser]
    
    %% Error Handling
    AccessDenied --> RequestAccess
    RejectRequest --> RequestAccess
    NotifyUser --> SignIn
    
    %% Styling
    classDef startEnd fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef process fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef admin fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef student fill:#e3f2fd,stroke:#0d47a1,stroke-width:2px
    classDef error fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class Start,Landing startEnd
    class RequestAccess,SignIn,ClerkAuth,UploadPDF,FetchPDFs,ViewPDF process
    class ValidateForm,AuthSuccess,CheckRole,RoleDecision,AdminAction,CheckApproval,AdminTabs decision
    class AdminDash,ReviewRequests,ManageUsers,GridFS,UpdateRoles admin
    class StudentDash,DisplayPDFs student
    class AccessDenied,RejectRequest error
```

#### � Detailed Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Clerk
    participant API
    participant Firebase
    participant MongoDB
    
    User->>Frontend: Navigate to /sign-in
    Frontend->>Clerk: Display SignIn Component
    User->>Clerk: Enter Credentials
    Clerk->>Clerk: Validate Credentials
    Clerk->>API: Redirect to /api/auth-redirect
    API->>Clerk: Get User ID & Email
    API->>Firebase: Check User Role
    Firebase-->>API: Return Role Data
    API->>Frontend: Redirect Based on Role
    Frontend->>User: Display Dashboard
```

#### 📤 Admin PDF Management Flow
```mermaid
sequenceDiagram
    participant Admin
    participant AdminUI
    participant API
    participant MongoDB
    participant GridFS
    participant Students
    
    Admin->>AdminUI: Upload PDF File
    AdminUI->>API: POST /api/admin/upload-pdf
    API->>GridFS: Store PDF Binary
    GridFS-->>API: Return File ID
    API->>MongoDB: Save Metadata (class, subject)
    MongoDB-->>API: Confirm Save
    API-->>AdminUI: Upload Success
    AdminUI-->>Admin: Show Success Message
    
    Note over Students: Students can now access the PDF
    Students->>API: GET /api/pdfs/get-student-pdfs
    API->>MongoDB: Query by class/subject
    MongoDB-->>API: Return PDF List
    API-->>Students: Filtered PDF List
```

---

## 🗂️ Project Structure

```
├── components/                 # Reusable UI components
│   ├── admin/                 # Admin-specific components
│   │   ├── AdminLayout.tsx    # Admin dashboard layout with tabs
│   │   ├── AccessRequests.tsx # Pending request management
│   │   ├── PdfManagement.tsx  # PDF upload & assignment
│   │   ├── UserManagement.tsx # User role management
│   │   └── types.ts          # TypeScript interfaces
│   ├── Navbar.tsx            # Main navigation with responsive design
│   ├── HeroSection.tsx       # Landing page hero content
│   ├── AboutSection.tsx      # Institute information
│   ├── ClassesSection.tsx    # Course offerings display
│   ├── ContactSection.tsx    # Contact information
│   ├── FooterSection.tsx     # Site footer
│   └── PageLoader.tsx        # Loading animations
├── pages/                     # Next.js routing & API endpoints
│   ├── _app.tsx              # Global app wrapper with Clerk
│   ├── _document.tsx         # Custom document structure
│   ├── index.tsx             # Landing page (public)
│   ├── admin.tsx             # Admin dashboard (protected)
│   ├── study.tsx             # Student document library (protected)
│   ├── request-access.tsx    # Access request form (public)
│   ├── sign-in/[[...index]].tsx    # Clerk sign-in page
│   ├── sign-up/[[...index]].tsx    # Clerk sign-up page
│   └── api/                  # Backend API routes
│       ├── auth-redirect.ts  # Post-login role-based routing
│       ├── check-approval.ts # User approval status
│       ├── get-user-role.ts  # User role & class lookup
│       ├── request-access.ts # Access request submission
│       ├── admin/           # Admin-only endpoints
│       │   ├── get-requests.ts    # Fetch pending requests
│       │   ├── get-users.ts       # Fetch approved users
│       │   ├── update-request.ts  # Approve/reject requests
│       │   ├── upload-pdf.ts      # PDF upload with metadata
│       │   ├── get-pdfs.ts        # Fetch all PDFs
│       │   └── delete-pdf.ts      # Remove PDFs
│       ├── auth/            # Authentication endpoints
│       │   └── [...nextauth].ts  # NextAuth configuration
│       └── pdfs/            # Document management
│           ├── [id].ts           # Individual PDF streaming
│           └── get-student-pdfs.ts # Student document access
├── public/                   # Static assets
│   ├── img/                 # Images and graphics
│   └── *.svg               # Icons and logos
├── styles/                  # CSS modules and global styles
│   ├── globals.css         # Global styles and CSS variables
│   ├── admin.module.css    # Admin dashboard styling
│   ├── study.module.css    # Student dashboard styling
│   └── *.module.css       # Component-specific styles
├── types/                   # TypeScript type definitions
│   └── images.d.ts         # Image import types
├── utils/                   # Utility functions and configurations
│   ├── firebase.ts         # Client-side Firebase SDK
│   ├── firebaseAdmin.ts    # Server-side Firebase Admin SDK
│   ├── mongodb.ts          # MongoDB connection & GridFS
│   ├── sendEmail.ts        # Email notification service
│   ├── validation.ts       # Input validation utilities
│   └── firebase-error-handler.ts # Error handling
├── middleware.ts            # Route protection and CORS
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file with the following variables:

```env
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANB...
-----END PRIVATE KEY-----"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/aims
MONGODB_DB_NAME=aimsDB

# Email & CAPTCHA
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
ADMIN_EMAIL=...
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET_KEY=...

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ Ensure `FIREBASE_PRIVATE_KEY` uses actual line breaks in Vercel or local `.env`.

---

## 🧪 Development & Deployment

### 🧑‍💻 Local Development

```bash
npm install
npm run dev
```

- App runs on: `http://localhost:3000`

### ☁️ Deployment

- **Platform:** Vercel  
- **Database:** MongoDB Atlas  
- **Auth Services:** Firebase Console + Clerk Dashboard

---

## 🛠️ Diagnostics & Debugging

Health check API endpoints:

| Endpoint                            | Purpose                             |
|-------------------------------------|-------------------------------------|
| `/api/admin/health-check`           | Firebase Admin SDK status check     |
| `/api/admin/firebase-env-check`     | Validates Firebase environment vars |
| `/api/admin/debug-user`             | Inspect user data & roles           |
| `/api/admin/fix-user-role`          | Fix incorrect roles manually        |

---

## 🧩 Common Issues

| Problem                          | Solution                                                                 |
|----------------------------------|--------------------------------------------------------------------------|
| Firebase Admin SDK errors        | Check `FIREBASE_PRIVATE_KEY` formatting (line breaks required)           |
| Access denied to PDFs            | Verify Firestore rules and MongoDB permissions                           |
| Role or access issues            | Use `/debug-user` and `/fix-user-role` APIs                              |

---

## 📬 Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [Firebase](https://firebase.google.com/)
- [MongoDB](https://mongodb.com/)
- [Resend](https://resend.com/)

---

## 🗺️ Route Structure & Navigation

### 📄 Frontend Routes

| Route | Access Level | Purpose | Redirects |
|-------|-------------|---------|-----------|
| `/` | Public | Landing page with course info | None |
| `/sign-in/[[...index]]` | Public | Clerk authentication | Role-based redirect |
| `/sign-up/[[...index]]` | Public | Account creation (approval required) | `/study` after signup |
| `/request-access` | Public | Submit access request form | None |
| `/admin` | Admin Only | Admin dashboard | `/sign-in` if not authenticated |
| `/study` | Approved Users | Student document library | `/sign-in` if not authenticated |

### 🔌 API Endpoints

#### Authentication & User Management
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/auth-redirect` | GET | Role-based redirect after login | Yes (Clerk) |
| `/api/check-approval` | GET | Check if user is approved | No |
| `/api/get-user-role` | GET | Fetch user role and class info | Yes (Clerk) |
| `/api/request-access` | POST | Submit access request | No (CAPTCHA) |

#### Admin Operations
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/admin/get-requests` | GET | Fetch pending access requests | Admin |
| `/api/admin/get-users` | GET | Fetch all approved users | Admin |
| `/api/admin/update-request` | POST | Approve/reject access requests | Admin |
| `/api/admin/upload-pdf` | POST | Upload PDF with metadata | Admin |
| `/api/admin/get-pdfs` | GET | Fetch all uploaded PDFs | Admin |
| `/api/admin/delete-pdf` | DELETE | Remove PDF from system | Admin |

#### Student Operations  
| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/pdfs/get-student-pdfs` | GET | Fetch user's class/subject PDFs | Student |
| `/api/pdfs/[id]` | GET | Stream individual PDF file | Student |

### 🛡️ Middleware Protection

**Route Protection via `middleware.ts`:**
- All `/admin/*` routes require admin authentication
- All `/study/*` routes require user authentication  
- All `/api/*` routes include CORS headers and rate limiting
- Clerk middleware automatically handles session validation

**Access Control Flow:**
1. Middleware validates Clerk session
2. API endpoints verify user role via Firebase
3. Role-based redirects ensure proper navigation
4. Unauthorized access automatically redirects to sign-in
