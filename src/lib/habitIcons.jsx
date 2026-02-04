/**
 * Habit Icon Utilities
 * Helper for rendering habit icons dynamically
 */

import React from 'react'
import {
    // Health & Fitness
    IconHeart, IconRun, IconBike, IconYoga, IconApple, IconPill, IconBed, IconGlass,
    // Productivity
    IconRocket, IconTarget, IconCheckbox, IconClock, IconBolt, IconBriefcase,
    // Learning
    IconBook, IconBook2, IconSchool, IconCertificate, IconBulb, IconLanguage,
    // Mindfulness
    IconBrain, IconMoodSmile, IconFlower, IconSun, IconMoon, IconLeaf, IconNotes, IconBan,
    // Finance
    IconCoin, IconPigMoney, IconWallet, IconChartLine,
    // Social
    IconUsers, IconUser, IconPhone, IconMail,
    // Creative
    IconPalette, IconPaint, IconMusic, IconCamera, IconPencil, IconBrush,
    // General
    IconStar, IconFlame, IconSparkles, IconTrophy, IconMedal, IconCheck
} from '@tabler/icons-react'

export const iconMap = {
    IconHeart, IconRun, IconBike, IconYoga, IconApple, IconPill, IconBed, IconGlass,
    IconRocket, IconTarget, IconCheckbox, IconClock, IconBolt, IconBriefcase,
    IconBook, IconBook2, IconSchool, IconCertificate, IconBulb, IconLanguage,
    IconBrain, IconMoodSmile, IconFlower, IconSun, IconMoon, IconLeaf, IconNotes, IconBan,
    IconCoin, IconPigMoney, IconWallet, IconChartLine,
    IconUsers, IconUser, IconPhone, IconMail,
    IconPalette, IconPaint, IconMusic, IconCamera, IconPencil, IconBrush,
    IconStar, IconFlame, IconSparkles, IconTrophy, IconMedal, IconCheck
}

/**
 * Get icon component by name
 */
export function getIconComponent(iconName) {
    return iconMap[iconName] || null
}

/**
 * Render habit icon
 */
export function HabitIcon({ iconName, size = 20, className = '' }) {
    const IconComponent = getIconComponent(iconName)
    
    if (!IconComponent) return null
    
    return <IconComponent size={size} stroke={2} className={className} />
}
