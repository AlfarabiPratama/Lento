import { useState, useEffect } from 'react'
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconPlayerSkipForward, IconCoffee, IconFocus2, IconBook, IconX } from '@tabler/icons-react'
import { usePomodoroTimer, useTodayPomodoro } from '../hooks/usePomodoro'
import { useHabits } from '../hooks/useHabits'
import { getBooksByStatus } from '../lib/booksRepo'

/**
 * PomodoroTimer - Compact timer component for Today page
 * Now with Book Integration for reading sessions
 */
function PomodoroTimer({ onClose, initialBook = null }) {
    const timer = usePomodoroTimer()
    const { sessionCount, focusMinutes } = useTodayPomodoro()
    const { habits } = useHabits()

    const [showLabelInput, setShowLabelInput] = useState(true)
    const [showBookPicker, setShowBookPicker] = useState(false)
    const [readingBooks, setReadingBooks] = useState([])

    // Load currently reading books
    useEffect(() => {
        getBooksByStatus('reading').then(setReadingBooks)
    }, [])

    // Set initial book if provided
    useEffect(() => {
        if (initialBook) {
            timer.selectBook(initialBook)
        }
    }, [initialBook])

    const modeLabels = {
        work: 'Fokus',
        short_break: 'Istirahat',
        long_break: 'Istirahat Panjang',
    }

    const modeColors = {
        work: 'text-primary',
        short_break: 'text-secondary',
        long_break: 'text-success',
    }

    const handleStart = () => {
        setShowLabelInput(false)
        timer.start()
    }

    const handleBookSelect = (book) => {
        timer.selectBook(book)
        setShowBookPicker(false)
    }

    const handleClearBook = () => {
        timer.selectBook(null)
        timer.setFocusLabel('')
    }

    // Progress ring calculation
    const radius = 60
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference * (1 - timer.progress)

    return (
        <div className="card p-6 text-center animate-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {timer.sessionMode === 'reading' ? (
                        <IconBook size={20} stroke={1.5} className="text-teal-500" />
                    ) : timer.mode === 'work' ? (
                        <IconFocus2 size={20} stroke={1.5} className="text-primary" />
                    ) : (
                        <IconCoffee size={20} stroke={1.5} className="text-secondary" />
                    )}
                    <span className={`text-h3 font-medium ${timer.sessionMode === 'reading' ? 'text-teal-600' : modeColors[timer.mode]}`}>
                        {timer.sessionMode === 'reading' ? 'Membaca' : modeLabels[timer.mode]}
                    </span>
                </div>
                <span className="tag-secondary">
                    {sessionCount} sesi • {focusMinutes} menit
                </span>
            </div>

            {/* Selected Book Indicator */}
            {timer.selectedBook && !timer.isRunning && (
                <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-teal-50 rounded-lg">
                    {timer.selectedBook.coverUrl ? (
                        <img
                            src={timer.selectedBook.coverUrl}
                            alt=""
                            className="w-10 h-11 object-cover rounded"
                        />
                    ) : (
                        <div className="w-10 h-11 bg-teal-200 rounded flex items-center justify-center">
                            <IconBook size={16} className="text-teal-600" />
                        </div>
                    )}
                    <span className="text-small text-teal-700 truncate max-w-[150px]">
                        {timer.selectedBook.title}
                    </span>
                    <button
                        onClick={handleClearBook}
                        className="min-w-11 min-h-11 flex items-center justify-center rounded hover:bg-teal-100 text-teal-500"
                    >
                        <IconX size={14} />
                    </button>
                </div>
            )}

            {/* Timer Display */}
            <div className="relative w-40 h-40 mx-auto mb-6">
                {/* Progress ring */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-paper-warm"
                    />
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className={`transition-all duration-1000 ${timer.sessionMode === 'reading' ? 'text-teal-500' : modeColors[timer.mode]}`}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-ink tabular-nums">
                        {timer.timeDisplay}
                    </span>
                    {timer.focusLabel && timer.isRunning && (
                        <span className="text-caption text-ink-muted mt-1 max-w-[100px] truncate">
                            {timer.focusLabel}
                        </span>
                    )}
                </div>
            </div>

            {/* Focus Label / Book Selector (before start) */}
            {showLabelInput && !timer.isRunning && timer.mode === 'work' && (
                <div className="mb-4 space-y-3">
                    {/* Book Quick Select */}
                    {readingBooks.length > 0 && !timer.selectedBook && (
                        <div>
                            <button
                                onClick={() => setShowBookPicker(!showBookPicker)}
                                className="flex items-center gap-2 mx-auto text-small text-teal-600 hover:text-teal-700"
                            >
                                <IconBook size={16} />
                                <span>Pilih buku untuk sesi baca</span>
                            </button>

                            {showBookPicker && (
                                <div className="mt-2 p-2 bg-paper-warm rounded-lg space-y-1 max-h-40 overflow-y-auto">
                                    {readingBooks.map(book => (
                                        <button
                                            key={book.id}
                                            onClick={() => handleBookSelect(book)}
                                            className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-surface text-left"
                                        >
                                            {book.coverUrl ? (
                                                <img src={book.coverUrl} alt="" className="w-8 h-11 object-cover rounded" />
                                            ) : (
                                                <div className="w-8 h-11 bg-teal-100 rounded flex items-center justify-center">
                                                    <IconBook size={12} className="text-teal-500" />
                                                </div>
                                            )}
                                            <span className="text-small text-ink truncate">{book.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Regular focus label input */}
                    {!timer.selectedBook && (
                        <input
                            type="text"
                            placeholder="Fokus pada apa? (opsional)"
                            value={timer.focusLabel}
                            onChange={(e) => timer.setFocusLabel(e.target.value)}
                            className="input text-center"
                            list="habits-list"
                        />
                    )}
                    <datalist id="habits-list">
                        {habits.map(h => (
                            <option key={h.id} value={h.name} />
                        ))}
                    </datalist>
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
                {!timer.isRunning ? (
                    <button
                        onClick={handleStart}
                        className={`btn-lg ${timer.sessionMode === 'reading' ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'btn-primary'}`}
                        aria-label="Mulai fokus"
                    >
                        <IconPlayerPlay size={24} stroke={2} />
                        <span>{timer.sessionMode === 'reading' ? 'Mulai Baca' : 'Mulai'}</span>
                    </button>
                ) : (
                    <>
                        {timer.isPaused ? (
                            <button
                                onClick={timer.resume}
                                className="btn-primary"
                                aria-label="Lanjutkan"
                            >
                                <IconPlayerPlay size={20} stroke={2} />
                            </button>
                        ) : (
                            <button
                                onClick={timer.pause}
                                className="btn-secondary"
                                aria-label="Jeda"
                            >
                                <IconPlayerPause size={20} stroke={2} />
                            </button>
                        )}
                        <button
                            onClick={timer.stop}
                            className="btn-secondary"
                            aria-label="Berhenti"
                        >
                            <IconPlayerStop size={20} stroke={2} />
                        </button>
                        <button
                            onClick={timer.skip}
                            className="btn-ghost"
                            aria-label="Lewati"
                        >
                            <IconPlayerSkipForward size={20} stroke={1.5} />
                        </button>
                    </>
                )}
            </div>

            {/* Mode switches (when not running) */}
            {!timer.isRunning && (
                <div className="flex justify-center gap-2 mt-4">
                    {['work', 'short_break', 'long_break'].map((m) => (
                        <button
                            key={m}
                            onClick={() => timer.setMode(m)}
                            className={`px-3 py-1.5 rounded-md text-caption transition-all ${timer.mode === m
                                ? 'bg-primary-50 text-primary'
                                : 'text-ink-muted hover:bg-paper-warm'
                                }`}
                        >
                            {m === 'work' ? 'Fokus' : m === 'short_break' ? 'Istirahat' : 'Long Break'}
                        </button>
                    ))}
                </div>
            )}

            {/* Reading mode indicator when running */}
            {timer.isRunning && timer.sessionMode === 'reading' && (
                <p className="text-tiny text-teal-600 mt-3">
                    📖 Progress akan otomatis tercatat saat sesi selesai
                </p>
            )}

            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-caption text-ink-muted hover:text-ink mt-4"
                >
                    Tutup
                </button>
            )}
        </div>
    )
}

export default PomodoroTimer

