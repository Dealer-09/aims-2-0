# Public Repository Security Notice

This repository is a public showcase version of the AIMS 2.0 Educational Platform. As such, several important security measures have been implemented:

## 🔒 Security Measures

1. **Environment Variables**
   - All sensitive environment variables have been removed and placeholders are used instead
   - Reference `.env.example` for the required variables you'll need to set up locally

2. **API Keys & Credentials**
   - All API keys, tokens, and credentials have been removed
   - No actual Firebase, Clerk, MongoDB, or Resend API keys are included

3. **Protected Files**
   - Firebase service account files
   - Private keys and certificates
   - Configuration files containing credentials
   - Local environment files (`.env.local`, etc.)

## 🛠️ Setting Up For Development

If you're forking this repository for development:

1. Create your own Firebase project and get your own API keys
2. Set up your own Clerk authentication
3. Create a MongoDB database (if needed)
4. Sign up for Resend or another email service
5. Copy `.env.example` to `.env.local` and fill in your own values

## 📝 Notes for Contributors

- Never commit any real API keys, tokens, or credentials
- Always use environment variables for sensitive information
- If adding new services requiring authentication, update the `.gitignore` file

---

**Remember:** This is a showcase repository. For actual deployment, additional security measures would be required.
