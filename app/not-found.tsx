import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="grid min-h-screen place-items-center bg-[#06080c] px-6 text-[#e8eef7]">
            <div className="text-center">
                <p className="text-xs uppercase tracking-[0.18em] text-[#f0b429]">404</p>
                <h1 className="mt-2 text-3xl font-semibold">That page is not on file.</h1>
                <Link href="/" className="mt-4 inline-block text-sm text-[#f0b429]">
                    Back to lookup
                </Link>
            </div>
        </div>
    )
}
