'use client'

import { useEffect, useState } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { toneFor } from '@/lib/lookup/score'

const tooltipStyle = {
    background: '#10151c',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 12,
    color: '#e8eef7',
    fontSize: 12,
}

const GAUGE_BANDS = [
    { grade: 'D', from: 0, to: 50, color: '#8d97a6', range: '0–50' },
    { grade: 'C', from: 51, to: 64, color: '#e39b3a', range: '51–64' },
    { grade: 'B', from: 65, to: 75, color: '#c6b15a', range: '65–75' },
    { grade: 'A', from: 76, to: 100, color: '#3e9d52', range: '76–100' },
] as const

const VERDICT_COLOR: Record<string, string> = {
    A: '#5dce73',
    B: '#e6d36a',
    C: '#f0a64a',
    D: '#ff5d5d',
}

function gaugePoint(score: number, radius: number, cx: number, cy: number) {
    const angle = Math.PI * (1 - Math.min(100, Math.max(0, score)) / 100)
    return {
        x: cx + radius * Math.cos(angle),
        y: cy - radius * Math.sin(angle),
    }
}

function gaugeArc(from: number, to: number, radius: number, cx: number, cy: number) {
    const start = gaugePoint(from, radius, cx, cy)
    const end = gaugePoint(to, radius, cx, cy)
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`
}

export function ScoreGauge({
    value,
    grade,
    verdict,
}: {
    value: number
    grade: string
    verdict: string
}) {
    const [shown, setShown] = useState(0)
    useEffect(() => {
        const frame = requestAnimationFrame(() => setShown(value))
        return () => cancelAnimationFrame(frame)
    }, [value])

    const cx = 160
    const cy = 132
    const radius = 104
    const verdictColor = VERDICT_COLOR[grade] || '#ff5d5d'

    return (
        <div>
            <div className="relative">
                <svg viewBox="0 0 320 176" className="w-full overflow-visible">
                    <path d={gaugeArc(1, 99, radius, cx, cy)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" strokeLinecap="butt" />
                    {GAUGE_BANDS.map((band) => (
                        <path
                            key={band.grade}
                            d={gaugeArc(band.from + 1.2, band.to - 1.2, radius, cx, cy)}
                            fill="none"
                            stroke={band.color}
                            strokeWidth="14"
                            strokeLinecap="butt"
                        />
                    ))}
                    {GAUGE_BANDS.map((band) => {
                        const mid = (band.from + band.to) / 2
                        const point = gaugePoint(mid, radius + 22, cx, cy)
                        return (
                            <text key={band.grade} x={point.x} y={point.y} textAnchor="middle" dominantBaseline="middle" fill="#d5dbe6" fontSize="13" fontWeight="600">
                                {band.grade}
                            </text>
                        )
                    })}
                    <g style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${-90 + (shown / 100) * 180}deg)`, transition: 'transform 900ms cubic-bezier(.22,.8,.2,1)' }}>
                        <line x1={cx} y1={cy - 72} x2={cx} y2={cy - radius + 14} stroke="#f4f7fb" strokeWidth="3.5" strokeLinecap="round" />
                    </g>
                    <circle cx={cx} cy={cy} r="7" fill="#f4f7fb" />
                    <circle cx={cx} cy={cy} r="3.5" fill="#10151c" />
                </svg>
                <div className="pointer-events-none absolute inset-x-0 top-[46%] text-center">
                    <div className="text-[11px] font-medium tracking-[0.28em] text-[#9aa6b8]">GRADE {grade}</div>
                    <div className="mt-1 text-6xl font-semibold leading-none tracking-tight text-white">{value}</div>
                    <div className="mt-1 text-[13px] font-semibold tracking-[0.18em]" style={{ color: verdictColor }}>
                        {verdict.toUpperCase()}
                    </div>
                </div>
            </div>
            <div className="mt-3 flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#3e9d52]/80 bg-[#3e9d52]/10 px-4 py-1 text-[11px] font-semibold tracking-[0.22em] text-[#8dffb0]">
                    <span className="size-2 rounded-full bg-[#3e9d52] shadow-[0_0_10px_#3e9d52]" />
                    LIVE
                </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1">
                {GAUGE_BANDS.map((band) => (
                    <div key={band.grade} className="text-center">
                        <div className="mx-auto mb-1 size-2 rounded-full" style={{ background: band.color }} />
                        <div className="text-[11px] font-semibold text-white">{band.grade}</div>
                        <div className="text-[10px] text-[#8b97a8]">{band.range}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function CategoryChart({
    rows,
}: {
    rows: { label: string; score: number | null }[]
}) {
    const data = rows.filter((row) => row.score != null) as { label: string; score: number }[]
    if (!data.length) return null
    return (
        <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                        type="category"
                        dataKey="label"
                        width={92}
                        tick={{ fill: '#b7c0ce', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} contentStyle={tooltipStyle} />
                    <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={14} background={{ fill: 'rgba(255,255,255,0.04)', radius: 8 }}>
                        {data.map((row) => (
                            <Cell key={row.label} fill={toneFor(row.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export function CrashChart({
    rows,
}: {
    rows: { month: string; crashes: number; fatalities: number }[]
}) {
    if (!rows.length) return null
    return (
        <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <XAxis
                        dataKey="month"
                        tick={{ fill: '#8b97a8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={24}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#8b97a8', fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Area type="monotone" dataKey="crashes" stroke="#f0b429" fill="#f0b429" fillOpacity={0.18} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export function CompareChart({
    rows,
}: {
    rows: { dot: string; score: number }[]
}) {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                    <XAxis dataKey="dot" tick={{ fill: '#b7c0ce', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#8b97a8', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={28}>
                        {rows.map((row) => (
                            <Cell key={row.dot} fill={toneFor(row.score)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
