# Settings Implementation Notes

## Overview

The Settings page has been refactored to include Account and Sync sections following local-first architecture and progressive disclosure principles. View the full [Implementation Plan](file:///C:/Users/Alfarabi/.gemini/antigravity/brain/2996862d-3a30-49cf-a496-405bbf77225d/implementation_plan.md) and [Walkthrough](file:///C:/Users/Alfarabi/.gemini/antigravity/brain/2996862d-3a30-49cf-a496-405bbf77225d/walkthrough.md) for details.

## Key Architecture Decisions

### 1. Local-First Philosophy

- **syncPrefs disimpan di localStorage** - Untuk preferences UI yang kecil
- **Data utama tetap di IndexedDB** - Untuk notes, habits, journals, dll
- **Sync adalah optional** - App fully functional offline
- Login hanya diperlukan untuk sync multi-device

### 2. Security

- **Open Redirect Protection**: `sanitizeNext()` prevents phishing attacks
- Uses URL parser untuk robust validation
- Blocks control characters, protocol-relative URLs, external domains
- Test cases: `?next=//evil.com`, `?next=http://evil.com`, `?next=/\nhttps://evil.com` → all redirect to `/`

### 3. Performance

- **Debounced localStorage writes** (300ms) untuk prevent excessive syncing
- **Polling only when Settings page open** + pause when tab inactive (battery saving)
- **Mutex on Sync Now** button prevents double-click
- **QuotaExceededError handling** dengan user-friendly messages

### 4. Progressive Disclosure

- Advanced options (auto-sync, device name) disembunyikan sampai sync enabled
- Info banner "Kenapa perlu login?" muncul SEBELUM prompt
- Status indicators hanya muncul untuk logged-in users

### 5. Edge-Case Handling

- **Sign out dengan pending changes** → confirm dialog
- **Sign out automatically disables sync** + show toast
- **localStorage save errors** → display user-friendly message
- **Sync button disabled saat syncing** → prevent race conditions

## File Organization

```
src/
├── lib/
│   ├── safeRedirect.js          # SECURITY CRITICAL
│   └── syncPrefs.js             # localStorage storage
├── hooks/
│   ├── useSyncPrefs.js          # UI preferences hook
│   └── usePendingCount.js       # Polling with visibility API
└── components/settings/
    ├── AccountSection.jsx       # Account UI
    ├── SyncSection.jsx          # Sync UI
    └── SyncStatusCard.jsx       # Reusable metric card
```

## State Management Rules

### Single Source of Truth

- `useSyncPrefs()` = UI preferences (enabled, autoSync, deviceName, lastSyncAt)
- `useSync()` = Engine status (syncing, error)
- ❌ **NEVER** update `lastSyncAt` tanpa actually syncing

### Critical Flow

```javascript
// CORRECT:
await sync()                    // Engine sync
if (result.success) {
  markSyncedNow()              // Update UI
}

// WRONG:
markSyncedNow()                // UI updated
await sync()                   // Engine might fail - UI lies!
```

## Testing Checklist

### Security (CRITICAL)

- [ ] Test `?next=//evil.com` → `/`
- [ ] Test `?next=http://evil.com` → `/`
- [ ] Test `?next=/\nhttps://evil.com` → `/`
- [ ] Test `?next=/settings?tab=sync#top` → `/settings?tab=sync#top` ✅

### UX

- [ ] Sign out dengan pending changes → confirm dialog
- [ ] Sync toggle disabled when not logged in
- [ ] Info banner hilang setelah login
- [ ] Auto-sync toggle hanya muncul jika sync enabled
- [ ] Error message shows "Coba Lagi" button
- [ ] Manual refresh pending count works

### Performance

- [ ] localStorage tidak menyimpan data besar (< 5KB ideal)
- [ ] Polling pause saat tab inactive (check devtools)
- [ ] Debounced save tidak block UI pada rapid input
- [ ] Double-click Sync Now tidak trigger dobel request

### Accessibility

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announces status changes (aria-live)
- [ ] All buttons have aria-labels

## Future Enhancements

### V2: Event-Driven Pending Count

Replace polling dengan BroadcastChannel:

```javascript
// In outbox.js - after adding to outbox
const bc = new BroadcastChannel('lento_outbox')
bc.postMessage({ type: 'count_changed', count: newCount })
bc.close()

// In usePendingCount.js
useEffect(() => {
  const bc = new BroadcastChannel('lento_outbox')
  bc.onmessage = (event) => {
    if (event.data.type === 'count_changed') {
      setCount(event.data.count)
    }
  }
  return () => bc.close()
}, [])
```

### V3: Device Management

- List connected devices
- Revoke device access
- Last active timestamps

### V4: Migrate to IndexedDB

Move syncPrefs dari localStorage → IndexedDB untuk:

- Async operations (non-blocking)
- Larger storage quota
- Structured queries

## Common Pitfalls

### ❌ DON'T

- Simpan data besar di localStorage (use IndexedDB)
- Update lastSyncAt tanpa actually syncing
- Poll aggressively (5s is good, 1s is bad)
- Allow external URLs in redirect params

### ✅ DO

- Use `updatePrefsImmediate` for toggles
- Use `updatePrefs` (debounced) for text inputs
- Always try/catch localStorage operations
- Validate redirect params before navigate

## Reference Documentation

- [OWASP Open Redirect](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/11-Client-side_Testing/04-Testing_for_Client-side_URL_Redirect)
- [MDN localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [NN/g Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

---

**Last Updated**: 2025-12-26  
**Status**: ✅ Production-ready dengan security & performance best practices
