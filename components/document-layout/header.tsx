'use client'

import { Button } from '@/components/ui/button'
import { BookText, Menu, Phone, ShoppingBag, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
    const toggleHeaderMenu = () => {
        document.getElementById('header-menu')?.classList.toggle('open')
        document.getElementById('overlay')?.classList.toggle('open')
    }

    return (
        <div className="sticky top-0 z-50 bg-white sm:bg-transparent shadow-sm sm:shadow-none">
            <div className="container">
                <div className="flex items-center justify-between gap-5 border-b bg-white py-5 rounded-none sm:shadow-sm sm:rounded-b-[20px] sm:p-5 lg:p-[30px]">
                    <div className="flex items-center gap-3 lg:gap-5">
                        <Link
                            href="/documentation"
                            className="inline-block shrink-0"
                        >
                            <Image
                                src="/images/logo.svg"
                                width={160}
                                height={38}
                                alt="Logo"
                                className="h-auto w-32 sm:w-40"
                            />
                        </Link>
                    </div>
                    <div
                        id="overlay"
                        onClick={toggleHeaderMenu}
                        className="fixed inset-0 z-40 hidden h-full w-full bg-white/70"
                    ></div>
                    <div
                        id="header-menu"
                        className="header-menu fixed -right-full top-0 z-50 flex h-screen w-80 flex-col gap-4 overflow-y-auto bg-white p-5 duration-300 lg:static lg:h-auto lg:w-auto lg:flex-row lg:items-center lg:p-0"
                    >
                        <button
                            type="button"
                            className="absolute right-5 top-4 text-black hover:text-gray lg:hidden"
                            onClick={toggleHeaderMenu}
                        >
                            <X className="size-5" />
                        </button>
                        <Link
                            href="/documentation"
                            className="inline-block shrink-0 border-b border-gray-300 pb-4 lg:hidden"
                        >
                            <Image
                                src="/images/logo.svg"
                                width={160}
                                height={38}
                                alt="Logo"
                                className="h-auto w-auto"
                            />
                        </Link>
                        <Link href="/">
                            <Button
                                variant={'black'}
                                type="button"
                                className="w-full"
                                size={'extralarge'}
                            >
                                <ShoppingBag />
                                Purchase Now
                            </Button>
                        </Link>
                        <Link href="/installation" target="_blank">
                            <Button
                                variant={'black'}
                                type="button"
                                className="w-full"
                                size={'extralarge'}
                            >
                                <BookText />
                                Documentation
                            </Button>
                        </Link>
                        <Link
                            href="https://sbthemes.freshdesk.com/support/tickets/new"
                            target="_blank"
                        >
                            <Button
                                variant={'black'}
                                type="button"
                                className="w-full bg-success"
                                size={'extralarge'}
                            >
                                <Phone />
                                Contact US
                            </Button>
                        </Link>
                    </div>
                    <button
                        type="button"
                        className="text-black hover:text-gray lg:hidden"
                        onClick={toggleHeaderMenu}
                    >
                        <Menu className="size-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
