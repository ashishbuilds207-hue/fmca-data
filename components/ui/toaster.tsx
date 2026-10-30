'use client'

import {
    Toast,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({
                id,
                icon,
                image,
                title,
                description,
                action,
                close,
                actionClassName,
                ...props
            }) {
                return (
                    <Toast
                        key={id}
                        {...props}
                        className={cn('', !!image && 'p-0', props.className)}
                    >
                        <div>
                            {image && <div>{image}</div>}
                            <div
                                className={cn(
                                    'flex items-start gap-2.5',
                                    !!image ? 'p-4' : 'p-0',
                                )}
                            >
                                {icon}
                                <div
                                    className={cn(
                                        'flex flex-col items-start gap-2',
                                        actionClassName,
                                    )}
                                >
                                    {title && <ToastTitle>{title}</ToastTitle>}
                                    {description}

                                    {action}
                                </div>
                                {close}
                            </div>
                        </div>
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}
