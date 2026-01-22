# Fitur Kalender

Dokumentasi sistem kalender untuk visualisasi aktivitas.

---

## Overview

Kalender menampilkan aktivitas dari 4 sumber data:

- **Habits** (🟢) - Check-ins kebiasaan harian
- **Focus** (🔵) - Sesi pomodoro/fokus
- **Journals** (🟡) - Entri jurnal
- **Books** (🟣) - Sesi membaca buku

---

## Komponen

### Halaman Kalender

`src/pages/Calendar.jsx`

```jsx
import { useState } from 'react'
import useCalendarData from '../hooks/useCalendarData'

function Calendar() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  
  const { calendarDays, activitiesByDate, streakData, loading } = useCalendarData(year, month)
  
  // ... render
}
```

### Hook useCalendarData

`src/hooks/useCalendarData.js`

```javascript
export function useCalendarData(year, month) {
  return {
    calendarDays,      // Array of day objects for grid
    activitiesByDate,  // Map of dateKey -> activities
    streakData,        // { currentStreak, activeDays }
    loading,           // boolean
    getDateKey         // Utility function
  }
}
```

### CalendarGrid

`src/components/calendar/CalendarGrid.jsx`

Menampilkan grid 6x7 dengan:

- Hari dari bulan sebelumnya (dimmed)
- Hari bulan saat ini
- Hari dari bulan berikutnya (dimmed)
- Activity indicators (dots warna)

### MiniCalendar

`src/components/calendar/MiniCalendar.jsx`

Widget compact untuk halaman Today:

- Heatmap style (intensity based on activity count)
- Klik untuk navigasi ke Calendar page

### DayDetail

`src/components/calendar/DayDetail.jsx`

Panel detail saat tanggal diklik:

- List semua aktivitas hari itu
- Grouped by type

---

## Data Sources

### Habits (Checkins)

```javascript
// Store: 'checkins'
{
  id: string,
  habit_id: string,
  date: 'YYYY-MM-DD',
  completed: boolean
}
```

### Focus (Pomodoro Sessions)

```javascript
// Store: 'pomodoro_sessions'
{
  id: string,
  date: 'YYYY-MM-DD',
  duration_minutes: number,
  focus_label: string,
  completed: boolean
}
```

### Journals

```javascript
// Store: 'journals'
{
  id: string,
  created_at: 'YYYY-MM-DDTHH:mm:ss',
  content: string,
  mood: string
}
```

### Books (Reading Sessions)

```javascript
// Store: 'book_sessions'
{
  id: string,
  bookId: string,
  dayKey: 'YYYY-MM-DD',
  delta: number,
  unit: 'pages' | 'minutes'
}
```

---

## Navigasi

### Desktop

Sidebar → Kalender

### Mobile

Lainnya → Kalender

### Routing

```javascript
// src/App.jsx
<Route path="/calendar" element={<Calendar />} />
```

---

## Akses ke Data

### useCalendarData Flow

```
┌─────────────────┐
│  useHabits()    │──┐
├─────────────────┤  │
│  useJournals()  │──┤
├─────────────────┤  │   ┌─────────────────────┐
│  IndexedDB:     │──┼──▶│  activitiesByDate   │
│  - checkins     │  │   │  (useMemo)          │
│  - pomodoro_    │  │   └─────────────────────┘
│    sessions     │──┘            │
│  - book_        │               ▼
│    sessions     │     ┌─────────────────────┐
└─────────────────┘     │  calendarDays       │
                        │  (useMemo)          │
                        └─────────────────────┘
```

---

## Styling

### Activity Indicators

```css
.habit-dot    { background: var(--lento-success); }  /* 🟢 */
.focus-dot    { background: var(--lento-primary); }  /* 🔵 */
.journal-dot  { background: var(--lento-warning); }  /* 🟡 */
.book-dot     { background: #8B5CF6; }              /* 🟣 */
```

### Today Highlight

```css
.calendar-day.is-today {
  border: 2px solid var(--lento-primary);
  font-weight: 600;
}
```
