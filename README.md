
# AIMS 2.0 Educational Platform

A modern educational platform for managing study materials, user access, and class assignments, built with **Next.js**, **Clerk**, **Firebase**, and **Resend**.

---

## Features


- **Request-Based User Access:**  
  Users request access; admins approve/reject and assign class/subject. Only approved users can sign up and access materials.

- **Admin Dashboard:**  
  - View and manage access requests  
  - Approve/reject users and assign class/subject  
  - Edit/revoke user access  
  - Upload, view, and delete PDFs for specific classes/subjects  
  - Manage all users

- **User Dashboard:**  
  - View/download PDFs for assigned class/subject  
  - Only see materials relevant to their assignment

- **Email Notifications:**  
  - Admins notified of new access requests  
  - Users notified of approval/rejection (with sign-up link)

- **Authentication:**  
  - Secure sign-in/sign-up with Clerk  
  - Middleware-protected routes for admin and study areas

- **Custom Chatbot:**
  - Built-in chatbot (AskAIMS) for instant help and information about the institute, subjects, contact details, and more.

- **Landing Page & Informational Sections:**
  - Hero, About, Locations, Classes, Reviews, and Contact sections for a complete educational website experience.

- **Student Reviews:**
  - Swiper-powered reviews carousel with real student feedback.

- **Contact & Social Links:**
  - Contact form, email, phone, WhatsApp, and social media links.

---

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS
- **Auth:** Clerk
- **Database & Storage:** Firebase Firestore & Storage
- **Email:** Resend
- **Other:** TypeScript, ESLint, Swiper (for reviews), custom chatbot

---

## Getting Started

1. **Clone the repo:**
   ```powershell
   git clone <your-repo-url>
   cd AIMS2.0
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**  
   Create a `.env.local` file with your Firebase, Clerk, and Resend credentials:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   CLERK_PUBLISHABLE_KEY=...
   CLERK_SECRET_KEY=...
   RESEND_API_KEY=...
   ```

4. **Run the development server:**
   ```powershell
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

---

## Usage Overview

- **Request Access:**  
  Users request access via `/request-access`. Admins receive an email and can approve/reject in `/admin`.

- **Admin Actions:**  
  - Approve/reject requests, assign class/subject  
  - Edit/revoke users  
  - Upload PDFs (assigned to class/subject)  
  - Delete PDFs

- **User Actions:**  
  - After approval, sign up via emailed link  
  - Access `/study` to view/download PDFs for their class/subject

---

## Project Structure

- `pages/` — Next.js pages (admin, study, request-access, sign-in, sign-up, API routes)
- `components/` — UI components (navbar, sections, chatbot, etc.)
- `src/utils/` — Firebase and email utilities
- `public/` — Static assets and images
- `styles/` — Global styles

---

## Deployment

- Deploy easily on [Vercel](https://vercel.com/) or your preferred platform.
- Make sure to set all environment variables in your deployment settings.

---

## Security Notes

- **Update Firestore rules** for production! Only allow necessary access for users and admins.
- Never commit secrets or credentials to the repo.

---

## License

MIT

---

## Credits

- Built with [Next.js](https://nextjs.org/), [Clerk](https://clerk.com/), [Firebase](https://firebase.google.com/), and [Resend](https://resend.com/).
