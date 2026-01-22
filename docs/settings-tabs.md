# Settings Tabs

ARIA-compliant tabbed navigation for Settings page.

## Overview

True ARIA tabs pattern with panel switching, URL synchronization, and keyboard navigation.

## Files

- `src/pages/Settings.jsx` - Main settings page with tabpanels
- `src/components/settings/SettingsTabBar.jsx` - Tab navigation component

## Features

### URL Synchronization

Tab state is stored in URL query parameter:

- `?tab=tampilan` (default)
- `?tab=akun`
- `?tab=sync`
- `?tab=data`
- `?tab=tentang`

### Keyboard Navigation

- **Arrow Left/Right** - Move focus between tabs
- **Home** - Focus first tab
- **End** - Focus last tab
- **Enter/Space** - Activate focused tab

### ARIA Pattern

```jsx
<div role="tablist" aria-orientation="horizontal">
  <button role="tab" aria-selected="true" aria-controls="panel-tampilan">
    Tampilan
  </button>
</div>

<section role="tabpanel" id="panel-tampilan" aria-labelledby="tab-tampilan" hidden={false}>
  {/* content */}
</section>
```

### Panel Switching

All panels are rendered with `hidden` attribute:

```jsx
<section role="tabpanel" hidden={activeTab !== 'tampilan'}>
```

This allows instant switching without re-mounting components.

## Mobile Optimization

- **44px tap targets** - Minimum touch target size
- **Safe area padding** - Respects iPhone notch/home indicator
- **Horizontal scroll** - Tab bar scrolls with focused tab visible
