# Quest Engine

A gamification system that provides daily quests computed from existing user data.

## Overview

Quests are **computed, not stored** - derived from habits, journals, focus, and books data. This minimizes DB migrations and ensures consistency.

## Architecture

```
src/features/quests/
├── questStats.js      # Data → Stats adapter
├── questStorage.js    # Daily assignment persistence
├── questTypes.js      # Quest definitions
├── questEngine.js     # Selection algorithm
├── useQuests.js       # React hook
└── components/
    ├── QuestCard.jsx  # Individual quest UI
    └── QuestList.jsx  # Quest section
```

## Key Concepts

### Local Date Key

Uses local timezone instead of UTC to avoid date shift bugs:

```js
// ❌ Problematic in Asian timezones
toISOString().split('T')[0]

// ✅ Correct
getLocalDateKey() // Uses local year/month/day
```

### Stable Daily Assignment

Quests are assigned once per day and stored in localStorage. They don't change mid-day even if user data changes.

### Deterministic Seed

Quest selection uses a seed based on `dateKey + installId`. Same user gets same quests every time they reload on the same day.

### Eligibility Filtering

Quests only appear for features the user has actually used:

- Journal quest: Always available
- Habit quest: Only if user has active habits
- Focus quest: Only if user has completed focus sessions before
- Books quest: Only if user has added books

## Usage

```jsx
import { QuestList } from '../features/quests/components/QuestList'

function Today() {
  return (
    <div>
      <QuestList />
      {/* other content */}
    </div>
  )
}
```

## Quest Types

| ID | Category | XP | Description |
|----|----------|----|----|
| `journal_write` | journal | 15 | Write journal today |
| `habit_complete` | habits | 10 | Complete N habits |
| `focus_minutes` | focus | 15 | Focus for N minutes |
| `book_read` | books | 10 | Read a book |

## Adding New Quests

1. Add definition to `questTypes.js`:

```js
NEW_QUEST: {
  id: 'new_quest',
  category: 'category',
  xp: 10,
  isEligible: (stats) => stats.someCondition,
  getTitle: (params) => `Quest title`,
  getProgress: (stats, params) => ({ current: 0, target: 1 }),
}
```

1. Add param builder in `questEngine.js` if needed:

```js
case 'new_quest':
  return { target: 5 }
```

## Storage Schema

```js
// localStorage key: lento.quests.daily.v1
{
  byDate: {
    "2025-12-27": {
      seed: 123456,
      chosen: [
        { id: "journal_write", params: {} },
        { id: "habit_complete", params: { target: 3 } }
      ],
      rerolled: false
    }
  }
}
```

## Future Enhancements

- [ ] Reroll feature (swap 1 quest)
- [ ] Persistent XP tracking
- [ ] Weekly bonus quests
- [ ] Achievement system
