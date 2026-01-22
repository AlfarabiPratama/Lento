# Lento Icon Guidelines

## Ukuran Standar

| Konteks | Size | Stroke |
|---------|------|--------|
| **Nav (sidebar/bottom)** | 24px | 2 |
| **Icon tombol** | 20px | 2 |
| **Search input** | 18px | 1.5 |
| **Inline (chip/teks)** | 16px | 1.5-2 |
| **Empty state (besar)** | 48px | 1 |

## Icon yang Digunakan

| Lokasi | Icon | Import |
|--------|------|--------|
| Today | `IconSun` | @tabler/icons-react |
| Kebiasaan | `IconRepeat` | @tabler/icons-react |
| Jurnal | `IconNotebook` | @tabler/icons-react |
| Space | `IconFileText` | @tabler/icons-react |
| More | `IconSettings` | @tabler/icons-react |
| Add | `IconPlus` | @tabler/icons-react |
| Delete | `IconX` | @tabler/icons-react |
| Search | `IconSearch` | @tabler/icons-react |
| Streak | `IconFlame` | @tabler/icons-react |
| Check | `IconCheck` | @tabler/icons-react |
| Back | `IconChevronLeft` | @tabler/icons-react |
| Sync OK | `IconCloudCheck` | @tabler/icons-react |
| Syncing | `IconLoader2` | @tabler/icons-react |
| Offline | `IconCloudOff` | @tabler/icons-react |

## Warna

- **Default:** `text-ink-muted`
- **Active:** `text-primary`
- **Disabled:** `text-ink-light` (lebih pudar)

## Aturan

### ✅ Do
- Icon + label sama warna saat active
- Wajib `aria-label` untuk icon-only buttons
- Konsisten stroke width dalam satu konteks

### ❌ Don't
- Jangan beda warna icon vs label
- Jangan beda style/weight dalam satu navbar
- Jangan icon tanpa label untuk nav utama
