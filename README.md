# Lento PWA

Lento is a modern Progressive Web App (PWA) for personal productivity, featuring Space (Notes) and Book Tracking.

## 🌟 Features

### 🌌 Space (Notes)

- **Tags**: Inline tagging (`#tag`), filter by tags, smart filters (Today/Week).
- **Knowledge Graph**:
  - **Wiki Links**: `[[Note Title]]`, aliases `[[Link|Text]]`, anchors `[[Link#Heading]]`.
  - **Backlinks**: bidirectional linking logic.
- **Slash Commands**: Notion-style `/` menu (`/todo`, `/h1`, `/date`, etc.).
- **Optimistic UI**: Instant updates for title/content sync.
- **Notebooks**: Organize notes into spaces/ruang.

### 📚 Books

- Track reading sessions, logs, and progress.
- Weekly reading statistics.
- Mobile-first design.

## 🛠️ Tech Stack

- **Core**: React 18, Vite, Tailwind CSS
- **PWA**: `vite-plugin-pwa` (Service Worker, Offline support)
- **Data**: IndexedDB (via `idb` wrapper) - Local First Architecture
- **Backend**: Firebase
  - **Auth**: Google Sign-In
  - **Firestore**: Cloud sync with offline persistence
  - **FCM**: Push notifications
  - **Hosting**: Production deployment
- **Icons**: Tabler Icons React

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS recommended)

### Installation

```bash
npm install
```

### Development

Start the dev server:

```bash
npm run dev
```

### Production Build

Build the app and preview it locally:

```bash
npm run build
npm run preview
```

### Deploy to Firebase

```bash
npm run build
firebase deploy --only "hosting,firestore:rules"
```

**Live URL:** <https://lento-less-rush-more-rhythm.web.app>

## 📱 PWA Support

Lento is designed to be installed on your device.

- **Install**: Use "Add to Home Screen" in your browser.
- **Offline**: Works fully offline using Service Worker caching and IndexedDB.
- **Sync**: Login with Google to sync data across devices.

## 📖 Documentation

Detailed session logs and architecture notes can be found in the `docs/` folder.

- **[Firebase Migration](docs/2025-12-28-firebase-migration.md)** - Auth, FCM, Firestore, Hosting
- **[Quest Engine](docs/quest-engine.md)** - Gamification system
- **[Settings Tabs](docs/settings-tabs.md)** - ARIA tabs implementation

### Key Architecture Files

To understand the **Space** module, read these files in order:

1. **Core UI**: [`src/pages/Space.jsx`](src/pages/Space.jsx)
    - Main entry point. Handles layout, Slash triggers, and events.
2. **State Logic**: [`src/hooks/usePages.js`](src/hooks/usePages.js)
    - Manages Pages, Tags, and In-Memory Backlinks Index.
3. **Parsers**:
    - [`src/features/space/tagParser.js`](src/features/space/tagParser.js) (Regex for `#tag`)
    - [`src/features/space/linkParser.js`](src/features/space/linkParser.js) (Regex for `[[Wiki]]`)
4. **Data Layer**: [`src/lib/pages.js`](src/lib/pages.js)
    - CRUD and auto-extraction logic.

## ⚠️ Known Behaviors

- **Link Resolution**: Case-insensitive matching. Links to missing notes appear red (unresolved).
- **Slash Commands**: Triggered only at the start of a line or after whitespace.
- **Optimistic UI**: Sidebar updates instantly; database saves are debounced (800ms).
- **Sync**: Manual sync via Settings → Sync. Uses last-write-wins strategy.

## 🗺️ Roadmap

- [x] Tags & Filters
- [x] Internal Links & Backlinks
- [x] Slash Commands
- [x] Notebooks / Spaces
- [x] Firebase Auth (Google Sign-In)
- [x] Firestore Cloud Sync
- [x] Push Notifications (FCM)
- [ ] Real-time sync (auto-sync on change)
- [ ] Inbox Triage (Inbox/Archive/Trash)
- [ ] Pinning Notes
