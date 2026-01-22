# 🔐 Panduan Setup Environment Variables Vercel

## 📋 Langkah Setup

### 1. Buka Vercel Dashboard
1. Buka https://vercel.com
2. Pilih project **Lento**
3. Masuk ke **Settings** → **Environment Variables**

---

## 🔑 Environment Variables yang Perlu Ditambahkan

### Frontend Variables (untuk Build Vite)
Tambahkan dengan **Production** dan **Preview** scope:

```
VITE_FIREBASE_API_KEY
Value: AIzaSyCYRo3gTs5yXvIwbxs0GCNV51llUIWuoHI
```

```
VITE_FIREBASE_AUTH_DOMAIN
Value: lento-less-rush-more-rhythm.firebaseapp.com
```

```
VITE_FIREBASE_PROJECT_ID
Value: lento-less-rush-more-rhythm
```

```
VITE_FIREBASE_STORAGE_BUCKET
Value: lento-less-rush-more-rhythm.firebasestorage.app
```

```
VITE_FIREBASE_MESSAGING_SENDER_ID
Value: 868861531602
```

```
VITE_FIREBASE_APP_ID
Value: 1:868861531602:web:13f8b476e77b4a9687e40b
```

```
VITE_FIREBASE_MEASUREMENT_ID
Value: G-Q2PYJPMPZ9
```

```
VITE_VAPID_KEY
Value: BCMBd2PLxFWZOilJrfnEDe67Jbgvt5u_Ud2fNg0_JwHwmpB0PzkKwDrTLe74nQi74u8V5-XjQs06QZVa226m4X0
```

---

### Backend Variables (untuk Serverless Functions)
**⚠️ PENTING:** Tambahkan dengan **Production** scope SAJA (jangan expose di Preview):

#### 1. FIREBASE_PROJECT_ID
```
Value: lento-less-rush-more-rhythm
```

#### 2. FIREBASE_CLIENT_EMAIL
**CARA MENDAPATKAN:**
1. Buka Firebase Console → Project Settings → Service Accounts
2. Klik "Generate New Private Key"
3. Download file JSON
4. Buka file tersebut, copy nilai `client_email`

```
Value: firebase-adminsdk-xxxxx@lento-less-rush-more-rhythm.iam.gserviceaccount.com
```

#### 3. FIREBASE_PRIVATE_KEY
**CARA MENDAPATKAN:**
1. Dari file JSON yang sama, copy nilai `private_key`
2. **PENTING:** Pastikan newline tetap ada (jangan dihapus)

**Format yang BENAR di Vercel:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...
(multiple lines)
...xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
-----END PRIVATE KEY-----
```

**TIPS:** 
- Copy paste langsung dari JSON
- Jangan replace `\n` dengan spasi
- Vercel akan otomatis handle escape characters

#### 4. CRON_SECRET
**CARA MEMBUAT:**
Buat token acak panjang (minimal 32 karakter):

```bash
# Cara 1: Generate random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Cara 2: Gunakan password generator online
# Contoh: https://passwordsgenerator.net/
```

```
Value: <token-acak-yang-sudah-dibuat>
```

**Simpan token ini!** Kamu akan butuh untuk manual testing API.

---

## 🚀 Setelah Menambahkan Semua Variables

### 1. Redeploy Project
```bash
# Dari terminal local
vercel --prod

# Atau push ke Git
git push origin main
```

### 2. Test API Endpoints
Gunakan `CRON_SECRET` yang sudah dibuat untuk test:

```bash
# Test Habit Reminders
curl -X POST https://lento-v1.vercel.app/api/sendHabitReminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Journal Reminders
curl -X POST https://lento-v1.vercel.app/api/sendJournalReminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Budget Warnings
curl -X POST https://lento-v1.vercel.app/api/checkBudgetWarnings \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Test Weekly Summary
curl -X POST https://lento-v1.vercel.app/api/sendWeeklySummary \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 3. Check Logs di Vercel
1. Buka project di Vercel Dashboard
2. Masuk ke tab **Logs**
3. Filter berdasarkan function name (mis: `sendHabitReminders`)
4. Pastikan tidak ada error kredensial Firebase Admin

---

## ✅ Checklist Keamanan

- [ ] `.env` sudah di-ignore oleh Git (cek `.gitignore`)
- [ ] Semua backend variables (Firebase Admin + CRON_SECRET) hanya di Production scope
- [ ] FIREBASE_PRIVATE_KEY format dengan newline yang benar
- [ ] CRON_SECRET sudah disimpan aman (password manager)
- [ ] Test semua endpoint berhasil (status 200)
- [ ] Check logs Vercel tidak ada error

---

## 🔒 Prinsip Keamanan

### ✅ Yang AMAN untuk Public (Frontend)
- VITE_FIREBASE_API_KEY (dilindungi oleh Firestore Rules)
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_VAPID_KEY

**Kenapa aman?** Karena akses data dijaga oleh:
- Firestore Security Rules
- Firebase Auth
- Storage Rules

### ⛔ Yang RAHASIA (Backend Only)
- FIREBASE_PRIVATE_KEY
- FIREBASE_CLIENT_EMAIL
- CRON_SECRET

**JANGAN PERNAH:**
- Commit ke Git
- Expose di client-side code
- Share di public forum/chat

---

## 📝 Troubleshooting

### Error: "Invalid private key"
- Pastikan newline (`\n`) tidak hilang
- Copy paste langsung dari JSON tanpa modifikasi

### Error: "Unauthorized" saat test API
- Cek CRON_SECRET benar
- Pastikan header `Authorization: Bearer <token>` ada

### Error: "Firebase Admin initialization failed"
- Cek semua 3 variable (PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY) sudah diset
- Pastikan tidak ada typo di nama variable

### Cron tidak berjalan otomatis
- Pastikan `vercel.json` sudah ter-deploy
- Cek Vercel Dashboard → Logs untuk error
- Tunggu sesuai jadwal (cron berjalan di waktu UTC)

---

## 📚 Referensi
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)
