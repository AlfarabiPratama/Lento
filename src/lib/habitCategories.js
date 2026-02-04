/**
 * Habit Categories and Icon Mappings
 * 
 * Predefined categories with default icons and colors
 */

export const HABIT_CATEGORIES = [
    { id: 'kesehatan', label: 'Kesehatan', icon: 'IconHeart', color: 'text-red-500' },
    { id: 'produktivitas', label: 'Produktivitas', icon: 'IconRocket', color: 'text-blue-500' },
    { id: 'belajar', label: 'Belajar', icon: 'IconBook', color: 'text-purple-500' },
    { id: 'olahraga', label: 'Olahraga', icon: 'IconRun', color: 'text-green-500' },
    { id: 'mindfulness', label: 'Mindfulness', icon: 'IconBrain', color: 'text-indigo-500' },
    { id: 'keuangan', label: 'Keuangan', icon: 'IconCoin', color: 'text-yellow-600' },
    { id: 'sosial', label: 'Sosial', icon: 'IconUsers', color: 'text-pink-500' },
    { id: 'kreatif', label: 'Kreatif', icon: 'IconPalette', color: 'text-orange-500' },
    { id: 'lainnya', label: 'Lainnya', icon: 'IconDots', color: 'text-gray-500' },
]

// Get category by ID
export function getCategoryById(categoryId) {
    return HABIT_CATEGORIES.find(c => c.id === categoryId) || HABIT_CATEGORIES[HABIT_CATEGORIES.length - 1]
}

// Common habit icons (subset of Tabler Icons)
export const HABIT_ICONS = [
    // Health & Fitness
    'IconHeart',
    'IconRun',
    'IconBike',
    'IconYoga',
    'IconApple',
    'IconPill',
    'IconBed',
    'IconGlass',
    'IconApple',
    'IconPill',
    'IconBed',
    
    // Productivity
    'IconRocket',
    'IconTarget',
    'IconCheckbox',
    'IconClock',
    'IconBolt',
    'IconBriefcase',
    
    // Learning
    'IconBook',
    'IconBook2',
    'IconSchool',
    'IconCertificate',
    'IconBulb',
    'IconLanguage',
    
    // Mindfulness
    'IconBrain',
    'IconMoodSmile',
    'IconFlower',
    'IconSun',
    'IconMoon',
    'IconLeaf',
    'IconNotes',
    'IconBan',
    
    // Finance
    'IconCoin',
    'IconPigMoney',
    'IconWallet',
    'IconChartLine',
    
    // Social
    'IconUsers',
    'IconUser',
    'IconHeart',
    'IconPhone',
    'IconMail',
    
    // Creative
    'IconPalette',
    'IconPaint',
    'IconMusic',
    'IconCamera',
    'IconPencil',
    'IconBrush',
    
    // General
    'IconStar',
    'IconFlame',
    'IconSparkles',
    'IconTrophy',
    'IconMedal',
    'IconCheck',
]

// Get default icon for category
export function getDefaultIconForCategory(categoryId) {
    const category = getCategoryById(categoryId)
    return category.icon
}
