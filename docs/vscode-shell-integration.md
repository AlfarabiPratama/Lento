# VS Code Terminal Shell Integration — Panduan Singkat

Dokumen ini menjelaskan cara mengaktifkan Shell Integration di Visual Studio Code agar terminal bawaan (terutama PowerShell di Windows) menjadi lebih "paham" konteks: mendeteksi perintah, exit code, current working directory, dan menambahkan fitur seperti command navigation, decorations, dan quick fixes.

## Ringkasan singkat
- Shell Integration memberi VS Code kemampuan untuk mengetahui kapan sebuah command mulai/selesai, exit code, dan direktori kerja saat ini.
- Dukungan shell: bash, zsh, fish, pwsh (PowerShell) — di Windows biasanya Git Bash & pwsh.
- Secara default VS Code akan mengaktifkan integrasi untuk shell yang didukung. Bila tidak aktif otomatis, ada opsi manual.

---

## Cara cepat: cek & aktifkan dari Settings

1. Buka Command Palette (Ctrl/Cmd+Shift+P).
2. Ketik: `Preferences: Open Workspace Settings` (atau buka `File > Preferences > Settings`).
3. Cari `terminal.integrated.shellIntegration.enabled`.
4. Pastikan nilainya `true`. Jika kamu ingin matikan, set `false`.

Atau gunakan workspace setting yang ada di project ini: lihat file `.vscode/settings.json`.

---

## Cara manual (jika VS Code tidak otomatis meng-inject)

VS Code biasanya meng-inject skrip integrasi saat terminal dibuka. Untuk setup yang kompleks (sub-shell, ssh tanpa Remote-SSH, custom shell init), lakukan manual install:

1. Buka Command Palette → ketik `Terminal: Install Shell Integration` dan jalankan perintah itu (jika tersedia di versi VS Code kamu).
2. Jika tidak ada, kamu bisa menambahkan baris `source` atau `dot-source` ke file init shell kamu:

   - Bash / Zsh: tambahkan ke `~/.bashrc` atau `~/.zshrc`

     ```bash
     # VS Code shell integration (manual)
     # Replace <path-to-script> with path VS Code provides when asked, or use built-in installer
     [ -f "$HOME/.vscode/shell-integration.sh" ] && source "$HOME/.vscode/shell-integration.sh"
     ```

   - PowerShell (Windows) — tambahkan ke PowerShell profile (`$PROFILE`):

     ```powershell
     # VS Code shell integration (manual)
     $script = "$env:USERPROFILE\.vscode\shell-integration.ps1"
     if (Test-Path $script) { . $script }
     ```

   Catatan: VS Code biasanya menyediakan script ini saat kamu memilih "Install Shell Integration". Lokasi file dapat berbeda bergantung pada versi dan OS.

---

## PowerShell & npm script execution policy (masalah umum di Windows)

Jika kamu melihat error seperti:

```
npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.
```

Itu artinya Execution Policy di PowerShell mencegah script dijalankan. Pilihan solusi:

- Jalankan satu perintah npm di sesi PowerShell sementara tanpa mengubah policy secara permanen:

```powershell
powershell -ExecutionPolicy Bypass -Command "npm run build"
```

- Atau, set policy untuk CurrentUser (persisten untuk user ini) — butuhkan hak yang sesuai:

```powershell
# Jalankan di PowerShell (sebagai user biasa) - mengizinkan script lokal yang signed/remote
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
```

Catatan keamanan: ubah ExecutionPolicy hanya jika kamu memahami implikasinya. `RemoteSigned` mengizinkan script lokal, tapi memerlukan signature untuk skrip yang di-download.

---

## Fitur yang akan terbuka jika Shell Integration aktif

- Command decorations (success/fail) & overview ruler
- Command navigation (Ctrl/Cmd+Up/Down)
- Sticky scroll untuk output per-command
- Quick fixes yang mendeteksi error (contoh: kill process, open file, create branch)
- Run recent commands, go-to recent directory
- Terminal IntelliSense (saran command/arg/file)

---

## Troubleshooting singkat

- Jika integrasi tidak muncul, coba restart VS Code.
- Jika masih tidak muncul untuk PowerShell di Windows: pastikan kamu membuka PowerShell (pwsh) bukan cmd; coba Command Palette → `Terminal: Select Default Shell` → pilih PowerShell (pwsh).
- Untuk SSH/subshell, gunakan manual install pada profil shell remote.

---

Jika mau, saya bisa juga menambahkan instruksi ini ke `README.md` atau membuat snippet PowerShell untuk membantu men-apply ExecutionPolicy secara aman (opsional). Beri tahu pilihanmu.
