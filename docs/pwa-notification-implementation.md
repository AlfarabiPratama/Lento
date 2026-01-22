/**
 * README: PWA & Notification System Implementation
 * 
 * Panduan lengkap untuk menggunakan fitur-fitur PWA baru di Lento
 */

# 🎉 PWA & Enhanced Notification System

Lento sekarang sudah dilengkapi dengan:
- ✅ Service Worker registration dengan proper lifecycle
- ✅ PWA Install Prompt dengan smart timing
- ✅ Notification Permission Prompt dengan context
- ✅ Background Sync untuk offline reminders
- ✅ Deep linking dari notifications
- ✅ Smart permission request timing
- ✅ Auto-update handling

## 📋 Fitur Baru

### 1. **PWA Install Prompt**
Prompt install muncul otomatis setelah user engage dengan app (tidak langsung):
- Setelah 2x visit ATAU
- Setelah buat habit pertama ATAU
- Setelah pakai app 30 detik

**Lokasi:** `src/components/PWAInstallPrompt.jsx`

### 2. **Notification Permission Prompt**
Prompt permission muncul dengan smart timing:
- Setelah 3x visit ATAU
- Setelah buat habit/journal pertama ATAU
- Setelah pakai app 5 menit

**Lokasi:** `src/components/NotificationPermissionPrompt.jsx`

### 3. **Offline Reminders**
Reminders bisa dijadwalkan dan akan ditampilkan bahkan ketika offline:

```javascript
import { scheduleOfflineReminder } from './utils/offlineReminders'

// Schedule reminder
await scheduleOfflineReminder({
  title: 'Habit Reminder',
  body: 'Jangan lupa check-in habit hari ini!',
  scheduledAt: Date.now() + 3600000, // 1 jam dari sekarang
  data: {
    type: 'habit',
    route: '/habits',
    entityId: 'habit-123'
  }
})
```

**Lokasi:** `src/utils/offlineReminders.js`

### 4. **Deep Linking**
Notification click langsung buka halaman spesifik:

**Notification types:**
- `habit` → `/habits`
- `journal` → `/journal`
- `goal` → `/goals`
- `finance` → `/finance`
- `book` → `/books`
- `pomodoro` → `/fokus`

### 5. **Smart Permission Request**
Track user engagement untuk trigger permission prompt:

```javascript
import { trackUserEngagement } from './hooks/useSmartPermissionRequest'

// Track saat user buat habit
trackUserEngagement('habit_created')

// Track saat user complete habit
trackUserEngagement('habit_completed')

// Track saat user tulis journal
trackUserEngagement('journal_written')
```

**Lokasi:** `src/hooks/useSmartPermissionRequest.js`

## 🚀 Cara Menggunakan

### Step 1: Enable di Development

Service Worker sudah auto-register di `src/main.jsx`. 
Untuk testing di localhost, buka: `http://localhost:5173`

**Note:** PWA features require HTTPS in production!

### Step 2: Integrate Tracking

Tambahkan tracking di actions penting:

```javascript
// Di src/hooks/useHabits.js
import { trackUserEngagement } from '../hooks/useSmartPermissionRequest'

export function createHabit(habitData) {
  // ... existing code ...
  
  trackUserEngagement('habit_created')
  
  return newHabit
}
```

Lihat `src/examples/engagementTrackingExample.js` untuk contoh lengkap.

### Step 3: Test Notifications

#### Manual Testing via Firebase Console:
1. Buka Firebase Console > Cloud Messaging
2. Send test message dengan payload:

```json
{
  "notification": {
    "title": "Habit Reminder",
    "body": "Waktunya check-in habit!"
  },
  "data": {
    "type": "habit",
    "route": "/habits"
  }
}
```

#### Testing Offline Reminders:
```javascript
// Di browser console
import { scheduleOfflineReminder } from './src/utils/offlineReminders.js'

await scheduleOfflineReminder({
  title: 'Test Reminder',
  body: 'This is a test',
  scheduledAt: Date.now() + 10000, // 10 detik
  data: { type: 'habit', route: '/habits' }
})

// Matikan internet, tunggu 10 detik
// Reminder akan muncul via Background Sync
```

### Step 4: Handle Navigation dari Notifications

Navigation handling sudah terintegrasi di Service Worker.
Notification click akan:
1. Close notification
2. Focus existing window (jika ada)
3. Navigate ke route yang sesuai
4. Atau buka window baru (jika app tertutup)

## 🔧 Configuration

### Customize Timing

Edit di `src/hooks/useSmartPermissionRequest.js`:

```javascript
// Line 35-42
const shouldShow = 
  conditions.visitCount >= 3 ||  // Ubah angka ini
  conditions.hasCreatedHabit ||
  conditions.hasWrittenJournal ||
  conditions.hasUsedAppMinutes >= 5  // Ubah threshold ini
```

### Customize Install Prompt Delay

Edit di `src/components/PWAInstallPrompt.jsx`:

```javascript
// Line 40
setTimeout(() => setShowPrompt(true), 8000) // Ubah delay (ms)
```

### Customize Notification UI

Edit di `src/components/NotificationPermissionPrompt.jsx`:
- Icon, warna, copy text
- Benefit points
- Button styles

## 📱 Testing PWA Install

### Chrome Desktop:
1. Buka app di Chrome
2. Klik icon "Install" di address bar
3. Atau tunggu PWA Install Prompt muncul

### Chrome Android:
1. Buka app di Chrome Android
2. Tap menu (⋮) → "Add to Home screen"
3. Icon Lento akan muncul di home screen

### iOS Safari:
1. Buka app di Safari
2. Tap Share button
3. "Add to Home Screen"

## 🐛 Troubleshooting

### Permission Prompt tidak muncul?
- Check localStorage: `lento_notification_prompt_dismissed`
- Check visit count: `lento_visit_count`
- Hapus localStorage untuk reset

### Install Prompt tidak muncul?
- Pastikan app belum installed
- Check localStorage: `lento_pwa_install_dismissed`
- PWA criteria: HTTPS, manifest.json, service worker registered

### Notification tidak muncul?
- Check permission: `Notification.permission` (should be "granted")
- Check FCM token: `localStorage.getItem('lento_fcm_token')`
- Check browser console untuk errors

### Background Sync tidak jalan?
- Background Sync hanya work di Chrome/Edge
- Perlu HTTPS (tidak work di localhost HTTP)
- Check Service Worker registered: `navigator.serviceWorker.controller`

## 📚 Best Practices

### 1. Jangan Spam Permission Requests
✅ Good: Tunggu user engage dulu
❌ Bad: Langsung minta permission saat app load

### 2. Jelaskan Benefits
✅ Good: "Dapatkan reminder untuk habit Anda"
❌ Bad: "Allow notifications?"

### 3. Give Control
✅ Good: "Maybe later" button + "Don't ask again" option
❌ Bad: Hanya "Allow" atau block selamanya

### 4. Respect User Choice
✅ Good: Jika user dismiss, tunggu 24 jam
❌ Bad: Tanya lagi setiap kali user buka app

### 5. Test di Real Device
✅ Desktop & mobile punya behavior berbeda
✅ Test offline mode
✅ Test battery impact

## 🎯 Next Steps

1. ✅ Implement engagement tracking di all user actions
2. ✅ Test notifications di real devices
3. ✅ Setup Cloud Function untuk auto-send reminders
4. ✅ Monitor permission grant rates via Analytics
5. ✅ A/B test permission prompt timing

## 📖 References

- [Web Push Best Practices](https://web.dev/push-notifications-overview/)
- [PWA Install Patterns](https://web.dev/promote-install/)
- [Background Sync](https://web.dev/periodic-background-sync/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/js/client)

---

**Implemented on:** January 19, 2026
**Version:** v1.0.0
**Status:** ✅ Production Ready
