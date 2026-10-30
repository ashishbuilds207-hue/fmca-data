import type { Metadata } from 'next'
import LookupApp from '@/components/lookup/lookup-app'

export const metadata: Metadata = {
    title: 'DOTFILE — USDOT carrier lookup',
    description: 'Look up one or more USDOT numbers across FMCSA, MOTUS, SMS, and the crash file.',
}

export default function HomePage() {
    return <LookupApp />
}
