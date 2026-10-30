'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { ColumnDef } from '@tanstack/react-table'
import { MoveDown, MoveUp, PenLine, Trash2 } from 'lucide-react'
import Image from 'next/image'

export type ITable = {
    id: string
    invoice_id: string
    client: {
        image: string
        name: string
        email: string
    }
    issued_date: string
    amount: string
    status: 'paid' | 'pending' | 'overdue' | 'Unpaid'
    due_date: string
}

export const invoiceColumn: ColumnDef<ITable>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'invoice_id',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                    ID
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('invoice_id')}</div>,
    },
    {
        id: 'client',
        accessorKey: 'client',
        accessorFn: (row) =>
            `${row.client.name} ${row.client.email}` ||
            `${row.client.name}` ||
            `${row.client.name}`,
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                    Client
                </button>
            )
        },
        cell: ({ row }) => {
            const image = row.original.client

            return (
                <div className="flex items-center gap-2">
                    <div className="size-6 overflow-hidden">
                        <Image
                            src={image.image}
                            alt={image.name}
                            className="size-full object-cover"
                            width={24}
                            height={24}
                        />
                    </div>
                    <div className="space-y-0.5">
                        <p>{image.name}</p>
                        <p className="line-clamp-1 break-all text-gray-700">
                            {image.email}
                        </p>
                    </div>
                </div>
            )
        },
    },

    {
        accessorKey: 'issued_date',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                    Issued Date
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('issued_date')}</div>,
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown
                            className={`size-2.5 shrink-0 text-black ${column.getIsSorted() === 'asc' && 'text-gray-500'}`}
                        />
                        <MoveUp
                            className={`size-2.5 shrink-0 text-gray-500 ${column.getIsSorted() === 'asc' && '!text-black'}`}
                        />
                    </span>
                    Amount
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('amount')}</div>,
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown className="size-2.5 shrink-0 text-black" />
                        <MoveUp className="size-2.5 shrink-0 text-gray-500" />
                    </span>
                    Status
                </button>
            )
        },
        cell: ({ row }) => (
            <Badge
                variant={
                    row.getValue('status') === 'paid'
                        ? 'green'
                        : row.getValue('status') === 'pending'
                          ? 'orange'
                          : row.getValue('status') === 'overdue'
                            ? 'blue'
                            : 'red'
                }
                className="capitalize"
            >
                {row.getValue('status')}
            </Badge>
        ),
    },
    {
        accessorKey: 'due_date',
        header: ({ column }) => {
            return (
                <button
                    type="button"
                    className="flex items-center gap-1.5"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <span className="inline-flex items-center -space-x-[5px]">
                        <MoveDown className="size-2.5 shrink-0 text-black" />
                        <MoveUp className="size-2.5 shrink-0 text-gray-500" />
                    </span>
                    Due Date
                </button>
            )
        },
        cell: ({ row }) => <div>{row.getValue('due_date')}</div>,
    },

    {
        id: 'actions',
        enableHiding: false,
        header: () => {
            return (
                <button type="button" className="flex items-center gap-1.5">
                    Actions
                </button>
            )
        },
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-2.5">
                    <Button
                        type="button"
                        variant={'outline-general'}
                        className="py-[7px]"
                    >
                        <PenLine className="!size-3.5 shrink-0" />
                        Edit
                    </Button>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    type="button"
                                    className="size-[30px] bg-danger-light text-black hover:bg-danger/80 hover:text-white"
                                >
                                    <Trash2 className="!size-[18px]" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent
                                side={'top'}
                                className="text-xs/tight"
                            >
                                Delete
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            )
        },
    },
]
