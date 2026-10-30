import { NextResponse } from 'next/server'
import { parseDots } from '@/lib/lookup/format'
import { loadCarrier } from '@/lib/lookup/load'

export const dynamic = 'force-dynamic'

async function mapPool<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
    const output: R[] = new Array(items.length)
    let index = 0
    async function worker() {
        while (index < items.length) {
            const current = index
            index += 1
            output[current] = await task(items[current])
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
    return output
}

export async function POST(request: Request) {
    const body = await request.json().catch(() => null)
    const raw = Array.isArray(body?.dots) ? body.dots.join(' ') : String(body?.dots || body?.dot || '')
    const dots = parseDots(raw)
    if (!dots.length) {
        return NextResponse.json({ error: 'Enter at least one USDOT number.' }, { status: 400 })
    }
    if (dots.length > 6) {
        return NextResponse.json({ error: 'Look up to 6 USDOT numbers at a time.' }, { status: 400 })
    }
    const results = await mapPool(dots, 3, loadCarrier)
    return NextResponse.json({
        results,
        generatedAt: new Date().toISOString(),
    })
}
