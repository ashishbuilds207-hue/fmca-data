'use client'

import { CryptoChart } from '@/components/custom/table/crypto-chart'
import IconShoringArrowup from '@/components/icons/icon-shoring-arrowup'
import { Badge } from '@/components/ui/badge'
import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'

export type ITable = {
    id: string
    coin: {
        image: string
        short_name: string
        name: string
    }
    price: string
    change: string
    volume: string
    market_cap: string
    chart: {
        color: string
        chartData: {
            market_cap: number
        }[]
    }
}

export const cryptoColumn: ColumnDef<ITable>[] = [
    {
        id: 'coin',
        accessorKey: 'coin',
        accessorFn: (row) =>
            `${row.coin.short_name} ${row.coin.name}` ||
            `${row.coin.short_name}` ||
            `${row.coin.name}`,
        header: 'Coin',
        cell: ({ row }) => {
            const { image, short_name, name } = row.original.coin
            return (
                <div className="flex items-center gap-1.5">
                    <div className="size-[26px] overflow-hidden">
                        <Image
                            src={image}
                            alt={name}
                            className="size-full object-cover"
                            width={26}
                            height={26}
                        />
                    </div>
                    <span className="uppercase">{short_name}</span>
                    <span className="capitalize">{name}</span>
                </div>
            )
        },
    },
    {
        accessorKey: 'price',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Price
                    <span className="inline-flex flex-col items-center -space-y-[1px]">
                        <IconShoringArrowup
                            className={`size-2 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <IconShoringArrowup
                            className={`size-2 shrink-0 rotate-180 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('price')}</div>,
    },

    {
        accessorKey: 'change',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <p>
                        <span className="font-semibold text-black">24h</span>{' '}
                        Change
                    </p>
                    <span className="inline-flex flex-col items-center -space-y-[1px]">
                        <IconShoringArrowup
                            className={`size-2 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <IconShoringArrowup
                            className={`size-2 shrink-0 rotate-180 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                </button>
            )
        },
        cell: ({ row }) => {
            const ChangeValue: string = row.getValue('change')
            return (
                <Badge
                    size={'small'}
                    variant={Number(ChangeValue) > 0 ? 'success' : 'danger'}
                >
                    {row.getValue('change')}%
                </Badge>
            )
        },
    },
    {
        accessorKey: 'volume',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <p>
                        <span className="font-semibold text-black">24h</span>{' '}
                        Volume
                    </p>
                    <span className="inline-flex flex-col items-center -space-y-[1px]">
                        <IconShoringArrowup
                            className={`size-2 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <IconShoringArrowup
                            className={`size-2 shrink-0 rotate-180 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                </button>
            )
        },
        cell: ({ row }) => (
            <div className="text-primary">{row.getValue('volume')}</div>
        ),
    },
    {
        accessorKey: 'market_cap',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Market Cap
                    <span className="inline-flex flex-col items-center -space-y-[1px]">
                        <IconShoringArrowup
                            className={`size-2 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <IconShoringArrowup
                            className={`size-2 shrink-0 rotate-180 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('market_cap')}</div>,
    },

    {
        id: 'chart',
        enableHiding: false,
        header: () => {
            return <span></span>
        },
        cell: ({ row }) => {
            const { color, chartData } = row.original.chart
            return <CryptoChart color={color} data={chartData} />
        },
    },
]
