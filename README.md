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

## 🧭 Application Flow

1. **Access Request:**  
   - New users request access via `/request-access`
2. **Admin Review:**  
   - Admin approves/rejects requests and assigns class/subject
   - PDFs uploaded via the admin dashboard
3. **Student Access:**  
   - Approved users sign in and access study materials at `/study`

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

### 🧭 Data Flows

#### 🔐 Authentication
```mermaid
graph TD
A[User Login] --> B[Clerk/Firebase Auth]
B --> C[Retrieve Role]
C --> D[Grant Role-Based Access]
```

#### 📤 Admin PDF Upload
```mermaid
graph TD
A[Upload PDF] --> B[Assign Class & Subject]
B --> C[Store File in GridFS]
C --> D[Save Metadata in MongoDB]
```

#### 📚 Student Document Access
```mermaid
graph TD
A[Student Login] --> B[Retrieve Class/Subject]
B --> C[Query MongoDB]
C --> D[Display PDF List]
```

---

## 🗂️ Project Structure

```
├── components/         # Reusable UI components
├── pages/              # Route-based views & API endpoints
├── public/             # Static assets
├── utils/              # Utility functions (Firebase, MongoDB, etc.)
└── styles/             # Tailwind + global styles
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