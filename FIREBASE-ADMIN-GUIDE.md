# Firebase Admin SDK Setup Guide

This guide covers setting up the Firebase Admin SDK for AIMS 2.0.

## Required Environment Variables

| Variable | Description | Format |
|----------|-------------|--------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase project ID | Plain text |
| `FIREBASE_CLIENT_EMAIL` | Service account email | Plain text |
| `FIREBASE_PRIVATE_KEY` | Private key from service account | Formatted with newlines |

## Setup Instructions

### 1. Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/) > Project Settings > Service accounts
2. Click **Generate new private key**
3. Save the JSON file securely

### 2. Configure Environment Variables

#### For Vercel Deployment:

1. Go to your Vercel project dashboard > Settings > Environment Variables
2. Add the following:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Copy from JSON
   - `FIREBASE_CLIENT_EMAIL`: Copy from JSON
   - `FIREBASE_PRIVATE_KEY`: Copy from JSON as "plain text with newlines" (crucial)

#### For Local Development:

Create a `.env.local` file with:
```
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDDz...
-----END PRIVATE KEY-----"
```

> **Critical:** For `FIREBASE_PRIVATE_KEY`, include actual newlines, not escaped `\n` characters.

## Troubleshooting

### Common Issues

1. **"Missing required credentials" Error**
   - Check that all environment variables are set
   - Verify correct environments (development, production)

2. **"Missing or insufficient permissions" Error**
   - Check your Firestore security rules
   - Verify service account permissions

3. **Private Key Format Issues**
   - Ensure key has actual newlines (not just `\n` strings)
   - Include both `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Diagnostic Tools

The application includes several diagnostic endpoints:

- `/api/admin/health-check` - Verify Firebase Admin initialization
- `/api/admin/firebase-env-check` - Validate environment variables
- `/api/admin/debug-user` - Inspect user records
- `/api/admin/fix-user-role` - Fix incorrect user roles
