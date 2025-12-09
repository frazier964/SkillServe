# SkillServe Firebase Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

#### Development (.env.local)
- [x] Firebase configuration keys
- [ ] Google OAuth Client ID (from Google Cloud Console)
- [ ] PayPal Sandbox Client ID (from PayPal Dashboard)
- [ ] Local API endpoint

#### Production (.env.production)
- [x] Firebase configuration keys
- [ ] Google OAuth Production Client ID
- [ ] PayPal Live Client ID
- [ ] Production API endpoint

### 2. Firebase Console Setup

#### Authentication
```
Firebase Console → Authentication → Sign-in method
- [x] Email/Password (already configured)
- [ ] Google OAuth (configure redirect URIs)
- [ ] Verify authorized domains
```

**Steps:**
1. Go to https://console.firebase.google.com/project/skillserve-c4c53/authentication
2. Click "Google" sign-in provider
3. Enable it and add your domain
4. Add OAuth 2.0 redirect URI: `https://skillserve.web.app/oauth2callback.html`

#### Firestore Database
```
Firebase Console → Firestore Database
- [ ] Create database in production mode
- [ ] Deploy firestore.rules
```

**Steps:**
1. Go to https://console.firebase.google.com/project/skillserve-c4c53/firestore
2. Click "Create database" → Select "Production mode"
3. Choose region: `us-central1` (recommended)
4. Deploy rules: `firebase deploy --only firestore:rules`

#### Storage
```
Firebase Console → Storage
- [ ] Set up storage bucket
- [ ] Deploy storage.rules
```

**Steps:**
1. Go to https://console.firebase.google.com/project/skillserve-c4c53/storage
2. Click "Get started" → Choose production rules
3. Deploy rules: `firebase deploy --only storage`

### 3. Google Cloud Console Setup

1. Go to https://console.cloud.google.com/
2. Select project: `skillserve-c4c53`
3. Navigate to APIs & Services → OAuth 2.0 Client IDs
4. Create Web application credentials:
   - **Development:**
     - Authorized JavaScript origins: `http://localhost:5173`, `http://localhost:5174`, etc.
     - Authorized redirect URIs: `http://localhost:5173/oauth2callback.html`
   
   - **Production:**
     - Authorized JavaScript origins: `https://skillserve.web.app`
     - Authorized redirect URIs: `https://skillserve.web.app/oauth2callback.html`

### 4. PayPal Setup

#### Sandbox (Testing)
1. Go to https://developer.paypal.com/
2. Create/select sandbox app
3. Copy Sandbox Client ID to `.env.local`

#### Live (Production)
1. Complete business verification
2. Create live app
3. Copy Live Client ID to `.env.production`

## Deployment Steps

### Local Development
```bash
cd skillserve

# Install dependencies
npm install

# Set up environment variables
# Edit .env.local with your Google and PayPal IDs

# Start development server
npm run dev
```

### Build for Production
```bash
# Build the application
npm run build

# Preview the build locally
npm run preview
```

### Deploy to Firebase Hosting

#### First-time setup:
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init

# Set your Firebase project
firebase use skillserve-c4c53
```

#### Deploy application:
```bash
# Deploy everything (hosting, firestore rules, storage rules)
npm run deploy

# Or deploy individual components:
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage
```

#### Custom Domain (Optional):
```bash
# Link custom domain
firebase hosting:channel:deploy live --expires 7d

# Or via Firebase Console
```

## Post-Deployment Verification

### 1. Test Authentication
- [ ] Email/Password sign-up
- [ ] Email/Password login
- [ ] Google OAuth login
- [ ] Password reset
- [ ] Session persistence

### 2. Test Core Features
- [ ] Job posting
- [ ] Job browsing
- [ ] Food ordering
- [ ] Payment flow (test only)
- [ ] User profile updates

### 3. Monitor Performance
- Go to Firebase Console → Performance
- Check for slow operations
- Monitor database read/write operations

### 4. Enable Monitoring
```bash
# Enable Cloud Logging
firebase deploy --only firestore:indexes
```

## Firestore Rules Explanation

### Collections & Access Control

| Collection | Create | Read | Update | Delete |
|------------|--------|------|--------|--------|
| **users** | Own only | Own only | Own only | Admin only |
| **jobs** | Auth'd users | Public | Job owner | Job owner or admin |
| **subscriptions** | Own only | Own only | Own only | Own only |
| **messages** | Auth'd users | Recipient/Sender | Sender | Sender |
| **foodOrders** | Own only | Own only | Own only | Own only |
| **payments** | Own only | Own only | Own only | Own only |

### Security Features

1. **Authentication Required:** Most operations require `request.auth != null`
2. **Ownership Validation:** Users can only modify their own data
3. **Admin Functions:** Certain operations (like deleting other users) require admin role
4. **Field Validation:** Creates must include required fields
5. **Subcollections:** Protected with parent document ownership

## Storage Rules Explanation

### File Access Control

| Path | Public Read | Authenticated Write | Limits |
|------|------------|-------------------|--------|
| **user avatars** | Yes | Own user only | 5MB, images only |
| **user documents** | Own only | Own user only | 10MB |
| **job attachments** | Public | Auth'd users | 20MB |
| **food images** | Public | Auth'd only | 5MB |
| **user gallery** | Public | Own user only | 5MB, images only |
| **temp uploads** | Own user | Own user only | Unlimited |

## Troubleshooting

### Firebase Connection Issues
```javascript
// Check if Firebase is initialized
import { auth, db } from './firebase/FirebaseConfig';
console.log('Firebase initialized:', auth, db);
```

### Firestore Rules Errors
1. Check Firebase Console → Firestore → Rules
2. Review error logs in Cloud Logging
3. Test rules in Firestore Rules Playground

### Authentication Issues
1. Verify OAuth credentials in Google Cloud Console
2. Check redirect URIs match your domain
3. Review Firebase Authentication logs

### Deployment Issues
```bash
# Check Firebase CLI version
firebase --version

# Verify project ID
firebase projects:list

# Check deployment status
firebase hosting:sites:list
```

## Security Recommendations

1. **Enable 2FA** on Firebase Console account
2. **Rotate credentials** regularly
3. **Use environment variables** for sensitive data
4. **Monitor** Firestore read/write operations
5. **Enable** Cloud Logging for debugging
6. **Regular backups** of Firestore data
7. **Set budget alerts** in Firebase Console

## Useful Firebase CLI Commands

```bash
# View logs
firebase functions:log

# View Firestore indexes
firebase firestore:indexes

# Delete data (be careful!)
firebase firestore:delete --recursive <collection>

# Export data
firebase firestore:export gs://your-bucket/backup

# Import data
firebase firestore:import gs://your-bucket/backup
```

## Support Resources

- Firebase Documentation: https://firebase.google.com/docs
- Firebase Console: https://console.firebase.google.com/
- Google Cloud Console: https://console.cloud.google.com/
- Community Help: https://stackoverflow.com/questions/tagged/firebase

---

**Last Updated:** December 8, 2025
**Project:** SkillServe
**Firebase Project ID:** skillserve-c4c53
