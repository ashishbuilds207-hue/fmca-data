'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const ToastSonner = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme()

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            closeButton={true}
            toastOptions={{
                classNames: {
                    toast: 'group overflow-hidden toast group-[.toaster]:bg-white group-[.toaster]:!border-0 group-[.toaster]:p-0 group-[.toaster]:block group-[.toaster]:text-foreground group-[.toaster]:shadow-3xl ',
                    description: 'group-[.toast]:text-black text-sm/tight',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton: '!text-black',
                    closeButton:
                        'text-black [&>svg]:size-[18px] border-0 hover:opacity-70 top-[22px] ml-auto absolute right-2',
                },
            }}
            {...props}
        />
    )
}

export { ToastSonner }
