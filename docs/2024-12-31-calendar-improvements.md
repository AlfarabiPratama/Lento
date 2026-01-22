# Calendar Improvements - 31 Desember 2024

Dokumentasi lengkap fitur-fitur baru yang diimplementasikan pada halaman Kalender.

## Ringkasan

| Fitur | Status | Deskripsi |
|-------|--------|-----------|
| Tombol "Hari Ini" | ✅ | Quick navigate ke bulan/minggu saat ini |
| Swipe Gestures | ✅ | Mobile navigation dengan swipe |
| Monthly Summary | ✅ | Stats grid di atas kalender |
| Week View | ✅ | Toggle tampilan mingguan |
| Slide Animations | ✅ | Transisi smooth 250ms |
| Year Picker | ✅ | Dropdown pilih bulan/tahun |
| Important Dates | ✅ | Marker hari libur Indonesia |
| Activity Intensity | ✅ | Heatmap warna per hari |

---

## 1. Tombol "Hari Ini"

**File:** `src/pages/Calendar.jsx`

Tombol muncul di header saat user tidak berada di periode saat ini (bulan/minggu). Klik untuk langsung navigate.

```jsx
const handleToday = useCallback(() => {
    setCurrentDate(new Date())
    setSelectedDate(null)
}, [])
```

---

## 2. Swipe Gestures

**File:** `src/pages/Calendar.jsx`

Touch events untuk mobile navigation:

- Swipe **kiri** → periode berikutnya
- Swipe **kanan** → periode sebelumnya

```jsx
const handleTouchEnd = useCallback(() => {
    const distance = touchStartX.current - touchEndX.current
    if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) handleNext()
        else handlePrev()
    }
}, [viewMode])
```

---

## 3. Monthly Summary Stats

**File:** `src/pages/Calendar.jsx`

Grid 4 kotak menampilkan total aktivitas dalam periode:

- Habits (hijau)
- Focus sessions (biru)  
- Journal entries (kuning)
- Books read (ungu)

Stats otomatis update sesuai view mode (bulan/minggu).

---

## 4. Week View Toggle

**Files:**

- `src/pages/Calendar.jsx`
- `src/components/calendar/WeekGrid.jsx` (NEW)
- `src/utils/dateUtils.js` (NEW)

Toggle antara tampilan bulan (7x5 grid) dan minggu (7 hari).

### WeekGrid Features

- Header: "23 Des - 29 Des 2024"
- 7 cells dengan day name (Sen/Sel/Rab...)
- Activity dots per hari
- Same navigation pattern

### Date Utils

```js
export function getStartOfWeek(date)
export function getEndOfWeek(date)
export function getWeekDays(anchorDate)
export function goPrev(currentDate, viewMode)
export function goNext(currentDate, viewMode)
```

---

## 5. Slide Animations

**File:** `src/index.css`

Transisi smooth saat ganti periode:

```css
@keyframes slideInFromRight {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

.calendar-slide-next {
  animation: slideInFromRight 0.25s ease-out;
}

.calendar-slide-prev {
  animation: slideInFromLeft 0.25s ease-out;
}
```

---

## 6. Year Picker

**File:** `src/components/calendar/YearMonthPicker.jsx` (NEW)

Dropdown untuk quick jump ke bulan/tahun tertentu:

- Klik header bulan → dropdown muncul
- Year navigation dengan arrows
- 3x4 grid bulan (Jan-Des)
- Current month highlighted
- "Hari Ini" quick action

```jsx
<YearMonthPicker
    year={year}
    month={month}
    onChange={(y, m) => onJumpToMonth(y, m)}
/>
```

---

## 7. Important Dates

**Files:**

- `src/lib/db.js` (V9: important_dates store)
- `src/hooks/useImportantDates.js` (NEW)
- `src/components/calendar/CalendarGrid.jsx`
- `src/components/calendar/DayDetail.jsx`

### Default Holidays 2025 🇮🇩

```js
'2025-01-01': { label: 'Tahun Baru', icon: '🎉' },
'2025-01-29': { label: 'Tahun Baru Imlek', icon: '🧧' },
'2025-03-29': { label: 'Hari Raya Nyepi', icon: '🕯️' },
'2025-03-31': { label: 'Idul Fitri', icon: '🌙' },
'2025-08-17': { label: 'Hari Kemerdekaan', icon: '🇮🇩' },
'2025-12-25': { label: 'Hari Natal', icon: '🎄' },
// + 9 holidays lainnya
```

### Visual

- DayCell: emoji icon di top-right + background kuning
- DayDetail: banner dengan label + type

---

## 8. Activity Intensity

**Files:**

- `src/components/calendar/CalendarGrid.jsx`
- `src/index.css`

Warna background berdasarkan jumlah aktivitas (heatmap style):

| Aktivitas | Class | Opacity |
|-----------|-------|---------|
| 0 | - | - |
| 1-2 | `.calendar-intensity-low` | 10% |
| 3-4 | `.calendar-intensity-mid` | 20% |
| 5-6 | `.calendar-intensity-high` | 35% |
| 7+ | `.calendar-intensity-max` | 50% |

```jsx
function getIntensityClass(activities) {
    const count = habits + focus + journals + books
    if (count === 0) return ''
    if (count <= 2) return 'calendar-intensity-low'
    if (count <= 4) return 'calendar-intensity-mid'
    if (count <= 6) return 'calendar-intensity-high'
    return 'calendar-intensity-max'
}
```

---

## Database Changes

### V9: Important Dates Store

```js
if (!db.objectStoreNames.contains('important_dates')) {
    const store = db.createObjectStore('important_dates', { keyPath: 'id' })
    store.createIndex('by_date', 'date')
    store.createIndex('by_type', 'type')
    store.createIndex('by_user', 'user_id')
    store.createIndex('by_sync', 'sync_status')
}
```

---

## Files Created

| File | Type | Deskripsi |
|------|------|-----------|
| `src/utils/dateUtils.js` | NEW | Week calculation helpers |
| `src/components/calendar/WeekGrid.jsx` | NEW | Week view component |
| `src/components/calendar/YearMonthPicker.jsx` | NEW | Month/year picker dropdown |
| `src/hooks/useImportantDates.js` | NEW | Hook + default holidays |

## Files Modified

| File | Changes |
|------|---------|
| `src/lib/db.js` | V9 + important_dates store |
| `src/pages/Calendar.jsx` | All features integration |
| `src/components/calendar/CalendarGrid.jsx` | Intensity + important dates |
| `src/components/calendar/DayDetail.jsx` | Important date banner |
| `src/index.css` | Animation + intensity classes |
