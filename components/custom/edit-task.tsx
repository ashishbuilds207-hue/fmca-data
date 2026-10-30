import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import React from 'react'
import { toast } from '@/components/ui/use-toast'

type IAddAssigneeToTask = {
    name: string
}

type IAddTaskProps = {
    id: number
    value: string
    updatedTaskName: ({ id, name }: { id: number; name: string }) => void
    onClose: () => void
}

export default function EditTask({
    value,
    id: taskId,
    updatedTaskName,
    onClose,
}: IAddTaskProps) {
    const [open, setOpen] = React.useState(false)

    const [taskDetails, setTaskDetails] = React.useState<IAddAssigneeToTask>({
        name: value || '',
    })

    const handleTaskDetailsChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: keyof IAddAssigneeToTask,
    ) => {
        setTaskDetails((prevTask) => ({
            ...prevTask,
            [key]: e.target.value,
        }))
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        updatedTaskName({ id: taskId, name: taskDetails.name })
        onClose()
        setOpen(false)
        toast({
            title: 'Task Updated Successfully',
            description: 'You can now start working on it.',
            icon: <Check className="mt-0.5 size-5 text-success" />,
            variant: 'default',
        })
    }

    const handleReset = () => {
        setTaskDetails({
            name: '',
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="block w-full rounded-lg px-2.5 py-1.5 text-left text-xs/tight font-medium text-black outline-none hover:bg-light-theme"
                >
                    Edit
                </button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-[392px]">
                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="space-y-1.5 text-base/5 font-semibold text-black">
                        <h2>Edit Task</h2>
                        <p className="text-xs/snug font-medium text-gray-700">
                            Make changes to the task details below.
                        </p>
                    </div>
                    <div className="space-y-2.5">
                        <label className="block font-semibold leading-tight text-black">
                            Name
                        </label>
                        <Input
                            value={taskDetails.name}
                            onChange={(e) => handleTaskDetailsChange(e, 'name')}
                            type="text"
                            placeholder="Enter Name"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <Button
                            variant={'outline-general'}
                            size={'large'}
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant={'black'} size={'large'}>
                            Add
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
