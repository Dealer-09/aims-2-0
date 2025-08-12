# 🎓 AIMS 2.0 – Academic Information Management System

A modern educational platform built with Next.js for managing academic materials, user access control, and document distribution. Features role-based authentication, admin dashboard, and secure document streaming.

![AIMS Platform](public/img/academic.png)

---

## 🚀 Features

- **🔐 Role-Based Access Control:** Admin, teacher, and student roles with approval workflow
- **📊 Admin Dashboard:** User management, PDF upload, and access request handling  
- **📚 Student Portal:** Filtered document access by class and subject
- **🛡️ Security:** CAPTCHA protection, rate limiting, JWT authentication
- **📄 Document Management:** Secure PDF storage and streaming via MongoDB GridFS

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js, React, TypeScript, Tailwind CSS |
| **Authentication** | Clerk + Firebase Auth |
| **Database** | MongoDB Atlas, Firebase Firestore |
| **Storage** | MongoDB GridFS, Firebase Storage |
| **Email** | Resend API |
| **Hosting** | Vercel |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- MongoDB Atlas account
- Firebase project
- Clerk account
- Resend account (for emails)
- hCaptcha account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aims-2-0.git
   cd aims-2-0
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your actual credentials in `.env.local`

4. **Run development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📁 Project Structure

```
├── components/                 # React components
│   ├── admin/                 # Admin dashboard components
│   ├── HeroSection.tsx        # Landing page sections
│   ├── Navbar.tsx            # Navigation components
│   └── ...
├── pages/                     # Next.js pages and API routes
│   ├── api/                  # Backend API endpoints
│   │   ├── admin/           # Admin-only endpoints
│   │   ├── auth/            # Authentication
│   │   └── pdfs/            # Document management
│   ├── admin.tsx            # Admin dashboard
│   ├── study.tsx            # Student portal
│   └── index.tsx            # Landing page
├── utils/                     # Utility functions
│   ├── firebase.ts          # Firebase client config
│   ├── firebaseAdmin.ts     # Firebase admin config
│   ├── mongodb.ts           # Database connection
│   └── sendEmail.ts         # Email service
├── styles/                    # CSS and styling
├── public/                    # Static assets
└── types/                     # TypeScript definitions
```

---

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Generate service account credentials
4. Copy `firestore.rules` to your Firebase project

### Clerk Setup

1. Create account at [Clerk](https://clerk.com/)
2. Configure authentication methods
3. Get publishable and secret keys

### MongoDB Setup

1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create database user and get connection string
3. Configure network access

---

## 🔒 Security Features

- **Authentication:** Multi-provider auth via Clerk + Firebase
- **Authorization:** Role-based access control (RBAC)
- **Data Protection:** Input validation and sanitization
- **Rate Limiting:** API endpoint protection
- **Secure Storage:** Encrypted document storage in GridFS

---

## � Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds

### Environment Variables for Production

Ensure all variables from `.env.example` are configured in your hosting environment.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Clerk](https://clerk.com/) for authentication
- [Firebase](https://firebase.google.com/) for backend services
- [MongoDB](https://www.mongodb.com/) for database
- [Tailwind CSS](https://tailwindcss.com/) for styling

## ⚙️ Environment Configuration

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your actual credentials:
   - Get Firebase credentials from [Firebase Console](https://console.firebase.google.com/)
   - Get Clerk keys from [Clerk Dashboard](https://dashboard.clerk.com/)
   - Set up MongoDB Atlas and get connection string
   - Configure Resend for email services
   - Set up hCaptcha for form protection

> ⚠️ Never commit `.env.local` to version control. It contains sensitive credentials.

> 📝 For Vercel deployment, add environment variables in the Vercel dashboard and ensure `FIREBASE_PRIVATE_KEY` is set as "plain text with newlines".

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