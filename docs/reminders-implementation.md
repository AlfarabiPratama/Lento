# 🔔 Reminder & Notification Implementation Plan

> **Status:** 📋 Queued (Not Yet Implemented)  
> **Priority:** Medium  
> **Dependencies:** PWA Service Worker (existing), Supabase Sync (for Phase 3)

---

## Overview

Sistem notifikasi bertahap untuk Lento dengan pendekatan "gentle nudge" yang tidak mengganggu.

## Phases

### Phase 1: In-App Gentle Reminder ⭐ (Priority)

**Objective:** Reminder yang muncul saat user membuka app.

#### Files to Create

```
src/features/reminders/
├── reminderTypes.js      # Definisi jenis reminder
├── reminderChecks.js     # Logic kapan reminder muncul
└── reminderConfig.js     # Konfigurasi threshold

src/hooks/
└── useReminders.js       # Hook untuk get active reminders

src/contexts/
└── ReminderContext.jsx   # Global state untuk dismiss/snooze

src/components/reminders/
├── ReminderBanner.jsx    # Banner di Today page
├── ReminderCard.jsx      # Card reminder dengan action
└── ReminderToast.jsx     # Toast notification (dismissable)
```

#### Reminder Types

| Type | Condition | Message |
|------|-----------|---------|
| `habit_unchecked` | Ada habit belum check-in hari ini | "3 habit menunggu check-in" |
| `journal_empty` | Belum ada jurnal hari ini | "Belum menulis jurnal, 1 menit cukup" |
| `budget_warning` | Kategori budget > 80% | "Budget Makan hampir habis (85%)" |
| `pomodoro_idle` | Belum ada sesi fokus hari ini | "Belum fokus hari ini, mulai 25m?" |
| `goal_milestone` | Goal mencapai 25/50/75% | "Target iPhone sudah 50%! 🎉" |

#### Data Model

```javascript
// reminderTypes.js
export const REMINDER_TYPES = {
  HABIT_UNCHECKED: 'habit_unchecked',
  JOURNAL_EMPTY: 'journal_empty',
  BUDGET_WARNING: 'budget_warning',
  POMODORO_IDLE: 'pomodoro_idle',
  GOAL_MILESTONE: 'goal_milestone',
}

// Reminder object structure
{
  id: string,
  type: REMINDER_TYPES,
  title: string,
  message: string,
  action: { label: string, route: string },
  priority: 'low' | 'medium' | 'high',
  dismissable: boolean,
  snoozeable: boolean,
  snoozeMinutes: 60,
}
```

#### UI Components

**ReminderBanner:**

- Muncul di atas Today widgets
- Gentle gradient background (tidak merah/alert)
- CTA button ke halaman terkait
- Dismiss dengan swipe atau X button

**ReminderCard:**

- Untuk reminder dengan detail
- Icon + title + message + action button
- Support snooze (1 jam, hari ini, besok)

---

### Phase 2: Local Notification (PWA)

**Objective:** Notifikasi browser saat app di background.

#### Requirements

- User permission via `Notification.requestPermission()`
- Service Worker untuk handle notification click
- LocalStorage untuk scheduled notifications

#### Files to Add

```
src/features/reminders/
├── notificationService.js    # Request permission, show notif
└── notificationScheduler.js  # Schedule local notifs

public/
└── sw.js (update)            # Handle notification click
```

#### Implementation Notes

```javascript
// notificationService.js
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  
  const permission = await Notification.requestPermission()
  return permission // 'granted' | 'denied' | 'default'
}

export function showLocalNotification(title, options) {
  if (Notification.permission !== 'granted') return
  
  return new Notification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    ...options,
  })
}
```

#### Notification Triggers

| Trigger | Timing | Message |
|---------|--------|---------|
| Morning reminder | 08:00 | "Selamat pagi! Cek habit hari ini" |
| Evening review | 20:00 | "Hari sudah hampir usai, review yuk" |
| Pomodoro break | After 25m focus | "Break 5 menit, stretch!" |

---

### Phase 3: Push Notification (Server)

**Objective:** Real push notification dari server.

#### Requirements

- Supabase Edge Functions
- Web Push API + VAPID keys
- Push subscription storage
- Background sync

#### Architecture

```
[Supabase Edge Function]
        ↓
[Web Push Service (FCM/Mozilla)]
        ↓
[Service Worker]
        ↓
[User's Browser]
```

#### Files to Add

```
supabase/functions/
└── send-push/
    └── index.ts          # Edge function untuk send push

src/features/reminders/
├── pushSubscription.js   # Subscribe/unsubscribe
└── pushConfig.js         # VAPID keys config
```

#### Database Schema (Supabase)

```sql
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

CREATE TABLE scheduled_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  payload JSONB
);
```

---

## Settings UI

### Notification Preferences Page

```
src/pages/NotificationSettings.jsx
```

| Setting | Options |
|---------|---------|
| In-app reminders | On / Off |
| Morning reminder | Off / 07:00 / 08:00 / 09:00 |
| Evening reminder | Off / 19:00 / 20:00 / 21:00 |
| Budget alerts | On / Off |
| Goal milestones | On / Off |

---

## Implementation Order

1. **Phase 1A:** Create ReminderContext + useReminders hook
2. **Phase 1B:** Implement reminderChecks logic
3. **Phase 1C:** Build ReminderBanner for Today page
4. **Phase 1D:** Add dismiss/snooze functionality
5. **Phase 2A:** Request notification permission UI
6. **Phase 2B:** Implement local notification service
7. **Phase 2C:** Schedule morning/evening reminders
8. **Phase 3:** Wait for Supabase sync maturity

---

## Best Practices (MDN Guidelines)

- ✅ Notifikasi harus **berguna** dan **time-sensitive**
- ✅ Mudah untuk **opt-out**
- ✅ Jangan spam — max 2-3 per hari
- ✅ Gunakan **"if-then plan"** untuk habit reminders
- ✅ Soft nudge, bukan alarm

---

## References

- [MDN Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web Push VAPID](https://web.dev/push-notifications-overview/)
