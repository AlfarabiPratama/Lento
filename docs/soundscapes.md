# Soundscapes

Ambient audio feature for focus and relaxation.

## Overview

Global ambient audio player with floating action button (FAB) control. Persists across route changes.

## Architecture

```
src/features/soundscapes/
├── soundTracks.js        # Track registry (metadata)
├── soundPrefs.js         # localStorage persistence
├── SoundscapesProvider.jsx  # Context + audio management
├── useSoundscapes.js     # Consumer hook
├── SoundFab.jsx          # Floating action button
└── SoundPanel.jsx        # Control panel (track list, volume)
```

## Usage

The provider wraps the entire app in `App.jsx`:

```jsx
<SoundscapesProvider>
  <BrowserRouter>
    {/* app content */}
  </BrowserRouter>
</SoundscapesProvider>
```

FAB and Panel are rendered in `AppShell.jsx`:

```jsx
<SoundFab />
<SoundPanel />
```

## Key Features

- **Single audio instance** - Only one track plays at a time
- **Autoplay policy compliance** - Handles browser autoplay restrictions
- **Visibility API** - Pauses when tab is hidden (optional)
- **Persistence** - Selected track and volume saved to localStorage
- **Accessibility** - Full ARIA labels and keyboard support

## Adding New Tracks

1. Add audio file to `public/soundscapes/`
2. Add entry to `soundTracks.js`:

```js
{
  id: 'new-track',
  name: 'Track Name',
  file: '/soundscapes/new-track.mp3',
  icon: '🎵',
  category: 'nature'
}
```

## States

| Status | Description | FAB Appearance |
|--------|-------------|----------------|
| `idle` | No audio playing | Gray headphones |
| `playing` | Audio active | Primary color, pulse |
| `blocked` | Autoplay blocked | Warning dot |
| `error` | Playback error | Danger dot |
