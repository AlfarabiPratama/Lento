import { useState, useRef } from 'react'
import { IconSearch, IconLoader2, IconPhoto, IconX, IconUpload } from '@tabler/icons-react'
import { BOOK_FORMATS, BOOK_STATUSES, PROGRESS_UNITS } from '../../../features/books/constants.js'
import { validateISBN } from '../../../lib/utils/isbn.js'
import { lookupByISBN } from '../../../lib/services/openLibraryService.js'
import BookPreview from './BookPreview'
import { useToast } from '../../../contexts/ToastContext'

/**
 * BookForm - Add/Edit book form with cover upload
 */
export function BookForm({ initialData = null, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        authors: initialData?.authors?.join(', ') || '',
        isbn: initialData?.identifiers?.isbn13 || initialData?.identifiers?.isbn10 || '',
        format: initialData?.format || 'paper',
        status: initialData?.status || 'tbr',
        totalPages: initialData?.progress?.total || '',
        totalMinutes: initialData?.progress?.total || '',
        tags: initialData?.tags?.join(', ') || '',
        coverUrl: initialData?.cover?.url || '',
    })

    const [errors, setErrors] = useState({})
    const [isbnError, setIsbnError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [lookupLoading, setLookupLoading] = useState(false)
    const [lookupResult, setLookupResult] = useState(null)
    const [showPreview, setShowPreview] = useState(false)
    const [coverPreview, setCoverPreview] = useState(initialData?.cover?.url || null)
    const [showCoverInput, setShowCoverInput] = useState(false)

    const fileInputRef = useRef(null)
    const { showToast } = useToast()

    const isEdit = Boolean(initialData)
    const unit = BOOK_FORMATS[formData.format].defaultUnit

    function handleChange(field, value) {
        setFormData(prev => ({ ...prev, [field]: value }))

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }))
        }

        // Validate ISBN on change
        if (field === 'isbn' && value.length >= 10) {
            if (!validateISBN(value)) {
                setIsbnError('ISBN tidak valid (harus 10 atau 13 digit)')
            } else {
                setIsbnError(null)
            }
        } else if (field === 'isbn' && value.length === 0) {
            setIsbnError(null)
        }

        // Validate total pages/minutes
        if ((field === 'totalPages' || field === 'totalMinutes') && value) {
            const num = parseInt(value)
            if (num < 1) {
                setErrors(prev => ({ ...prev, [field]: 'Minimal 1' }))
            }
        }

        // Update cover preview if URL changed
        if (field === 'coverUrl' && value) {
            setCoverPreview(value)
        }
    }

    // Handle file upload for cover
    function handleFileUpload(e) {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('error', 'File harus berupa gambar')
            return
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast('error', 'Ukuran file maksimal 2MB')
            return
        }

        // Create base64 data URL
        const reader = new FileReader()
        reader.onload = (event) => {
            const dataUrl = event.target?.result
            setCoverPreview(dataUrl)
            setFormData(prev => ({ ...prev, coverUrl: dataUrl }))
            setShowCoverInput(false)
        }
        reader.readAsDataURL(file)
    }

    function handleRemoveCover() {
        setCoverPreview(null)
        setFormData(prev => ({ ...prev, coverUrl: '' }))
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const newErrors = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Judul buku wajib diisi'
        }

        if (isbnError) {
            newErrors.isbn = isbnError
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setLoading(true)

        const bookData = {
            title: formData.title.trim(),
            authors: formData.authors.split(',').map(a => a.trim()).filter(Boolean),
            format: formData.format,
            status: formData.status,
            tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            progress: {
                unit,
                total: unit === 'pages'
                    ? (formData.totalPages ? parseInt(formData.totalPages) : null)
                    : (formData.totalMinutes ? parseInt(formData.totalMinutes) : null)
            }
        }

        // Add cover if provided
        if (formData.coverUrl) {
            bookData.cover = {
                url: formData.coverUrl,
                source: formData.coverUrl.startsWith('data:') ? 'upload' : 'url'
            }
        }

        if (formData.isbn) {
            bookData.identifiers = {
                [formData.isbn.length === 10 ? 'isbn10' : 'isbn13']: formData.isbn
            }
        }

        // Include cover and source data from lookup if available
        if (formData._lookupData) {
            bookData.cover = {
                url: formData._lookupData.coverUrl,
                source: 'openlibrary'
            }
            bookData.source = 'openlibrary'
            bookData.identifiers = {
                ...(bookData.identifiers || {}),
                isbn13: formData._lookupData.isbn13,
                isbn10: formData._lookupData.isbn10,
                olid: formData._lookupData.olid
            }
            bookData.description = formData._lookupData.description
        }

        try {
            await onSubmit(bookData)
        } finally {
            setLoading(false)
        }
    }

    async function handleLookup() {
        if (!formData.isbn || isbnError || lookupLoading) return

        setLookupLoading(true)
        try {
            const result = await lookupByISBN(formData.isbn)

            if (result.success) {
                setLookupResult(result.data)
                setShowPreview(true)
            } else {
                showToast('error', result.message)
            }
        } catch (error) {
            console.error('Lookup error:', error)
            showToast('error', 'Terjadi kesalahan saat mencari buku')
        } finally {
            setLookupLoading(false)
        }
    }

    function handleConfirmLookup() {
        if (!lookupResult) return

        // Auto-fill form with lookup data
        setFormData(prev => ({
            ...prev,
            title: lookupResult.title || prev.title,
            authors: lookupResult.authors.length > 0
                ? lookupResult.authors.join(', ')
                : prev.authors,
            totalPages: lookupResult.pages || prev.totalPages,
            coverUrl: lookupResult.coverUrl || prev.coverUrl,
            _lookupData: lookupResult,
        }))

        if (lookupResult.coverUrl) {
            setCoverPreview(lookupResult.coverUrl)
        }

        setShowPreview(false)
        showToast('success', 'Data buku berhasil dimuat!')
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Cover Upload */}
            <div>
                <label className="block text-small font-medium text-ink mb-2">
                    Cover Buku (opsional)
                </label>

                {coverPreview ? (
                    <div className="flex items-start gap-3">
                        <div className="relative">
                            <img
                                src={coverPreview}
                                alt="Cover preview"
                                className="w-20 h-28 object-cover rounded-lg border border-line"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveCover}
                                className="absolute -top-2 -right-2 p-1 bg-danger text-white rounded-full"
                                title="Hapus cover"
                            >
                                <IconX size={12} />
                            </button>
                        </div>
                        <div className="flex-1">
                            <p className="text-tiny text-ink-muted">Cover terpasang</p>
                            <button
                                type="button"
                                onClick={() => setShowCoverInput(true)}
                                className="text-tiny text-primary hover:underline mt-1"
                            >
                                Ganti cover
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {/* Upload button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-line rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                            <IconUpload size={20} className="text-ink-muted" />
                            <span className="text-small text-ink-muted">Upload Gambar</span>
                        </button>

                        {/* URL button */}
                        <button
                            type="button"
                            onClick={() => setShowCoverInput(!showCoverInput)}
                            className="flex items-center justify-center gap-2 px-4 border-2 border-dashed border-line rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                            title="Masukkan URL gambar"
                        >
                            <IconPhoto size={20} className="text-ink-muted" />
                        </button>
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {/* URL input field */}
                {showCoverInput && (
                    <div className="mt-2">
                        <input
                            type="url"
                            value={formData.coverUrl}
                            onChange={(e) => handleChange('coverUrl', e.target.value)}
                            placeholder="https://example.com/cover.jpg"
                            className="w-full px-3 py-2 border border-line rounded-lg text-small text-ink focus:border-primary focus:outline-none"
                        />
                        <p className="text-tiny text-ink-muted mt-1">
                            Masukkan URL gambar cover
                        </p>
                    </div>
                )}
            </div>

            {/* Title */}
            <div>
                <label htmlFor="book-title" className="block text-small font-medium text-ink mb-1">
                    Judul Buku <span className="text-danger">*</span>
                </label>
                <input
                    id="book-title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Masukkan judul buku"
                    className={`w-full px-3 py-2 border rounded-lg text-body text-ink focus:outline-none transition-colors ${errors.title ? 'border-danger focus:border-danger' : 'border-line focus:border-primary'
                        }`}
                    required
                    autoFocus
                    aria-required="true"
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                />
                {errors.title && (
                    <p id="title-error" className="text-tiny text-danger mt-1" role="alert">
                        {errors.title}
                    </p>
                )}
            </div>

            {/* Authors */}
            <div>
                <label htmlFor="book-authors" className="block text-small font-medium text-ink mb-1">
                    Penulis
                </label>
                <input
                    id="book-authors"
                    type="text"
                    value={formData.authors}
                    onChange={(e) => handleChange('authors', e.target.value)}
                    placeholder="Pisahkan dengan koma"
                    className="w-full px-3 py-2 border border-line rounded-lg text-body text-ink focus:border-primary focus:outline-none"
                />
                <p className="text-tiny text-ink-muted mt-1">Contoh: James Clear, Ryan Holiday</p>
            </div>

            {/* ISBN */}
            <div>
                <label htmlFor="book-isbn" className="block text-small font-medium text-ink mb-1">
                    ISBN (opsional)
                </label>
                <div className="flex gap-2">
                    <input
                        id="book-isbn"
                        type="text"
                        value={formData.isbn}
                        onChange={(e) => handleChange('isbn', e.target.value)}
                        placeholder="10 atau 13 digit"
                        className={`flex-1 px-3 py-2 border rounded-lg text-body text-ink focus:outline-none transition-colors ${isbnError ? 'border-danger focus:border-danger' : 'border-line focus:border-primary'
                            }`}
                    />
                    <button
                        type="button"
                        onClick={handleLookup}
                        disabled={!formData.isbn || !!isbnError || lookupLoading}
                        className="px-4 py-2 rounded-lg border border-line hover:border-primary hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        title="Cari di Open Library"
                    >
                        {lookupLoading ? (
                            <IconLoader2 size={18} className="animate-spin" />
                        ) : (
                            <IconSearch size={18} />
                        )}
                        <span className="hidden sm:inline">Cari</span>
                    </button>
                </div>
                <p className="text-tiny text-ink-muted mt-1">
                    Format: 10 digit (ISBN-10) atau 13 digit (ISBN-13)
                </p>
                {isbnError && (
                    <p className="text-tiny text-danger mt-1" role="alert">
                        {isbnError}
                    </p>
                )}
            </div>

            {/* Format */}
            <div>
                <label className="block text-small font-medium text-ink mb-1">
                    Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {Object.values(BOOK_FORMATS).map(format => (
                        <button
                            key={format.value}
                            type="button"
                            onClick={() => handleChange('format', format.value)}
                            className={`p-2 rounded-lg border-2 transition-all text-small ${formData.format === format.value
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-line hover:border-primary/50 text-ink-muted'
                                }`}
                        >
                            {format.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Total Pages/Minutes */}
            <div>
                <label className="block text-small font-medium text-ink mb-1">
                    {unit === 'pages' ? 'Jumlah Halaman' : 'Durasi (menit)'} (opsional)
                </label>
                <input
                    type="number"
                    value={unit === 'pages' ? formData.totalPages : formData.totalMinutes}
                    onChange={(e) => handleChange(
                        unit === 'pages' ? 'totalPages' : 'totalMinutes',
                        e.target.value
                    )}
                    placeholder={unit === 'pages' ? '300' : '360'}
                    min="1"
                    className="w-full px-3 py-2 border border-line rounded-lg text-body text-ink focus:border-primary focus:outline-none"
                />
            </div>

            {/* Status */}
            <div>
                <label className="block text-small font-medium text-ink mb-1">
                    Status
                </label>
                <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-line rounded-lg text-body text-ink focus:border-primary focus:outline-none"
                >
                    {Object.values(BOOK_STATUSES).map(status => (
                        <option key={status.value} value={status.value}>
                            {status.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-small font-medium text-ink mb-1">
                    Tag (opsional)
                </label>
                <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                    placeholder="Pisahkan dengan koma"
                    className="w-full px-3 py-2 border border-line rounded-lg text-body text-ink focus:border-primary focus:outline-none"
                />
                <p className="text-tiny text-ink-muted mt-1">Contoh: produktivitas, stoikisme</p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <button
                    type="submit"
                    disabled={loading || !formData.title.trim() || isbnError}
                    className="flex-1 btn-primary"
                >
                    {loading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Tambah Buku')}
                </button>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 btn-secondary"
                    >
                        Batal
                    </button>
                )}
            </div>

            {/* Preview Modal */}
            {showPreview && lookupResult && (
                <BookPreview
                    book={lookupResult}
                    onConfirm={handleConfirmLookup}
                    onCancel={() => setShowPreview(false)}
                />
            )}
        </form>
    )
}

export default BookForm

