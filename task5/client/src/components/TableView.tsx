import {useState, useEffect, useRef} from 'react'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    type ColumnDef,
} from '@tanstack/react-table'
import {useStore} from '../store/useStore'
import {useSongs, PAGE_SIZE} from '../hooks/useSongs'
import type {Song} from '../types'
import ExpandedRow from './ExpandedRow'
import ExportButton from './ExportButton'

const columns: ColumnDef<Song>[] = [
    {
        accessorKey: 'index',
        header: '#',
        size: 60,
    },
    {
        accessorKey: 'title',
        header: 'Title',
    },
    {
        accessorKey: 'artist',
        header: 'Artist',
    },
    {
        accessorKey: 'album',
        header: 'Album',
    },
    {
        accessorKey: 'genre',
        header: 'Genre',
    },
    {
        accessorKey: 'likes',
        header: 'Likes',
        size: 80,
    },
]

interface TableViewProps {
    className?: string
}

export default function TableView({}: TableViewProps) {
    const {lang, seed, likes} = useStore()
    const [page, setPage] = useState(1)
    const [expandedRow, setExpandedRow] = useState<number | null>(null)

    const {data, isLoading, isError} = useSongs({lang, seed, likes, page})

    const prevParams = useRef({lang, seed, likes})

    useEffect(() => {
        const prev = prevParams.current
        if (prev.lang !== lang || prev.seed !== seed || prev.likes !== likes) {
            setPage(1)
            prevParams.current = {lang, seed, likes}
        }
    }, [lang, seed, likes])

    const table = useReactTable({
        data: data ?? [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center mt-20">
                <div className="text-gray-400 animate-pulse">Loading songs...</div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center mt-20">
                <div className="text-red-400">Failed to load songs. Is the server running?</div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 pb-18">
            <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="w-full text-sm">
                    <thead className="bg-gray-900 text-gray-400 uppercase text-xs">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="px-4 py-3 text-left font-medium tracking-wider"
                                    style={{width: header.getSize()}}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                </th>
                            ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                    {table.getRowModel().rows.map((row) => (
                        <>
                            <tr
                                key={row.id}
                                onClick={() => setExpandedRow(expandedRow === row.original.index ? null : row.original.index)}
                                className="bg-gray-950 hover:bg-gray-900 cursor-pointer transition-colors"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-3 text-gray-200">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>

                            {expandedRow === row.original.index && (
                                <tr key={`${row.id}-expanded`}>
                                    <td colSpan={columns.length} className="p-0">
                                        <ExpandedRow song={row.original}/>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-1">
                <div className="text-sm text-gray-500">
                    Page {page} — showing {((page - 1) * PAGE_SIZE) + 1}–{page * PAGE_SIZE}
                </div>

                <ExportButton songs={data ?? []}/>

                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1.5 rounded bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        Prev
                    </button>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        className="px-3 py-1.5 rounded bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    )
}