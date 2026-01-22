/**
 * Soundscapes Context Hook
 * 
 * Consumer hook for accessing soundscapes context.
 * Throws error if used outside provider (fail-fast pattern).
 */

import { useContext } from 'react'
import { SoundscapesContext } from './SoundscapesProvider'

/**
 * Hook to access soundscapes context
 * @throws {Error} If used outside SoundscapesProvider
 * @returns {object} Soundscapes context value
 */
export function useSoundscapes() {
    const context = useContext(SoundscapesContext)

    if (!context) {
        throw new Error(
            'useSoundscapes must be used within SoundscapesProvider. ' +
            'Wrap your component tree with <SoundscapesProvider>.'
        )
    }

    return context
}

export default useSoundscapes
