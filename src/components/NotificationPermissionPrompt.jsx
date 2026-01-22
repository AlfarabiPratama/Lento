/**
 * Notification Permission Prompt Component
 * 
 * Best Practice: Jelaskan benefit SEBELUM minta permission
 * dengan context yang jelas (bukan popup tiba-tiba)
 */

import { useState } from 'react'
import { IconBell, IconX } from '@tabler/icons-react'
import { requestNotificationPermission } from '../lib/firebase'

export function NotificationPermissionPrompt({ onClose }) {
  const [loading, setLoading] = useState(false)

  const handleEnable = async () => {
    setLoading(true)
    
    try {
      const token = await requestNotificationPermission()
      
      if (token) {
        localStorage.setItem('lento_notification_permission_granted', 'true')
        onClose?.(true)
      } else {
        onClose?.(false)
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      onClose?.(false)
    } finally {
      setLoading(false)
    }
  }

  const handleMaybeLater = () => {
    onClose?.(false)
  }

  const handleDontAskAgain = () => {
    localStorage.setItem('lento_notification_prompt_dismissed', 'permanent')
    onClose?.(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-in">
        <button
          onClick={handleMaybeLater}
          className="absolute top-4 right-4 min-w-11 min-h-11 flex items-center justify-center text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          aria-label="Tutup"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center min-w-11 min-h-11 bg-primary-100 rounded-full mb-4">
            <IconBell className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Jangan Lewatkan Habit Anda
          </h2>
          <p className="text-gray-600">
            Aktifkan notifikasi untuk menerima reminder habit, prompt jurnal, 
            dan milestone goals—bahkan saat Lento tertutup.
          </p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <span className="text-green-500 text-xl flex-shrink-0">✓</span>
            <div>
              <p className="font-medium text-gray-900">Smart Reminders</p>
              <p className="text-sm text-gray-600">Diingatkan sesuai waktu pilihan Anda</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <span className="text-blue-500 text-xl flex-shrink-0">✓</span>
            <div>
              <p className="font-medium text-gray-900">Bekerja Offline</p>
              <p className="text-sm text-gray-600">Terima reminder bahkan tanpa internet</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <span className="text-purple-500 text-xl flex-shrink-0">✓</span>
            <div>
              <p className="font-medium text-gray-900">Kontrol Penuh</p>
              <p className="text-sm text-gray-600">Non-aktifkan kapan saja di Settings</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={handleEnable}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Mengaktifkan...
              </span>
            ) : (
              'Aktifkan Notifikasi'
            )}
          </button>
          
          <button
            onClick={handleMaybeLater}
            className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 font-medium"
          >
            Nanti Saja
          </button>
        </div>
        
        <p className="text-xs text-gray-500 text-center mt-4">
          Browser Anda akan meminta izin selanjutnya. Klik "Izinkan" untuk melanjutkan.
        </p>

        <button
          onClick={handleDontAskAgain}
          className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2"
        >
          Jangan tanya lagi
        </button>
      </div>
    </div>
  )
}
