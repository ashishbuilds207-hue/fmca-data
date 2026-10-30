'use client'

import { Bar, BarChart, XAxis } from 'recharts'

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
const chartData = [
    { month: 'Jun', desktop: 186, mobile: 80 },
    { month: 'Jul', desktop: 305, mobile: 200 },
    { month: 'Aug', desktop: 237, mobile: 120 },
    { month: 'Sep', desktop: 73, mobile: 190 },
    { month: 'Oct', desktop: 209, mobile: 130 },
    { month: 'Nov', desktop: 214, mobile: 140 },
    { month: 'Dec', desktop: 175, mobile: 250 },
]

const chartConfig = {
    desktop: {
        label: 'Desktop',
        color: 'hsl(var(--chart-1))',
    },
    mobile: {
        label: 'Mobile',
        color: 'hsl(var(--chart-2))',
    },
} satisfies ChartConfig

export function StatisticMultibarChart() {
    return (
        <ChartContainer config={chartConfig} className="max-h-80 w-full">
            <BarChart accessibilityLayer data={chartData}>
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="font-semibold text-gray-700"
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                    cursor={false}
                    content={
                        <ChartTooltipContent
                            indicator="line"
                            className="min-w-[32px] border-none bg-black px-1.5 py-1 text-xs/[10px] text-white"
                        />
                    }
                />
                <Bar dataKey="desktop" fill="#22C55E" radius={8} barSize={12} />
                <Bar dataKey="mobile" fill="#335CFF" radius={8} barSize={12} />
            </BarChart>
        </ChartContainer>
    )
}
