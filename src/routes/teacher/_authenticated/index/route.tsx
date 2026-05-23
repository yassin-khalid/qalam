import { createFileRoute, redirect } from '@tanstack/react-router'

// `/teacher` lands here — redirect straight to the dashboard.
export const Route = createFileRoute('/teacher/_authenticated/')({
    beforeLoad: () => {
        throw redirect({ to: '/teacher/dashboard' })
    },
})
