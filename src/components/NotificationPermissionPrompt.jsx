/**
 * Notification Permission Prompt Component
 * 
 * Best Practice: Jelaskan benefit SEBELUM minta permission
 * dengan context yang jelas (bukan popup tiba-tiba)
 */

import { useState } from 'react'
import { IconBell, IconX, IconCheck } from '@tabler/icons-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl animate-scale-in">
        <button
          onClick={handleMaybeLater}
          className="absolute flex items-center justify-center text-gray-400 rounded-full top-4 right-4 min-w-11 min-h-11 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Tutup"
        >
          <IconX className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center mb-4 rounded-full min-w-11 min-h-11 bg-primary-100">
            <IconBell className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            Jangan Lewatkan Habit Anda
          </h2>
          <p className="text-gray-600">
            Aktifkan notifikasi untuk menerima reminder habit, prompt jurnal, 
            dan milestone goals—bahkan saat Lento tertutup.
          </p>
        </div>
        
        <div className="mb-6 space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
            <IconCheck size={20} className="flex-shrink-0 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Smart Reminders</p>
              <p className="text-sm text-gray-600">Diingatkan sesuai waktu pilihan Anda</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
            <IconCheck size={20} className="flex-shrink-0 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Bekerja Offline</p>
              <p className="text-sm text-gray-600">Terima reminder bahkan tanpa internet</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50">
            <IconCheck size={20} className="flex-shrink-0 text-purple-500" />
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
            className="w-full px-4 py-3 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                Mengaktifkan...
              </span>
            ) : (
              'Aktifkan Notifikasi'
            )}
          </button>
          
          <button
            onClick={handleMaybeLater}
            className="w-full px-4 py-3 font-medium text-gray-600 hover:text-gray-800"
          >
            Nanti Saja
          </button>
        </div>
        
        <p className="mt-4 text-xs text-center text-gray-500">
          Browser Anda akan meminta izin selanjutnya. Klik "Izinkan" untuk melanjutkan.
        </p>

        <button
          onClick={handleDontAskAgain}
          className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600"
        >
          Jangan tanya lagi
        </button>
      </div>
    </div>
  )
}
