/**
 * Soundscapes Track Registry
 * 
 * Metadata for all available ambient soundscapes.
 * Single source of truth for track information.
 */

import {
    IconCloudRain,
    IconCoffee,
    IconWaveSine,
    IconTrees,
} from '@tabler/icons-react'

export const TRACKS = [
    {
        id: 'rain',
        label: 'Hujan',
        src: '/soundscapes/rain.mp3',
        icon: IconCloudRain,
        description: 'Suara hujan pelan',
    },
    {
        id: 'cafe',
        label: 'Cafe',
        src: '/soundscapes/cafe.mp3',
        icon: IconCoffee,
        description: 'Kafe yang ramai',
    },
    {
        id: 'white-noise',
        label: 'White Noise',
        src: '/soundscapes/white-noise.mp3',
        icon: IconWaveSine,
        description: 'Noise putih',
    },
    {
        id: 'forest',
        label: 'Hutan',
        src: '/soundscapes/forest.mp3',
        icon: IconTrees,
        description: 'Burung di hutan',
    },
]

/**
 * Get track by ID
 * @param {string} id - Track ID
 * @returns {object|null} Track object or null if not found
 */
export function getTrackById(id) {
    return TRACKS.find(track => track.id === id) || null
}

/**
 * Get track label by ID
 * @param {string} id - Track ID
 * @returns {string} Track label or 'Unknown'
 */
export function getTrackLabel(id) {
    const track = getTrackById(id)
    return track ? track.label : 'Unknown'
}
