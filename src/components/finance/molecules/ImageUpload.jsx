import { useState, useRef } from 'react'
import { IconCamera, IconPhoto, IconX, IconZoomIn } from '@tabler/icons-react'

/**
 * ImageUpload - Component for capturing or uploading transaction receipt images
 * 
 * @param {string|null} value - Base64 image data or null
 * @param {function} onChange - Callback when image changes
 */
export function ImageUpload({ value, onChange }) {
    const [showPreview, setShowPreview] = useState(false)
    const fileInputRef = useRef(null)
    const cameraInputRef = useRef(null)

    const handleFileSelect = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file maksimal 5MB')
            return
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Hanya file gambar yang diperbolehkan')
            return
        }

        // Convert to base64
        const reader = new FileReader()
        reader.onloadend = () => {
            onChange(reader.result)
        }
        reader.readAsDataURL(file)
    }

    const handleRemove = () => {
        onChange(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
        if (cameraInputRef.current) cameraInputRef.current.value = ''
    }

    return (
        <div>
            <label className="text-sm text-[var(--lento-muted)] mb-2 block">Foto Bukti</label>
            
            {!value ? (
                <div className="flex gap-2">
                    {/* Camera button (mobile) */}
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--lento-border)] bg-surface hover:bg-paper-warm transition-colors text-sm text-[var(--lento-muted)]"
                    >
                        <IconCamera size={20} />
                        <span>Ambil Foto</span>
                    </button>
                    
                    {/* Gallery button */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--lento-border)] bg-surface hover:bg-paper-warm transition-colors text-sm text-[var(--lento-muted)]"
                    >
                        <IconPhoto size={20} />
                        <span>Pilih Foto</span>
                    </button>
                </div>
            ) : (
                <div className="relative">
                    {/* Image preview */}
                    <div className="relative rounded-xl overflow-hidden border border-[var(--lento-border)]">
                        <img
                            src={value}
                            alt="Bukti transaksi"
                            className="w-full h-40 object-cover"
                        />
                        {/* Overlay buttons */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                                type="button"
                                onClick={() => setShowPreview(true)}
                                className="w-10 h-10 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                                aria-label="Lihat foto"
                            >
                                <IconZoomIn size={20} className="text-ink" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="w-10 h-10 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                                aria-label="Hapus foto"
                            >
                                <IconX size={20} className="text-red-600" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden file inputs */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Full preview modal */}
            {showPreview && value && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                    onClick={() => setShowPreview(false)}
                >
                    <div className="relative max-w-4xl max-h-full">
                        <img
                            src={value}
                            alt="Bukti transaksi"
                            className="max-w-full max-h-[90vh] rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-white/90 hover:bg-white flex items-center justify-center transition-colors"
                            aria-label="Tutup"
                        >
                            <IconX size={20} className="text-ink" />
                        </button>
                    </div>
                </div>
            )}

            {value && (
                <p className="text-xs text-[var(--lento-muted)] mt-2">
                    Klik gambar untuk memperbesar atau menghapus
                </p>
            )}
        </div>
    )
}
