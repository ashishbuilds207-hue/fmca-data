'use client'

import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart'
import React from 'react'
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

const CylinderBar = (props: any) => {
    const { fill, x: xValue, y, width, height } = props
    const halfWidth = width / 2
    const x = xValue + halfWidth

    const pathData = `
        M${x - halfWidth},${y}
        A${halfWidth},10 0 0,0 ${x + halfWidth},${y}
        L${x + halfWidth},${y + height}
        A${halfWidth},10 0 0,0 ${x - halfWidth},${y + height}
        Z
    `

    return (
        <>
            <ellipse cx={x} cy={y} rx={halfWidth} ry="10" fill={fill} />
            <ellipse
                cx={x}
                cy={y + height}
                rx={halfWidth}
                ry="10"
                fill={fill + '80'}
            />
            <path d={pathData} stroke="none" fill={fill + '80'} />
        </>
    )
}

const BackgroundBar = (props: any) => {
    const { color, x, y, width, height } = props

    return (
        <>
            <ellipse
                cx={x + width / 2}
                cy={y + 10}
                rx={width / 2}
                ry="10"
                fill={color + '2e'}
            />
            <path
                x={x}
                y={y}
                width={width}
                height={height}
                fill={color + '1a'}
                d={`M ${x},${y} h ${width} v ${height} h -${width} Z`}
            ></path>
        </>
    )
}

const DashboardCryptoBalanceChart = () => {
    const chartData = [
        { type: 'Bitcoin', balance: 350, color: '#7C3AED' },
        { type: 'Ethereum', balance: 5600, color: '#22C55E' },
        { type: 'Tether ', balance: 2500, color: '#EF4444' },
        { type: 'Binance', balance: 266, color: '#EAB308' },
    ]

    const chartConfig = {
        balance: {
            label: 'Balance',
            color: 'hsl(var(--chart-1))',
        },
    } satisfies ChartConfig

    return (
        <ChartContainer
            config={chartConfig}
            className="relative mb-5 sm:h-full sm:max-h-72"
        >
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="type"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="text-sm font-semibold text-gray-700"
                />
                <YAxis
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    className="font-semibold text-gray-700"
                    tickFormatter={(value) => `$${value}`}
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
                <Bar
                    dataKey="balance"
                    radius={40}
                    barSize={40}
                    background={<BackgroundBar />}
                    shape={<CylinderBar />}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Bar>
            </BarChart>
        </ChartContainer>
    )
}

export default DashboardCryptoBalanceChart
