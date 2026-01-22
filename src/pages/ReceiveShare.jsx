import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPage } from '../lib/pages'

/**
 * ReceiveShare - Handle incoming shared content from other apps
 * 
 * This page receives shared content via Web Share Target API
 * and saves it as a Quick Note in Space.
 */
export default function ReceiveShare() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleShare = async () => {
            const params = new URLSearchParams(window.location.search)
            const title = params.get('title') || ''
            const text = params.get('text') || ''
            const url = params.get('url') || ''

            // Build content from shared data
            const contentParts = []
            if (text) contentParts.push(text)
            if (url) contentParts.push(url)
            const content = contentParts.join('\n\n')

            // Generate a sensible title
            let finalTitle = title
            if (!finalTitle && url) {
                try {
                    finalTitle = `Link: ${new URL(url).hostname}`
                } catch {
                    finalTitle = 'Shared Link'
                }
            }
            if (!finalTitle) {
                finalTitle = 'Quick Note'
            }

            try {
                // Create a new page in Space with the shared content
                const newPage = await createPage({
                    title: `📥 ${finalTitle}`,
                    content,
                    tags: ['inbox', 'shared'],
                })

                // Navigate to Space with the new note open
                navigate(`/space?open=${encodeURIComponent(newPage.id)}&from=share_target`, {
                    replace: true,
                })
            } catch (error) {
                console.error('Failed to create shared note:', error)
                // Fallback: just go to space
                navigate('/space', { replace: true })
            }
        }

        handleShare()
    }, [navigate])

    // Loading state while processing
    return (
        <div className="flex items-center justify-center min-h-screen-nav">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-body text-ink-muted">Menyimpan ke Space...</p>
            </div>
        </div>
    )
}
