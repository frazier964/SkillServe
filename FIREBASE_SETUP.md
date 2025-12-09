# SkillServe Firebase Setup - Quick Reference

## Files Created/Updated

✅ **Environment Configuration**
- `.env.local` - Development environment variables
- `.env.production` - Production environment variables
- `.gitignore` - Updated to exclude sensitive files

✅ **Security Rules**
- `firestore.rules` - Firestore security rules (complete)
- `storage.rules` - Cloud Storage security rules (complete)
- `firebase.json` - Updated with rules configuration

✅ **Documentation**
- `DEPLOYMENT.md` - Complete deployment guide

## Quick Start

### 1. Configure Environment Variables

**For Development:**
```bash
cd skillserve

# Edit .env.local and add:
VITE_GOOGLE_CLIENT_ID=your_client_id_from_google_cloud_console
VITE_PAYPAL_CLIENT_ID=your_sandbox_client_id_from_paypal
```

**For Production:**
```bash
# Edit .env.production and add:
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_PAYPAL_CLIENT_ID=your_live_paypal_client_id
```

### 2. Set Up Firebase Services

#### Option A: Via Firebase Console (Recommended for first-time)
1. Open https://console.firebase.google.com/project/skillserve-c4c53
2. Go to Firestore → Create database → Production mode
3. Go to Storage → Get started → Choose production rules
4. Go to Authentication → Enable Email/Password and Google sign-in

#### Option B: Via Firebase CLI (Recommended for existing projects)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Set project
firebase use skillserve-c4c53

# Deploy all rules and configs
firebase deploy
```

### 3. Set Up Google OAuth

1. Go to https://console.cloud.google.com/
2. Select project: `skillserve-c4c53`
3. APIs & Services → Credentials → Create OAuth 2.0 Client ID
4. Choose "Web application"
5. Add authorized origins and redirect URIs:
   
   **Development:**
   - Origins: `http://localhost:5173`, `http://localhost:5174`
   - Redirect: `http://localhost:5173/oauth2callback.html`
   
   **Production:**
   - Origins: `https://skillserve.web.app`
   - Redirect: `https://skillserve.web.app/oauth2callback.html`

6. Copy the Client ID to `.env.local` and `.env.production`

### 4. Set Up PayPal

**For Testing (Sandbox):**
1. Go to https://developer.paypal.com/
2. Log in or create account
3. Go to Apps & Credentials → Sandbox
4. Copy Sandbox Client ID to `.env.local` (set `VITE_PAYPAL_MODE=sandbox`)

**For Live (Production):**
1. Complete business verification
2. Go to Apps & Credentials → Live
3. Copy Live Client ID to `.env.production` (set `VITE_PAYPAL_MODE=live`)

### 5. Deploy to Firebase

```bash
# Build for production
npm run build

# Deploy
firebase deploy --only hosting,firestore:rules,storage

# Or use the npm script
npm run deploy
```

## Firestore Rules Overview

Your Firestore is now secured with:

```
✅ User Data: Only users can access their own data
✅ Jobs: Public read, authenticated create, owner update
✅ Subscriptions: Owner-only access
✅ Messages: Sender/recipient access only
✅ Food Orders: Owner-only access
✅ Payments: Owner-only access
✅ Analytics: User's own or admin access
```

**Security Model:**
- Default: **DENY** all access
- Whitelist collections and operations
- Validate ownership and authentication
- Size limits on file uploads (5MB-20MB)

## Storage Rules Overview

Your Cloud Storage is now secured with:

```
✅ User Avatars: 5MB limit, images only
✅ Documents: 10MB limit, PDFs and images
✅ Job Attachments: 20MB limit, any file
✅ Gallery: Public read, owner write
✅ Temporary: User-only access
```

## Testing the Setup

### Local Development
```bash
npm run dev
# Visit http://localhost:5173
# Test: Signup, Login, Google OAuth, Create Job, Post Food
```

### Production Testing
```bash
npm run build
npm run preview
# Visit http://localhost:4173
# Test all features before deploying
```

## Security Checklist

- [x] Firestore rules configured
- [x] Storage rules configured
- [x] Environment variables separated
- [x] .env files in .gitignore
- [x] Firebase credentials in code (using environment variables)
- [ ] Google OAuth credentials obtained
- [ ] PayPal credentials obtained
- [ ] 2FA enabled on Firebase account
- [ ] Firestore backups configured
- [ ] Cloud Logging enabled

## Important Security Notes

⚠️ **Never commit `.env.local` or `.env.production` to git**
- These files are in `.gitignore`
- They contain sensitive credentials
- Use them only locally and in production deployment

⚠️ **Keep Firebase credentials safe**
- Don't share your Google Client IDs
- Don't expose PayPal API credentials
- Use secret management in production

## Troubleshooting

### "Cannot find module 'firebase'"
```bash
npm install
```

### "Firebase not configured"
Check that `.env.local` has all VITE_FIREBASE_* variables

### "Firestore rules denied"
Review firestore.rules - make sure your collection names match

### "Google OAuth redirect error"
Check that redirect URI in `.env.local` matches Google Cloud Console

## Next Steps

1. ✅ Copy environment variables to `.env.local`
2. ✅ Get Google OAuth credentials
3. ✅ Get PayPal credentials
4. ✅ Deploy Firestore & Storage rules via Firebase Console or CLI
5. ✅ Test all features locally
6. ✅ Build & deploy to Firebase Hosting

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Deploy everything
npm run deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only firestore rules
firebase deploy --only firestore:rules

# Deploy only storage rules
firebase deploy --only storage

# View firestore rules
firebase firestore:indexes

# View live logs
firebase functions:log
```

## Support

- Firebase Docs: https://firebase.google.com/docs
- Firestore Rules: https://firebase.google.com/docs/firestore/security/get-started
- Storage Rules: https://firebase.google.com/docs/storage/security/start
- Google OAuth: https://developers.google.com/identity/protocols/oauth2

---

**Status:** ✅ Ready for deployment
**Last Updated:** December 8, 2025
**Project:** SkillServe (skillserve-c4c53)
