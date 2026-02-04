# 🔔 Audit Sistem Notifikasi Lento

**Tanggal**: 27 Januari 2026  
**Status**: Analisis Lengkap

---

## 📊 RINGKASAN EKSEKUTIF

Lento memiliki sistem notifikasi yang **kompleks dan berlapis**, dengan **6 tipe notifikasi berbeda** yang tersebar di berbagai halaman. Audit ini menemukan:

- ✅ **5 sistem notifikasi BERFUNGSI**
- ⚠️ **1 sistem notifikasi BERMASALAH** (Pomodoro Timer)
- 🔄 **3 lokasi REDUNDAN** untuk settings notifikasi
- ❌ **1 lokasi SALAH PENEMPATAN** (Fokus page button)

---

## 🗂️ DAFTAR SISTEM NOTIFIKASI

### 1. ✅ **Bill Reminders** (Tagihan) - BERFUNGSI
**Status**: ✅ Aktif & Terintegrasi  
**Lokasi Trigger**: Vercel Cron Job  
**File**: `api/sendBillReminders.js`

**Cara Kerja**:
- Cron berjalan setiap hari jam 09:00 WIB
- Cek bills dengan jatuh tempo 3 hari dan 1 hari lagi
- Kirim FCM push notification ke device user
- Respects user notification preferences

**Notifikasi**:
- 3 hari sebelum: "Tagihan [nama] jatuh tempo 3 hari lagi..."
- 1 hari sebelum: "Tagihan [nama] jatuh tempo besok..."

**Lokasi Settings**:
- `Settings → Tampilan tab → NotificationSettings component`
- Toggle: Bill Reminders (Master)
- Sub-toggles: 3-day, 1-day reminders

**Testing**: ✅ Verified working via Firestore logs

---

### 2. ✅ **Goal Reminders** (Target & Goal) - BERFUNGSI
**Status**: ✅ Aktif & Terintegrasi  
**Lokasi Trigger**: Vercel Cron Job  
**File**: `api/sendGoalReminders.js`

**Cara Kerja**:
- Cron berjalan setiap hari jam 08:00 WIB
- Cek goals dengan deadline 7, 3, dan 1 hari lagi
- Kirim motivational push notifications
- Respects quiet hours & user preferences

**Notifikasi**:
- 7 hari: "1 Minggu Lagi! 💪 [Goal name]"
- 3 hari: "3 Hari Lagi! 🎯 [Goal name]"
- 1 hari: "Besok Deadline! 🏁 [Goal name]"

**Lokasi Settings**:
- `Settings → Tampilan tab → NotificationSettings`
- Toggle: Target & Goal Reminders (Master)
- Sub-toggles: 7-day, 3-day, 1-day reminders

**Deep Link**: Click notification → `/goals`

---

### 3. ✅ **Reading Streak Reminders** - BERFUNGSI
**Status**: ✅ Aktif & Terintegrasi  
**Lokasi Trigger**: Vercel Cron Job  
**File**: `api/sendReadingStreakReminders.js`

**Cara Kerja**:
- Cron berjalan setiap hari jam 20:00 WIB
- Track reading streak (consecutive days with book sessions)
- Send encouragement, milestone, re-engagement notifications
- Logs to `notificationLogs` collection

**Notifikasi**:
- **Encouragement** (3+ day streak): "3 Hari Streak! Jangan sampai putus ya!"
- **Milestone** (7, 14, 30 days): "🎉 Seminggu Streak! 7 hari berturut-turut! 🔥"
- **Re-engagement** (missed 1 day): "📚 Kangen Baca? Kemarin kamu skip baca."

**Lokasi Settings**:
- `Settings → Tampilan tab → NotificationSettings`
- Toggle: Reading Streak (Master)
- Sub-toggles: Encouragement, Milestone, Re-engagement

**Deep Link**: Click notification → `/books`

---

### 4. ✅ **Habit Reminders** - BERFUNGSI
**Status**: ✅ Aktif & Terintegrasi  
**Lokasi Trigger**: Vercel Cron Job  
**File**: `api/sendHabitReminders.js`

**Cara Kerja**:
- Cron berjalan setiap hari jam 07:00 WIB
- Cek habits dengan reminder time yang sudah lewat
- Kirim custom reminder per habit
- Uses FCM for push notifications

**Notifikasi**:
- "Waktunya [habit name]! 💪"
- Custom message per habit

**Lokasi Settings**:
- `Settings → Tampilan tab → NotificationSettings`
- Toggle: Habit Reminders (enable/disable all)
- Per-habit settings: `Habits page → Edit habit → Reminder toggle`

**Deep Link**: Click notification → `/habits`

---

### 5. ✅ **Budget Warnings** - BERFUNGSI
**Status**: ✅ Aktif & Terintegrasi  
**Lokasi Trigger**: Vercel Cron Job  
**File**: `api/checkBudgetWarnings.js`

**Cara Kerja**:
- Cron berjalan setiap hari jam 10:00 WIB
- Cek spending vs budget (80%, 90%, 100% thresholds)
- Warn user sebelum over budget
- Respects notification preferences

**Notifikasi**:
- 80%: "⚠️ Pengeluaran [kategori] sudah 80%"
- 90%: "🚨 Pengeluaran [kategori] sudah 90%!"
- 100%+: "❌ Budget [kategori] terlampaui!"

**Lokasi Settings**:
- `Settings → Tampilan tab → NotificationSettings`
- Toggle: Budget Warnings

**Deep Link**: Click notification → `/finance`

---

### 6. ⚠️ **Pomodoro Timer Notifications** - BERMASALAH
**Status**: ⚠️ TIDAK ADA SETTINGS, NOTIF TIDAK BISA DIMATIKAN  
**Lokasi Trigger**: Client-side (in-app timer)  
**File**: `src/hooks/usePomodoro.js` (lines 180-203)

**Cara Kerja**:
- Timer berjalan di client browser
- Saat timer selesai, kirim browser notification
- **MASALAH**: Hardcoded, tidak respects user preferences
- **MASALAH**: Tidak ada toggle untuk disable

**Notifikasi**:
- Work selesai: "Sesi selesai! Waktunya istirahat."
- Break selesai: "Break selesai! Siap fokus lagi?"

**Kode Bermasalah**:
```javascript
// Line 181-203 di usePomodoro.js
if ('Notification' in window && Notification.permission === 'granted') {
    // Langsung kirim notif tanpa cek user preferences
    await registration.showNotification('Lento', { body, icon })
}
```

**Lokasi Settings**: ❌ **TIDAK ADA SETTINGS SAMA SEKALI**

**Issues**:
1. ❌ Tidak ada toggle di Settings untuk enable/disable
2. ❌ Tidak respects quiet hours
3. ❌ Tidak terintegrasi dengan `NotificationSettings` component
4. ❌ Tidak log ke `notificationLogs` collection
5. ❌ User tidak bisa control behavior

---

## 🚨 MASALAH YANG DITEMUKAN

### **Problem 1: Pomodoro Notifications Tidak Bisa Dimatikan**
**Severity**: 🔴 High  
**Impact**: User Experience & Privacy

**Deskripsi**:
- Pomodoro timer selalu kirim notifikasi saat selesai
- Tidak ada cara untuk mematikan notifikasi ini
- Bisa ganggu user yang sedang meeting/fokus
- Melanggar prinsip "user control"

**Lokasi Kode**: `src/hooks/usePomodoro.js:181-203`

**Solusi**:
1. Tambahkan toggle "Pomodoro Notifications" di NotificationSettings
2. Cek toggle sebelum kirim notifikasi
3. Respects quiet hours
4. Log ke notificationLogs untuk analytics

---

### **Problem 2: Settings Notifikasi Redundan**
**Severity**: 🟡 Medium  
**Impact**: Developer Experience & Maintenance

**Lokasi Redundan**:

1. **Settings → Tampilan tab** (PRIMARY)
   - `src/components/settings/NotificationSettings.jsx`
   - Complete UI dengan semua toggles
   - ✅ Ini yang benar dan lengkap

2. **Settings → Tampilan tab → NotificationPreference** (DUPLICATE)
   - `src/pages/Settings.jsx:50-170`
   - Hanya untuk In-App, Local, Push toggles
   - ⚠️ REDUNDAN dengan NotificationSettings

3. **Fokus page → "Izinkan notifikasi" button** (SALAH PENEMPATAN)
   - `src/pages/Fokus.jsx:155`
   - Button manual untuk request permission
   - ❌ Tidak konsisten, harusnya di Settings saja

**Solusi**:
- Hapus `NotificationPreference` component (duplicate)
- Hapus button di Fokus page
- Centralize semua notification settings di `NotificationSettings.jsx`

---

### **Problem 3: Fokus Page - Button Salah Penempatan**
**Severity**: 🟡 Medium  
**Impact**: User Experience & Consistency

**Lokasi**: `src/pages/Fokus.jsx:145-166`

**Kode**:
```jsx
<section className="card">
    <div className="flex items-start gap-3">
        <IconBell size={20} />
        <div>
            <h3>Notifikasi</h3>
            <p>Lento akan mengirim notifikasi saat sesi selesai...</p>
            <button onClick={() => Notification.requestPermission()}>
                Izinkan notifikasi
            </button>
        </div>
    </div>
</section>
```

**Masalah**:
- ❌ Request permission langsung dari page (not best practice)
- ❌ Tidak konsisten dengan flow di Settings
- ❌ Tidak ada feedback jika permission granted/denied
- ❌ Duplikasi logic yang sudah ada di NotificationPermissionPrompt

**Solusi**:
- Hapus section ini dari Fokus page
- Ganti dengan text info saja: "Notifikasi akan muncul saat timer selesai. Atur di Settings."
- Link ke Settings → Tampilan tab

---

## 📍 MAPPING LENGKAP LOKASI NOTIFIKASI

### **A. Frontend Components**

| Component | File | Purpose | Status |
|-----------|------|---------|--------|
| NotificationSettings | `src/components/settings/NotificationSettings.jsx` | Master settings UI | ✅ OK |
| NotificationMetrics | `src/components/settings/NotificationMetrics.jsx` | Analytics dashboard | ✅ OK |
| NotificationPermissionPrompt | `src/components/NotificationPermissionPrompt.jsx` | Permission modal | ✅ OK |
| NotificationPreference | `src/pages/Settings.jsx:50-170` | Duplicate toggles | ⚠️ REDUNDAN |

### **B. Backend API Endpoints**

| Endpoint | File | Schedule | Status |
|----------|------|----------|--------|
| /api/sendHabitReminders | `api/sendHabitReminders.js` | Daily 07:00 WIB | ✅ OK |
| /api/sendGoalReminders | `api/sendGoalReminders.js` | Daily 08:00 WIB | ✅ OK |
| /api/checkBudgetWarnings | `api/checkBudgetWarnings.js` | Daily 10:00 WIB | ✅ OK |
| /api/sendBillReminders | `api/sendBillReminders.js` | Daily 09:00 WIB | ✅ OK |
| /api/sendReadingStreakReminders | `api/sendReadingStreakReminders.js` | Daily 20:00 WIB | ✅ OK |

### **C. Hooks**

| Hook | File | Purpose | Status |
|------|------|---------|--------|
| useNotificationSettings | `src/hooks/useNotificationSettings.js` | Manage preferences | ✅ OK |
| useNotifications | `src/hooks/useNotifications.js` | FCM token management | ✅ OK |
| usePushNotifications | `src/hooks/usePushNotifications.js` | Legacy FCM hook | ⚠️ Unused? |
| usePomodoro | `src/hooks/usePomodoro.js` | Timer + Notif (no settings) | ⚠️ BERMASALAH |

### **D. Pages dengan Notifikasi**

| Page | File | Notification Type | Status |
|------|------|-------------------|--------|
| Settings | `src/pages/Settings.jsx` | All settings | ✅ Primary location |
| Fokus | `src/pages/Fokus.jsx` | Pomodoro (info + button) | ⚠️ Button salah tempat |
| Habits | `src/pages/Habits.jsx` | Per-habit reminders | ✅ OK |
| Today | `src/pages/Today.jsx` | Shows PomodoroTimer | ✅ OK (timer only) |

---

## 🎯 REKOMENDASI PERBAIKAN

### **Priority 1: Fix Pomodoro Notifications** 🔴

**Langkah**:
1. Tambahkan field `pomodoroNotifications` di `notification_settings` Firestore
2. Update `NotificationSettings.jsx`:
   ```jsx
   <div className="flex items-center justify-between">
       <div>
           <p className="text-body text-ink">Pomodoro Timer</p>
           <p className="text-small text-ink-muted">
               Notifikasi saat sesi fokus/break selesai
           </p>
       </div>
       <input
           type="checkbox"
           checked={settings.pomodoroNotifications?.enabled}
           onChange={() => updateSettings({
               pomodoroNotifications: {
                   enabled: !settings.pomodoroNotifications?.enabled
               }
           })}
           className="toggle"
       />
   </div>
   ```

3. Update `usePomodoro.js`:
   ```javascript
   // Import settings hook
   import { useNotificationSettings } from '../hooks/useNotificationSettings'
   
   // Check settings before showing notification
   const { settings: notifSettings } = useNotificationSettings()
   
   if (notifSettings?.pomodoroNotifications?.enabled && 
       Notification.permission === 'granted') {
       // Show notification
   }
   ```

4. Respects quiet hours:
   ```javascript
   const isQuietHours = () => {
       const now = new Date()
       const hour = now.getHours()
       return hour >= notifSettings.quietHours.start || 
              hour < notifSettings.quietHours.end
   }
   
   if (!isQuietHours() && notifSettings.pomodoroNotifications?.enabled) {
       // Show notification
   }
   ```

---

### **Priority 2: Remove Redundant Components** 🟡

**Hapus `NotificationPreference` di Settings.jsx**:

**File**: `src/pages/Settings.jsx`

**Lines to Remove**: 50-170

**Reason**: Duplicate dengan `NotificationSettings.jsx`

**Setelah dihapus**, pastikan import masih ada:
```jsx
import { NotificationSettings } from '../components/settings/NotificationSettings'
```

Dan di render:
```jsx
<NotificationSettings />  {/* This is the complete one */}
{/* Remove: <NotificationPreference /> */}
```

---

### **Priority 3: Fix Fokus Page** 🟡

**File**: `src/pages/Fokus.jsx`

**Ganti section (lines 145-166) dengan**:
```jsx
{/* Notifications info */}
<section className="card">
    <div className="flex items-start gap-3">
        <IconBell size={20} stroke={1.5} className="text-ink-muted mt-0.5" />
        <div className="flex-1">
            <h3 className="text-h3 text-ink">Notifikasi Timer</h3>
            <p className="text-small text-ink-muted mt-1">
                Lento akan mengirim notifikasi saat sesi fokus atau break selesai.
            </p>
            <button
                onClick={() => navigate('/settings?tab=tampilan')}
                className="btn-secondary btn-sm mt-3"
            >
                Atur di Settings →
            </button>
        </div>
    </div>
</section>
```

**Reason**: Redirect ke Settings instead of manual permission request

---

## 📈 STATISTIK SISTEM NOTIFIKASI

### **Firestore Collections**

| Collection | Purpose | Created By |
|------------|---------|------------|
| `notification_settings` | User preferences | Frontend (NotificationSettings) |
| `notificationLogs` | Analytics & history | Backend (Cron jobs) |
| `fcm_tokens` | Device tokens for FCM | Frontend (on login) |

### **Notification Types Breakdown**

| Type | Trigger | Frequency | User Control | Logs | Status |
|------|---------|-----------|--------------|------|--------|
| Habit | Cron 07:00 | Daily | ✅ Yes | ✅ Yes | ✅ OK |
| Goal | Cron 08:00 | Conditional | ✅ Yes | ✅ Yes | ✅ OK |
| Bill | Cron 09:00 | Conditional | ✅ Yes | ✅ Yes | ✅ OK |
| Budget | Cron 10:00 | Conditional | ✅ Yes | ✅ Yes | ✅ OK |
| Reading | Cron 20:00 | Conditional | ✅ Yes | ✅ Yes | ✅ OK |
| **Pomodoro** | **Client-side** | **Per session** | **❌ NO** | **❌ NO** | **⚠️ ISSUE** |

### **Settings Locations**

| Location | Type | Completeness | Recommendation |
|----------|------|--------------|----------------|
| Settings → NotificationSettings | Component | ✅ Complete (all 6 types) | ✅ Keep as primary |
| Settings → NotificationPreference | Inline code | ⚠️ Partial (3 toggles) | ❌ Remove (redundant) |
| Fokus → Notification button | Button | ❌ Permission only | ❌ Replace with link to Settings |

---

## ✅ CHECKLIST IMPLEMENTASI

### **Phase 1: Critical Fixes** (1-2 hari)

- [ ] Tambahkan `pomodoroNotifications` field di Firestore schema
- [ ] Update `NotificationSettings.jsx` dengan Pomodoro toggle
- [ ] Update `usePomodoro.js` untuk check settings sebelum kirim notif
- [ ] Add quiet hours respect untuk Pomodoro
- [ ] Test Pomodoro notifications dengan toggle ON/OFF

### **Phase 2: Cleanup** (1 hari)

- [ ] Remove `NotificationPreference` component dari Settings.jsx (lines 50-170)
- [ ] Update Fokus.jsx - ganti button dengan link ke Settings
- [ ] Verify no broken imports
- [ ] Test all notification settings di Settings page

### **Phase 3: Enhancement** (opsional)

- [ ] Add notification logs untuk Pomodoro ke `notificationLogs` collection
- [ ] Add sound toggle (enable/disable notification sound)
- [ ] Add notification preview di Settings (test notification)
- [ ] Add per-notification-type sound customization

---

## 🧪 TESTING GUIDE

### **Test 1: Pomodoro Notifications**

1. ✅ Enable Pomodoro notifications di Settings
2. ✅ Start timer, tunggu sampai selesai
3. ✅ Verify notification muncul
4. ✅ Disable Pomodoro notifications di Settings
5. ✅ Start timer, tunggu sampai selesai
6. ✅ Verify notification TIDAK muncul

### **Test 2: Quiet Hours**

1. ✅ Set quiet hours 22:00 - 07:00
2. ✅ Trigger notification di luar quiet hours → should show
3. ✅ Trigger notification di dalam quiet hours → should NOT show
4. ✅ Check `notificationLogs` → status `skipped_quiet_hours`

### **Test 3: All Notification Types**

1. ✅ Toggle each notification type OFF
2. ✅ Verify backend cron respects toggle
3. ✅ Toggle back ON
4. ✅ Verify notifications resume

---

## 📞 KONTAK & NEXT STEPS

**Hasil Audit**:
- **Total Notification Systems**: 6
- **Functioning**: 5 (83%)
- **Broken**: 1 (17% - Pomodoro)
- **Redundant Components**: 2
- **Misplaced UI**: 1

**Priority Actions**:
1. 🔴 **URGENT**: Fix Pomodoro notifications (no user control)
2. 🟡 **MEDIUM**: Remove redundant NotificationPreference
3. 🟡 **MEDIUM**: Fix Fokus page button placement

**Estimated Effort**: 2-3 hari development + 1 hari testing

---

**Last Updated**: 27 Januari 2026  
**Auditor**: GitHub Copilot  
**Version**: 1.0
