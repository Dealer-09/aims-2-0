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

## 📚 Firebase Admin SDK Setup Guide

### Required Environment Variables

| Variable | Description | Format |
|----------|-------------|--------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase project ID | Plain text |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Plain text |
| `FIREBASE_PRIVATE_KEY` | Private key from service account | Formatted with newlines |

### Setup Instructions

#### 1. Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service accounts
2. Click **Generate new private key**
3. Save the JSON file securely

#### 2. Configure Environment Variables

##### For Vercel Deployment:

1. Go to your Vercel project dashboard > Settings > Environment Variables
2. Add the following:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Copy from JSON
   - `FIREBASE_CLIENT_EMAIL`: Copy from JSON
   - `FIREBASE_PRIVATE_KEY`: Copy from JSON as "plain text with newlines" (crucial)

##### For Local Development:

Create a `.env.local` file with:
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDDz...
-----END PRIVATE KEY-----"
```

> **Critical:** For `FIREBASE_PRIVATE_KEY`, include actual newlines, not escaped `\n` characters.

### Troubleshooting

#### Common Issues

1. **"Missing required credentials" Error**
   - Check that all environment variables are set
   - Verify correct environments (development, production)

2. **"Missing or insufficient permissions" Error**
   - Check your Firestore security rules
   - Verify service account permissions

3. **Private Key Format Issues**
   - Ensure key has actual newlines (not just `\n` strings)
   - Include both `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

#### Diagnostic Tools

The application includes several diagnostic endpoints:

- `/api/admin/health-check` - Verify Firebase Admin initialization
- `/api/admin/firebase-env-check` - Validate environment variables
- `/api/admin/debug-user` - Inspect user records
- `/api/admin/fix-user-role` - Fix incorrect user roles

---

## 🎨 Layout and CSS Optimizations

### Layout Optimization Summary

#### Completed Tasks ✅

1. **Fixed Homepage Layout Issues**
   - **Problem**: Announcement banner and navigation header were overlapping due to z-index conflicts and positioning issues
   - **Solution**: 
     - Set announcement banner to `position: fixed` with `z-index: 999`
     - Maintained header `z-index: 1000` to stay above banner
     - Added proper body padding (`60px`) when banner is visible
     - Updated hero section padding to `8rem` to account for both banner and header

2. **Optimized CSS File Structure**
   - **Before**: `globals.css` - 2,297 lines, 41.61 KB
   - **After**: `globals.css` - 1,170 lines, 21.54 KB
   - **Reduction**: 49% fewer lines, 48% smaller file size

3. **Consolidated Duplicate Media Queries**
   - **Problem**: Multiple duplicate media queries for same breakpoints scattered throughout the file
   - **Solution**: Organized all media queries by breakpoint:
     - Large screens (1200px+, 1600px+, 1920px+)
     - Tablets (992px and below) 
     - Mobile landscape (768px and below)
     - Mobile portrait (480px and below)
     - Accessibility and print styles

4. **Enhanced Component Integration**
   - **AnnouncementBanner.tsx**: Added automatic body class management
     - Adds `banner-visible` class when banner is shown
     - Removes class when banner is closed or component unmounts
     - Ensures proper spacing calculations

#### Key Improvements

**Layout Fixes**
- ✅ Resolved banner/header overlap issues
- ✅ Fixed z-index stacking conflicts
- ✅ Improved mobile navigation accessibility
- ✅ Better responsive design for all screen sizes

**Code Quality**
- ✅ Removed duplicate and unused CSS rules
- ✅ Consolidated media queries by breakpoint
- ✅ Added clear section comments for better maintainability
- ✅ Preserved all functionality while reducing file size

**Performance Gains**
- ✅ 48% reduction in CSS file size (faster loading)
- ✅ Cleaner code structure (easier maintenance)
- ✅ Better organized responsive styles
- ✅ Eliminated redundant rules (improved browser parsing)

### Layout Improvements: Fixing "Boxy" Layouts

#### Key Problems Identified

1. **Container Width Constraints**
   - **Issue**: Main `.container` class constrains sections to `max-width: 1140px`
   - **Impact**: Created rigid, boxed appearances for sections that didn't break out
   - **Affected Sections**: Classes and Reviews sections

2. **Section-Specific Constraints**
   - **Reviews Section**: Severely constrained to `max-width: 750px`
   - **Classes Section**: Limited to `max-width: 400px` creating very narrow layout
   - **About/Features Sections**: Successfully used full-width implementations

3. **Layout Inconsistencies**
   - Different spacing and padding approaches across sections
   - Inconsistent background treatments
   - Varying content container implementations

#### Solutions Implemented

1. **About Section ("Why Choose Us") Constraints**

   **Balanced Width Implementation**
   ```css
   .about-content {
     max-width: 1200px; /* Constrained without using global container */
     margin: 0 auto;
     padding: 0 2rem;
   }

   .about .heading {
     max-width: 1000px; /* Optimal reading width for headings */
     margin: 0 auto 3rem auto;
     padding: 0 2rem;
   }
   ```

   **Responsive Constraints**
   - **Large screens (1200px+)**: `max-width: 1400px` for content, `1200px` for heading
   - **Tablets (992px and below)**: `max-width: 900px` for content, `800px` for heading  
   - **Mobile (768px and below)**: `max-width: 100%` with responsive padding

2. **Reviews Section Improvements**

   **Full-Width Layout Implementation**
   ```css
   .reviews-section {
     padding: 4rem 0;
     width: 100vw; /* Full viewport width */
     margin-left: calc(-50vw + 50%); /* Break out of container */
     background: var(--body-color);
     position: relative;
   }
   ```

   **Enhanced Container & Styling**
   - **Container Width**: Increased from `750px` to `1200px`
   - **Content Padding**: Added `2rem` padding for breathing room
   - **Background**: Added subtle gradient overlay
   - **Review Boxes**: Enhanced with cards, hover effects, and better spacing

3. **Classes Section Improvements**

   **Full-Width Layout Implementation**
   ```css
   .classes-section {
     padding: 4rem 0;
     width: 100vw; /* Full viewport width */
     margin-left: calc(-50vw + 50%); /* Break out of container */
     background: var(--container-color);
     position: relative;
   }
   ```

   **Expanded Content Area**
   - **Container Width**: Dramatically increased from `400px` to `1200px`
   - **Layout**: Flexible column design with proper centering
   - **Background**: Added gradient overlay matching other sections

4. **Design System Consistency**

   **Background Treatments**
   All sections now feature:
   - Full viewport width (`100vw`)
   - Container breakout (`margin-left: calc(-50vw + 50%)`)
   - Subtle gradient overlays
   - Consistent z-index layering

   **Content Containers**
   - **Large screens (1200px+)**: About section `max-width: 1400px`, heading `max-width: 1200px`
   - **Tablets (992px and below)**: About section `max-width: 900px`, heading `max-width: 800px`
   - **Mobile (768px and below)**: About section responsive padding with `max-width: 100%`
   - **Other sections**: Reviews and Classes `max-width: 1200px` standard

### CSS Consolidation and Optimization

#### CSS Files Consolidated

1. **Files Merged and Deleted**
   - ✅ `layout-improvements.css` - Merged into globals.css
   - ✅ `position-fixes.css` - Merged into globals.css
   - ✅ `component-fixes.css` - Merged into globals.css
   - ✅ `final-polish.css` - Merged into globals.css
   - ✅ `layout-fixes.css` - Merged into globals.css
   - ✅ `responsiveness.css` - Merged into globals.css
   - ✅ `globals-optimized.css` - Redundant duplicate

2. **Files Preserved**
   - ✅ `globals.css` - Main consolidated CSS file
   - ✅ `globals-backup.css` - Original backup preserved
   - ✅ `admin.module.css` - Module-specific CSS
   - ✅ `study.module.css` - Module-specific CSS
   - ✅ `admin-card-fixes.module.css` - Module-specific CSS
   - ✅ `user-management.module.css` - Module-specific CSS
   - ✅ `user-management-helpers.module.css` - Module-specific CSS

#### Media Query Consolidation

1. **775px Mobile Breakpoints**
   - Consolidated "CONSOLIDATED 775px MOBILE STYLES" section
   - Content: Navbar hamburger styles, mobile menu overlays, header fixes

2. **1600px Extra Large Screen Breakpoints**
   - Consolidated "CONSOLIDATED EXTRA LARGE SCREEN STYLES (1600px+)" section
   - Content: Container layout, hero enhancements, section constraints

3. **1200px Large Screen Breakpoints**
   - Consolidated "CONSOLIDATED LARGE SCREEN STYLES (1200px+)" section
   - Content: Container/global layout, section enhancements, typography

#### Final Media Query Structure

**Mobile and Tablet (max-width)**
- `@media (max-width: 768px)` - Mobile styles
- `@media (max-width: 480px)` - Small mobile
- `@media (max-width: 892px)` - Medium mobile
- `@media (max-width: 775px)` - Mobile navigation
- `@media (max-width: 635px)` - Smaller mobile
- `@media (max-width: 450px)` - Very small mobile
- `@media (max-width: 325px)` - Tiny mobile

**Tablet Range**
- `@media (min-width: 768px) and (max-width: 1199px)` - Tablet styles

**Large Screens (min-width)**
- `@media (min-width: 1200px)` - Large screen styles
- `@media (min-width: 1600px)` - Extra large screen styles
- `@media (min-width: 1920px)` - Ultra-wide screens
- `@media (min-width: 2560px)` - Ultra-wide screen optimizations

**Specialized Media Queries**
- `@media (min-width: 1200px) and (min-resolution: 192dpi)` - High-resolution displays
- `@media print` - Print styles
- `@media (prefers-reduced-motion: reduce)` - Accessibility
- `@media (prefers-contrast: high)` - High contrast accessibility

#### Major Conflicts Resolved

1. **Container Class Definitions**
   - **Problem**: .container defined with different max-widths across multiple media queries
   - **Solution**: Consolidated into organized responsive structure:
     - Base: 1140px (mobile-first)
     - Large: 1400px (@1200px+)
     - Extra Large: 1600px (@1600px+)
     - Ultra-wide: 2200px (@2560px+)

2. **Scrollbar Properties**
   - **Problem**: Multiple redundant scrollbar-width, scrollbar-color, scroll-behavior declarations
   - **Solution**: Consolidated into single global * selector definition

3. **Overflow-X Hidden**
   - **Problem**: Scattered overflow-x: hidden across multiple selectors and media queries
   - **Solution**: Consolidated into global html/body declaration, removed redundancies

#### Component Styles Restoration

During CSS optimization, some critical component styles were accidentally removed. These have been restored:

1. **Location Section Styles**
   - `.location-content` - Grid layout for location boxes
   - `.location-box` - Individual location card styling
   - `.location-box:hover` - Hover animation effects
   - Other location component styles

2. **Class Section Styles**
   - `.class-data h3` - Class section headings
   - `.btn1` - Primary button styling with gradient
   - Button states (hover, active, disabled)
   - Button animations and icons

3. **Review Section Styles**
   - `.reivews` - Reviews container
   - `.review-box` - Individual review card
   - Review profile and text styling
   - Swiper pagination styles

4. **Contact Section Styles**
   - `.contact-form` - Form container layout
   - Form field styling and states
   - Send button styles and animations

#### File Statistics

- **Original file**: `globals.css` (2,712 lines)
- **Final file**: `globals.css` (2,164 lines)
- **Reduction**: 548 lines removed (20.2% reduction)
- **Media queries reduced**: 22 sections to 16 sections

#### Benefits Achieved

1. **Reduced Complexity**: Eliminated the problematic override pattern
2. **Easier Maintenance**: All global styles consolidated in one file
3. **Better Performance**: Reduced HTTP requests and file size
4. **Cleaner Codebase**: No redundant duplicate files
5. **Preserved Functionality**: All existing styles and behavior maintained

---

## 📬 Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [Firebase](https://firebase.google.com/)
- [MongoDB](https://mongodb.com/)
- [Resend](https://resend.com/)

---

*Documentation consolidated on: June 10, 2023*
