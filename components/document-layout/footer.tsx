import Link from 'next/link'

export default function Footer() {
    return (
        <div className='mt-auto text-center border-t py-5 border-gray-300 px-4 text-sm'>
            Copyright © {new Date().getFullYear()} All rights reserved by&nbsp;
            <Link href="https://sbthemes.com/" className='text-primary hover:opacity-70 transition'>SBThemes</Link>
        </div>
    )
}
