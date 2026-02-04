# Google Sign-In Troubleshooting Guide

## Masalah Umum dan Solusinya

### 1. **Popup Ditutup / Popup Closed by User**
**Gejala:** Popup Google Sign-In muncul sebentar lalu hilang tanpa proses login.

**Penyebab:**
- User menutup popup sebelum login selesai
- Popup dibuka tapi user tidak memilih akun

**Solusi:**
- Klik tombol "Masuk dengan Google" lagi
- Pastikan pilih akun Google yang ingin digunakan
- Jangan tutup popup sebelum proses selesai

---

### 2. **Popup Diblokir Browser / Popup Blocked**
**Gejala:** Tidak ada popup yang muncul sama sekali saat klik tombol.

**Penyebab:**
- Browser memblokir popup dari website Lento
- Ad blocker atau extension browser memblokir popup

**Solusi untuk Chrome:**
1. Klik icon gembok/info di address bar
2. Pilih "Site settings"
3. Scroll ke "Pop-ups and redirects"
4. Ubah ke "Allow"
5. Refresh halaman dan coba lagi

**Solusi untuk Firefox:**
1. Klik icon shield di address bar
2. Pilih "Turn off Blocking for This Site"
3. Refresh halaman dan coba lagi

**Solusi untuk Safari:**
1. Safari → Preferences → Websites
2. Pilih "Pop-up Windows"
3. Set lento-flame.vercel.app ke "Allow"
4. Refresh halaman dan coba lagi

---

### 3. **Domain Tidak Diizinkan / Unauthorized Domain**
**Gejala:** Error "This domain is not authorized for OAuth operations"

**Penyebab:**
- Domain website tidak terdaftar di Firebase Console
- Terjadi saat deploy ke domain baru atau custom domain

**Solusi (untuk Admin):**
1. Buka Firebase Console: https://console.firebase.google.com
2. Pilih project "lento-less-rush-more-rhythm"
3. Pergi ke **Authentication** → **Settings** → **Authorized domains**
4. Tambahkan domain berikut:
   - `localhost` (untuk development)
   - `lento-flame.vercel.app` (production)
   - Custom domain jika ada
5. Klik "Add domain" dan tunggu beberapa menit
6. Coba login lagi

---

### 4. **Google Sign-In Tidak Diaktifkan / Operation Not Allowed**
**Gejala:** Error "This operation is not allowed"

**Penyebab:**
- Google Sign-In provider belum diaktifkan di Firebase

**Solusi (untuk Admin):**
1. Buka Firebase Console
2. Pilih project "lento-less-rush-more-rhythm"
3. Pergi ke **Authentication** → **Sign-in method**
4. Klik "Google" di daftar providers
5. Toggle "Enable" → ON
6. Klik "Save"
7. Coba login lagi

---

### 5. **Environment Variables Tidak Terdeteksi**
**Gejala:** Error "Auth not available" atau aplikasi blank

**Penyebab:**
- File `.env` tidak ada atau tidak ter-load
- Environment variables tidak di-set di Vercel

**Solusi Local Development:**
1. Cek file `.env` ada di root project
2. Pastikan isi lengkap:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=lento-less-rush-more-rhythm.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=lento-less-rush-more-rhythm
VITE_FIREBASE_STORAGE_BUCKET=lento-less-rush-more-rhythm.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_VAPID_KEY=your_vapid_key
```
3. Restart dev server: `npm run dev`

**Solusi Vercel (Production):**
1. Buka Vercel Dashboard: https://vercel.com
2. Pilih project "lento"
3. Pergi ke **Settings** → **Environment Variables**
4. Tambahkan semua variable di atas
5. Set "Environment" ke **Production**, **Preview**, dan **Development**
6. Redeploy: `vercel --prod`

---

### 6. **Firebase Quota Exceeded**
**Gejala:** Error setelah banyak login attempts

**Penyebab:**
- Firebase free tier memiliki limit untuk auth operations
- Terlalu banyak login dalam waktu singkat

**Solusi:**
- Tunggu beberapa menit sebelum coba lagi
- Upgrade Firebase plan jika sering terjadi (untuk Admin)

---

## Cara Test Google Sign-In

### Development (localhost):
```bash
npm run dev
# Buka http://localhost:5173/settings
# Scroll ke "Akun" section
# Klik "Masuk dengan Google"
```

### Production:
1. Buka https://lento-flame.vercel.app/settings
2. Scroll ke section "Akun (opsional)"
3. Klik tombol "Masuk dengan Google"
4. Pilih akun Google
5. Izinkan akses jika diminta
6. Seharusnya redirect kembali ke Settings dengan status logged in

---

## Error Messages dan Artinya

| Error Code | Pesan Error | Artinya |
|------------|-------------|---------|
| `auth/popup-closed-by-user` | "Popup ditutup. Silakan coba lagi." | User menutup popup sebelum login selesai |
| `auth/popup-blocked` | "Popup diblokir browser..." | Browser memblokir popup, perlu diizinkan |
| `auth/unauthorized-domain` | "Domain tidak diizinkan..." | Domain belum ditambahkan ke Firebase Console |
| `auth/operation-not-allowed` | "Google Sign-In belum diaktifkan..." | Provider Google belum enabled di Firebase |
| `Auth not available` | "Firebase Auth not initialized" | Environment variables tidak di-set |

---

## Kontak

Jika masih ada masalah setelah mencoba semua solusi di atas:
1. Cek console browser (F12) untuk error details
2. Screenshot error message
3. Hubungi admin dengan informasi:
   - Browser & versi (contoh: Chrome 144)
   - OS (contoh: Windows 11, Android 14)
   - Error message lengkap
   - Steps yang sudah dicoba

---

## Technical Details

### Firebase Configuration Check
Untuk memverifikasi Firebase config ter-load dengan benar:

```javascript
// Buka browser console (F12) dan jalankan:
console.log({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.substring(0, 10) + '...',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
})
```

Expected output:
```
{
  apiKey: "AIzaSyBxxx...",
  authDomain: "lento-less-rush-more-rhythm.firebaseapp.com",
  projectId: "lento-less-rush-more-rhythm"
}
```

Jika ada yang `undefined`, berarti environment variables tidak ter-load.

### Logs to Check
Buka browser DevTools (F12) → Console tab. Saat klik "Masuk dengan Google", harusnya muncul:
```
Starting Google Sign-In...
Google sign-in success: user@example.com
```

Jika ada error, akan muncul detail error code dan message.

---

**Last Updated:** January 27, 2026  
**Version:** 1.0
