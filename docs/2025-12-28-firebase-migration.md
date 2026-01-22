# Development Log - 2025-12-28

## Session Summary

**Major migration: Supabase → Firebase** for Auth, Push Notifications, Cloud Sync, and Hosting.

---

## 🔥 Firebase Migration

### 1. Firebase Auth (Google Sign-In)

**Files:**

- `src/lib/firebase.js` - Added Auth with Google provider
- `src/hooks/useAuth.js` - Rewrote for Firebase Auth
- `src/components/settings/AccountSection.jsx` - Google Sign-In button + avatar

**Features:**

- Google Sign-In popup with account picker
- Guest-first UX: "(opsional)" label, value proposition microcopy
- Merge reassurance: "Data lokal akan digabung ke akun"

---

### 2. Firebase Cloud Messaging (FCM)

**Files:**

- `src/lib/firebase.js` - Added FCM with VAPID key
- `public/firebase-messaging-sw.js` - Background notification handler
- `src/hooks/usePushNotifications.js` - FCM hook
- `src/features/reminders/pushSubscription.js` - Migrated to FCM

**Features:**

- FCM token management
- Foreground/background notifications
- Indonesian localized actions

---

### 3. Firestore Cloud Sync

**Files:**

- `src/lib/firebase.js` - Added Firestore with offline persistence
- `src/lib/firestoreSyncEngine.js` - **NEW** Push/Pull/FullSync
- `src/hooks/useSync.js` - Rewrote for Firestore

**Collection Structure:**

```
users/{uid}/
├── pages/      ← notes
├── notebooks/  ← ruang
├── habits/     ← kebiasaan
└── journals/   ← jurnal
```

**Sync Strategy:** Last-write-wins based on `updatedAt`

---

### 4. Firebase Hosting

**Files:**

- `firebase.json` - Hosting config with SPA rewrites
- `firestore.rules` - Security rules (user can only access own data)

**Deployment:**

```bash
npm run build && firebase deploy --only "hosting,firestore:rules"
```

**Live URL:** <https://lento-less-rush-more-rhythm.web.app>

---

## UX Improvements

### Login Prompt Modal

**File:** `src/components/settings/LoginPromptModal.jsx`

- A11y: focus trap, Esc to close, aria-label
- 2-button pattern: "Masuk dengan Google" / "Nanti saja"
- Triggered when user clicks Sync without login

### Account Section Microcopy

- Header: "Akun (opsional)"
- Value: "Masuk untuk sinkron antar perangkat dan backup cloud"
- Safety: "Tanpa akun, Lento tetap bisa dipakai"

---

## Deployment

**Old URL:** <https://lento-flame.vercel.app> (Vercel)
**New URL:** <https://lento-less-rush-more-rhythm.web.app> (Firebase)

**Status:** ✅ Success
