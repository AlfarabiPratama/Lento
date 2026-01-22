# LENTO — Brand Bible v1

**Tagline (ID):** Lebih tenang. Lebih berirama.  
**Tagline (EN):** Less rush. More rhythm.

---

## 1) Product DNA

Lento adalah web app **calm productivity** yang fokus utama membentuk kebiasaan (habit) dengan dukungan jurnal dan ruang catatan. Lento bukan "aplikasi ngegas", tapi "tempat balik lagi" saat kamu sempat hilang.

### Masalah user yang ditangani (prioritas):
| Masalah | Solusi Lento |
|---------|--------------|
| Mulai tapi cepat berhenti | Bikin balik lagi dengan langkah kecil |
| Banyak rencana tapi nggak jalan | Quest otomatis menyederhanakan hari |
| Lupa rutinitas | Prompt halus & reminder-friendly |
| Produktif tapi progress nggak kelihatan | Ringkasan yang menenangkan |

---

## 2) Persona & Tone

**Persona produk:** Teman baik yang stabil (bukan pelatih galak)  
**Nada bahasa:** Hangat, singkat, nggak menghakimi

### Contoh Microcopy:
- **Empty:** "Belum apa-apa hari ini. Mulai dari yang kecil aja."
- **Balik setelah lama:** "Hei, kamu balik. Itu sudah bagus."
- **Streak putus:** "Nggak apa-apa. Kita mulai lagi pelan-pelan."
- **Offline:** "Offline sementara. Tenang, kamu tetap bisa lanjut. Nanti tersinkron otomatis."

---

## 3) UX Principles

1. **Small step default** → tawarkan 1–3 aksi kecil, bukan daftar panjang
2. **No-shame design** → tidak ada kata yang menyalahkan ("gagal", "malas", "harus")
3. **Rhythm > target** → tampilkan progres sebagai ritme, bukan kompetisi
4. **One UX always** → tidak ada "mode offline/online"; user hanya melihat status sync

---

## 4) Information Architecture (IA)

### Mobile (Bottom nav 5 tab)
```
Today / Kebiasaan / Jurnal / Space / More
```
- Pakai ikon + label supaya jelas

### Desktop
- Sidebar permanen + topbar + sync indicator
- Space: 2-pane (list+tags+search kiri, editor kanan)

---

## 5) Core Screens

| Screen | Tujuan |
|--------|--------|
| **Today** | "Mulai hari" → quest otomatis + quick actions + ringkasan |
| **Kebiasaan** | Check-in cepat + streak + weekly recap |
| **Jurnal** | 3 menit / bebas + histori |
| **Space** | Pages + tags + search + editor (autosave) |
| **More** | Modul tambahan (phase 2) + Settings + Export/Import |

---

## 6) Visual Style

**Kesan:** Warm paper, lembut, rapi, banyak napas (whitespace), bukan neon  
**Bentuk:** Rounded, border tipis, shadow halus  
**Animasi:** Subtle (150–200ms), tidak "loncat-loncat"

### Color Roles

#### Light Mode
- **Background:** Paper warm
- **Surface:** Hangat
- **Text:** Gelap, muted abu untuk secondary
- **Primary:** Calm teal (aksi utama)
- **Secondary:** Warm amber (highlight/warmth)

#### Dark Mode
- Gelap kebiruan (bukan hitam pekat)
- Text terang lembut
- Primary lebih cerah

### Aksesibilitas (Wajib)
- Kontras teks normal: minimal **4.5:1**
- Kontras teks besar: minimal **3:1**

---

## 7) Typography

**Font utama:** Inter (readable untuk UI, dibuat untuk layar)

### Type Scale
| Element | Size | Weight |
|---------|------|--------|
| H1 | 28–32px | Semibold |
| H2 | 18–20px | Semibold |
| Body | 16px | Regular |
| Small | 14px | Regular |
| Caption | 12px | Medium |

**Aturan:** Bedakan dengan size + weight, bukan warna saja.

---

## 8) Layout System

- **Spacing grid:** 8px (4px untuk detail)
- **Max width desktop:** 1100–1200px
- **Card:** padding 16–24px, radius 14–18px, border tipis
- **Today layout desktop:** Quest cards di atas, quick add + summary di tengah

---

## 9) Komponen UI Wajib

| Komponen | Fungsi |
|----------|--------|
| **AppShell** | Sidebar/Desktop, BottomNav/Mobile, Topbar |
| **SyncIndicator** | ✅ synced / ⏳ saving / 📴 offline |
| **QuestCard** | Judul, desc, reward/progress, CTA |
| **QuickAdd** | Desktop bar |
| **QuickAddSheet** | Mobile modal |
| **TagChips + SearchBar** | Filtering |
| **PageList + MarkdownEditor** | Space |
| **JournalComposer** | 3 menit/bebas |
| **JournalList** | Histori jurnal |
| **EmptyState** | Teman baik message |

---

## 10) Interaction Rules

- Primary action per layar: **maksimal 1**
- Semua input: **autosave**, tampilkan "Menyimpan…" di status bar
- Error message: **solusi dulu**, baru detail
  - Contoh: "Coba cek internet, datamu aman."

---

## 11) Fullstack Constraints

### Sync Strategy
- **Online-first + cache lokal:** UI selalu sama; status sync yang berubah
- **Saat offline:** Write ke cache + outbox queue
- **Saat online:** Drain & upsert (silent)

### Conflict Resolution
- **v1:** Last-write-wins (default)
- **v2:** Dialog konflik (future)
