'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

const avatarVariants = cva(
    'flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
    {
        variants: {
            variant: {
                default: '',
                letters: 'grid place-content-center text-white font-bold',
            },
            size: {
                default: 'h-10 w-10',
                extralarge: 'size-16 text-[30px]',
                large: 'size-14 text-[22px]',
                medium: 'size-11 text-lg',
                small: 'size-[34px] text-sm',
                thin: 'h-6 w-6 text-[10px]',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
)

const Avatar = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> &
        VariantProps<typeof avatarVariants>
>(({ className, variant, size, ...props }, ref) => (
    <div className="relative">
        <AvatarPrimitive.Root
            ref={ref}
            className={cn(avatarVariants({ variant, size, className }))}
            {...props}
        />
    </div>
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Image>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Image
        ref={ref}
        className={cn('h-full w-full object-cover', className)}
        {...props}
    />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn(
            'flex h-full w-full items-center justify-center rounded-full bg-gray-400 text-black',
            className,
        )}
        {...props}
    />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
