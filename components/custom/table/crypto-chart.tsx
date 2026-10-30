'use client'

import * as React from 'react'
import { Area, AreaChart } from 'recharts'
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'

const chartConfig = {
    market_cap: {
        label: 'Market Cap',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig

export function CryptoChart({ color, data }: { color: string; data: any[] }) {
    const gradientId = `fillMarket-${color.replace('#', '')}`

    return (
        <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[30px] w-[90px] shadow-none"
        >
            <AreaChart data={data}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={color || '#EAB308'}
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor={color || '#EAB308'}
                            stopOpacity={0.1}
                        />
                    </linearGradient>
                </defs>

                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            hideLabel={true}
                            hideIndicator={true}
                            className="min-w-[32px] border-none bg-black/80 px-1.5 py-1 text-xs/[10px] text-white"
                            formatter={(props: any) => {
                                return `$${props}`
                            }}
                        />
                    }
                />
                <Area
                    dataKey="market_cap"
                    type="natural"
                    fill={`url(#${gradientId})`}
                    stroke={color || '#7C3AED'}
                    stackId="a"
                />
            </AreaChart>
        </ChartContainer>
    )
}
