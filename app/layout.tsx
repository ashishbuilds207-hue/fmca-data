import type { Metadata } from 'next'
import '@/app/globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ToastSonner } from '@/components/ui/sonner'

export const metadata: Metadata = {
    title: 'DOTFILE — USDOT carrier lookup',
    description: 'Look up FMCSA, MOTUS, and transportation.gov carrier records by USDOT number.',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body className="bg-[#06080c] font-plus-jakarta text-sm/[22px] font-normal text-[#e8eef7] antialiased">
                {children}
                <Toaster />
                <ToastSonner />
            </body>
        </html>
    )
}
