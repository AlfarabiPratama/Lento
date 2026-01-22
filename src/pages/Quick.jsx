import { useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

/**
 * Quick - Redirect handler for PWA shortcuts
 * 
 * Routes:
 * /quick/expense   → /more/finance?open=txn&type=expense
 * /quick/journal   → /journal?open=quick
 * /quick/pomodoro  → /?open=pomodoro
 * /quick/note      → /space?open=quicknote
 */
export default function Quick() {
    const { action } = useParams()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Preserve UTM params
        const searchParams = new URLSearchParams(location.search)
        const utm = searchParams.get('utm_source')
        const utmParam = utm ? `&utm_source=${utm}` : ''

        switch (action) {
            case 'expense':
                navigate(`/more/finance?open=txn&type=expense${utmParam}`, { replace: true })
                break
            case 'income':
                navigate(`/more/finance?open=txn&type=income${utmParam}`, { replace: true })
                break
            case 'journal':
                navigate(`/journal?open=quick${utmParam}`, { replace: true })
                break
            case 'pomodoro':
                navigate(`/?open=pomodoro${utmParam}`, { replace: true })
                break
            case 'note':
                navigate(`/space?open=quicknote${utmParam}`, { replace: true })
                break
            default:
                navigate('/', { replace: true })
        }
    }, [action, navigate, location.search])

    // No UI - just redirect
    return null
}
