import { useState, useEffect } from 'react'
import { IconX, IconSearch, IconSparkles } from '@tabler/icons-react'
import { HABIT_TEMPLATES, getTemplatesByCategory } from '../../lib/habitTemplates'
import { HABIT_CATEGORIES } from '../../lib/habitCategories'
import { HabitIcon } from '../../lib/habitIcons'

export function TemplatePicker({ isOpen, onClose, onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('')

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      // Reset states when closed
      setSearchQuery('')
      setSelectedCategoryFilter('')
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Filter templates by search and category
  const filteredTemplates = HABIT_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategoryFilter || template.category === selectedCategoryFilter
    return matchesSearch && matchesCategory
  })

  const handleSelectTemplate = (template) => {
    // Call onSelectTemplate first, then close
    try {
      onSelectTemplate(template)
    } finally {
      // Delay close to prevent DOM removal race condition
      setTimeout(() => {
        onClose()
      }, 50)
    }
  }

  const handleClose = () => {
    // Cleanup and close
    setSearchQuery('')
    setSelectedCategoryFilter('')
    onClose()
  }

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
    }
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:w-[95vw] sm:max-w-3xl h-full sm:h-auto sm:max-h-[90vh] bg-white sm:rounded-2xl shadow-2xl border-0 sm:border-2 sm:border-base-300 overflow-hidden flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 border-base-300 bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center">
              <IconSparkles className="text-primary" size={22} />
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-base-content">Pilih Template Habit</h3>
          </div>
          <button
            onClick={handleClose}
            className="btn btn-ghost btn-sm sm:btn-md btn-square hover:bg-error/10 hover:text-error"
          >
            <IconX size={22} />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 sm:p-5 border-b border-base-300 space-y-3 bg-base-50">
          {/* Search */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={20} />
            <input
              type="text"
              placeholder="Cari template..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-11 text-sm sm:text-base bg-white border-2 focus:border-primary h-11 sm:h-12"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-mandatory">
            <button
              onClick={() => setSelectedCategoryFilter('')}
              className={`btn h-8 min-h-8 px-3 sm:h-9 sm:min-h-9 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-all border-2 flex-shrink-0 snap-start ${!selectedCategoryFilter ? 'btn-primary shadow-md' : 'btn-ghost border-base-300 hover:border-primary/50'}`}
            >
              Semua
            </button>
            {HABIT_CATEGORIES.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryFilter(category.id)}
                className={`btn h-8 min-h-8 px-3 sm:h-9 sm:min-h-9 sm:px-4 text-xs sm:text-sm whitespace-nowrap transition-all border-2 flex-shrink-0 snap-start ${selectedCategoryFilter === category.id ? 'btn-primary shadow-md' : 'btn-ghost border-base-300 hover:border-primary/50'}`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-base-50">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-base-content/60">
              <p className="text-sm sm:text-base">Tidak ada template yang ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {filteredTemplates.map(template => {
                const category = HABIT_CATEGORIES.find(c => c.id === template.category)
                
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="text-left p-3 sm:p-4 bg-white border-2 border-base-300 rounded-xl hover:border-primary hover:shadow-lg transition-all duration-200 group active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all border-2 border-primary/20">
                        <HabitIcon 
                          iconName={template.icon} 
                          size={22} 
                          className="text-primary"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm sm:text-base mb-1 text-base-content group-hover:text-primary transition-colors line-clamp-1">
                          {template.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-base-content/70 line-clamp-2 mb-2 leading-relaxed">
                          {template.description}
                        </p>
                        
                        {/* Category Badge and Tags */}
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                          {category && (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold border"
                              style={{ 
                                backgroundColor: `${category.color}15`,
                                color: category.color,
                                borderColor: `${category.color}40`
                              }}
                            >
                              {category.label}
                            </span>
                          )}
                          {template.tags.slice(0, 2).map(tag => (
                            <span 
                              key={tag}
                              className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-medium bg-base-200 text-base-content border border-base-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t-2 border-base-300 bg-gradient-to-r from-primary/5 to-primary/10 text-center">
          <p className="text-xs sm:text-sm font-semibold text-base-content/70">
            <span className="text-primary font-bold">{filteredTemplates.length}</span> template tersedia
          </p>
        </div>
      </div>
    </div>
  )
}

// Button to trigger template picker
export function TemplatePickerButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn btn-outline btn-sm gap-2"
    >
      <IconSparkles size={18} />
      Dari Template
    </button>
  )
}
