# Changelog - 30 Desember 2024

Dokumentasi perubahan dan penambahan fitur pada aplikasi Lento.

---

## 🗓️ Fitur Kalender

### Deskripsi

Menambahkan sistem kalender untuk visualisasi aktivitas harian dari berbagai sumber data.

### Komponen Baru

| File | Deskripsi |
|------|-----------|
| `src/pages/Calendar.jsx` | Halaman kalender utama |
| `src/hooks/useCalendarData.js` | Hook untuk mengumpulkan data aktivitas |
| `src/components/calendar/CalendarGrid.jsx` | Grid bulan dengan activity indicators |
| `src/components/calendar/DayDetail.jsx` | Panel detail aktivitas per tanggal |
| `src/components/calendar/MiniCalendar.jsx` | Widget mini di halaman Today |

### Activity Indicators

- 🟢 **Habits** - Check-ins dari `checkins` store
- 🔵 **Focus** - Sessions dari `pomodoro_sessions` store
- 🟡 **Journals** - Entries dengan field `created_at`
- 🟣 **Books** - Sessions dari `book_sessions` store

### Integrasi Navigasi

- Desktop: Sidebar → Kalender
- Mobile: Lainnya → Kalender

---

## 💀 Skeleton Loading

### Deskripsi

Menambahkan loading placeholders untuk UX yang lebih baik saat data dimuat.

### File Dimodifikasi

- `src/components/ui/Skeleton.jsx` - Komponen skeleton

### Varian Tersedia

```javascript
export { 
  Skeleton,           // Base component
  BookRowSkeleton,    // Buku row placeholder
  HabitRowSkeleton,   // Habit row placeholder
  StatSkeleton,       // Stat card placeholder
  WidgetSkeleton,     // Widget primary placeholder
  TodaySkeleton,      // Full Today page skeleton
  ListSkeleton        // Multiple rows
}
```

### Halaman Terintegrasi

- `src/pages/Books.jsx` - Menggunakan ListSkeleton
- `src/pages/Habits.jsx` - Inline skeleton

---

## 🎉 Celebration Animations (Confetti)

### Deskripsi

Menambahkan animasi confetti saat semua quest harian selesai.

### File Baru

- `src/components/ui/Confetti.jsx` - Komponen confetti

### CSS Keyframes

Ditambahkan ke `src/index.css`:

```css
@keyframes confettiFall {
  0% {
    transform: translateY(-10vh) translateX(var(--x-start)) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) translateX(var(--x-end)) rotate(var(--rotation));
    opacity: 0;
  }
}
```

### Integrasi

- `src/features/quests/components/QuestList.jsx`
- Trigger: Saat `allCompleted` menjadi `true`

---

## 📱 Mobile Scrollbar Hidden

### Deskripsi

Menyembunyikan scrollbar di semua halaman pada mode mobile.

### CSS Ditambahkan

```css
@media (max-width: 768px) {
  * {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge */
  }
  *::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}
```

### File

- `src/index.css`

---

## 🔧 Bug Fixes

### useCalendarData.js

1. **Journals**: Menggunakan `created_at` bukan `date`
2. **Focus**: Load dari IndexedDB `pomodoro_sessions` store
3. **Books**: Load dari `bookSessionsRepo.getAllSessions()`
4. **Habits**: Load checkins dari store terpisah `checkins`
5. **Destructuring**: Fix `{ journals }` bukan `{ entries: journals }`

### Focus Session Fields

- `date` bukan `startTime`
- `duration_minutes` bukan `duration`

---

## 📊 Summary

| Fitur | Status |
|-------|--------|
| Kalender | ✅ Selesai |
| Skeleton Loading | ✅ Selesai |
| Confetti Celebration | ✅ Selesai |
| Mobile Scrollbar Hidden | ✅ Selesai |
| Calendar Bug Fixes | ✅ Selesai |

---

## 🔗 Deployment

- **URL**: <https://lento-less-rush-more-rhythm.web.app>
- **Platform**: Firebase Hosting
