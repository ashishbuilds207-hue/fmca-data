'use client'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'
import React from 'react'
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

type ITextEditor = {
    className?: string
    value?: string
    onChange?: (value: string) => void
    placeholder?: string
    defaultValue?: any
    readOnly?: boolean
    module?: number
}

const TextEditor = ({
    className,
    value,
    onChange,
    placeholder,
    defaultValue,
    readOnly = false,
    module = 1,
}: ITextEditor) => {
    const modules1 = {
        toolbar: [
            [{ size: ['small', false, 'large', 'huge'] }],
            [{ color: [] }, { background: [] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ align: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['image', 'link'],
        ],
    }
    const modules2 = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
        ],
    }

    const modules: any = {
        '1': modules1,
        '2': modules2,
    }

    return (
        <ReactQuill
            modules={modules[module?.toString()]}
            placeholder={placeholder}
            onChange={onChange}
            className={cn(
                'form-input border-0 border-transparent p-0 shadow-3xl',
                className,
            )}
            id="editor-container"
            bounds={'#editor-container'}
            defaultValue={defaultValue}
            readOnly={readOnly}
            {...(!defaultValue && { value })}
        />
    )
}

export default TextEditor
