/**
 * PWA Install Prompt Component
 * 
 * Enhanced with:
 * - usePWAInstall hook for state management
 * - Platform-specific instructions (iOS/Android/Desktop)
 * - Smart prompt timing (after 2nd visit or engagement)
 * - Lento brand consistency
 */

import { IconX, IconDownload, IconDeviceMobile } from '@tabler/icons-react'
import { usePWAInstall } from '../hooks/usePWAInstall'

export function PWAInstallPrompt() {
  const { 
    showPrompt, 
    promptInstall, 
    dismissPrompt, 
    platform,
    isInstallable,
  } = usePWAInstall()

  if (!showPrompt || !isInstallable) {
    return null
  }

  // iOS Safari doesn't support beforeinstallprompt
  // Show manual instructions instead
  if (platform === 'ios') {
    return <IOSInstallInstructions onDismiss={dismissPrompt} />
  }

  // Android & Desktop: Show native prompt
  return (
    <div className="fixed bottom-20 sm:bottom-4 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-paper rounded-2xl shadow-xl border border-canvas-border p-4 max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-teal-600 rounded-xl flex items-center justify-center">
              <IconDeviceMobile className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink-900">
                Install Lento
              </h3>
              <p className="text-small text-ink-muted">
                Akses lebih cepat & bisa offline
              </p>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="p-1 hover:bg-canvas-100 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <IconX className="w-5 h-5 text-ink-muted" />
          </button>
        </div>

        {/* Benefits */}
        <ul className="space-y-2 mb-4 text-small text-ink-700">
          <li className="flex items-center gap-2">
            <span className="text-teal-600">✓</span>
            <span>Buka langsung dari home screen</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-600">✓</span>
            <span>Bekerja offline tanpa koneksi</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-teal-600">✓</span>
            <span>Notifikasi reminder langsung</span>
          </li>
        </ul>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={promptInstall}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <IconDownload className="w-4 h-4" />
            Install
          </button>
          <button
            onClick={dismissPrompt}
            className="px-4 py-2.5 text-ink-muted hover:bg-canvas-100 rounded-xl transition-colors font-medium"
          >
            Nanti Saja
          </button>
        </div>
      </div>
    </div>
  )
}
/**
 * iOS-specific install instructions
 * (Safari doesn't support beforeinstallprompt)
 */
function IOSInstallInstructions({ onDismiss }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-paper rounded-t-3xl sm:rounded-2xl shadow-xl max-w-md w-full p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-teal-600 rounded-xl flex items-center justify-center">
              <IconDeviceMobile className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-ink-900">
              Install Lento
            </h3>
          </div>
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-canvas-100 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <IconX className="w-5 h-5 text-ink-muted" />
          </button>
        </div>

        {/* iOS Instructions */}
        <div className="space-y-4">
          <p className="text-small text-ink-700">
            Untuk install Lento di iPhone/iPad:
          </p>

          <ol className="space-y-3 text-small text-ink-700">
            <li className="flex gap-3">
              <span className="font-semibold text-primary shrink-0">1.</span>
              <div>
                Tap tombol <strong>Share</strong> 
                <svg className="inline w-5 h-5 mx-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 5l-1.42 1.42-1.59-1.59V16h-1.98V4.83L9.42 6.42 8 5l4-4 4 4zm4 5v11c0 1.1-.9 2-2 2H6c-1.11 0-2-.9-2-2V10c0-1.11.89-2 2-2h3v2H6v11h12V10h-3V8h3c1.1 0 2 .89 2 2z"/>
                </svg>
                di menu Safari
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary shrink-0">2.</span>
              <span>
                Pilih <strong>"Add to Home Screen"</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-semibold text-primary shrink-0">3.</span>
              <span>
                Tap <strong>"Add"</strong> untuk konfirmasi
              </span>
            </li>
          </ol>

          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mt-4">
            <p className="text-xs text-teal-800">
              💡 <strong>Tips:</strong> Setelah install, buka Lento dari home screen untuk pengalaman terbaik!
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="w-full mt-6 bg-canvas-100 hover:bg-canvas-200 text-ink-900 font-medium py-3 px-4 rounded-xl transition-colors"
        >
          Mengerti
        </button>
      </div>
    </div>
  )
}