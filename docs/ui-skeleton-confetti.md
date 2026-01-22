# UI Components - Skeleton & Confetti

Dokumentasi komponen UI baru untuk loading states dan celebrations.

---

## Skeleton Components

### Lokasi

`src/components/ui/Skeleton.jsx`

### Penggunaan

```jsx
import { 
  Skeleton, 
  BookRowSkeleton, 
  HabitRowSkeleton,
  ListSkeleton 
} from '../components/ui/Skeleton'

// Base skeleton
<Skeleton variant="title" className="w-32" />
<Skeleton variant="text" className="w-full" />

// Book list loading
<ListSkeleton count={4} /> // Uses BookRowSkeleton by default

// Habit list loading  
<ListSkeleton count={3} RowComponent={HabitRowSkeleton} />
```

### Variants

| Variant | Height | Usage |
|---------|--------|-------|
| `default` | 16px | General placeholder |
| `text` | 16px | Text line |
| `title` | 24px | Heading |
| `button` | 40px | Button |
| `card` | 96px | Card |
| `avatar` | 48x48px | Profile picture |
| `cover` | 160px | Book cover |

### Composite Skeletons

| Component | Description |
|-----------|-------------|
| `BookRowSkeleton` | Buku row dengan cover, title, tags |
| `HabitRowSkeleton` | Habit row dengan icon, title, checkbox |
| `StatSkeleton` | Stat card untuk dashboard |
| `WidgetSkeleton` | Widget primary dengan header dan content |
| `TodaySkeleton` | Full Today page skeleton |
| `ListSkeleton` | Multiple rows dengan configurable component |

---

## Confetti Component

### Lokasi

`src/components/ui/Confetti.jsx`

### Penggunaan

```jsx
import { Confetti, useConfetti } from '../components/ui/Confetti'

function MyComponent() {
  const [showConfetti, setShowConfetti] = useState(false)

  return (
    <>
      <Confetti 
        show={showConfetti}
        duration={4000}
        onComplete={() => setShowConfetti(false)}
      />
      
      <button onClick={() => setShowConfetti(true)}>
        Celebrate! 🎉
      </button>
    </>
  )
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | boolean | false | Trigger confetti |
| `duration` | number | 3000 | Animation duration (ms) |
| `onComplete` | function | - | Callback when animation ends |

### Hook

```jsx
import { useConfetti } from '../components/ui/Confetti'

function MyComponent() {
  const { showConfetti, celebrate, reset } = useConfetti()
  
  // Trigger celebration
  celebrate()
  
  // Reset state
  reset()
}
```

### Colors

```javascript
const CONFETTI_COLORS = [
  '#5B9A8B', // primary (teal)
  '#22C55E', // success (green)
  '#F59E0B', // warning (amber)
  '#EC4899', // pink
  '#8B5CF6', // purple
  '#3B82F6', // blue
]
```

### CSS Requirements

Animation keyframes ada di `src/index.css`:

- `.confetti-container` - Fixed overlay
- `.confetti-piece` - Individual piece
- `@keyframes confettiFall` - Fall animation

---

## Best Practices

### Skeleton Loading

1. Gunakan skeleton yang match dengan layout final
2. Animasi `animate-pulse` sudah built-in
3. Dark mode compatible via CSS variables

### Confetti

1. Trigger sekali per event (gunakan ref untuk track previous state)
2. Duration 3-4 detik optimal
3. Reset state di `onComplete` untuk memungkinkan re-trigger
