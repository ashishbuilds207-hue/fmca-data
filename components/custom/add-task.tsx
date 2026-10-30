import { Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

type IAssigneesUsers = {
    id: number
    name: string
    avatar: string
    email: string
}

type IAddAssigneeToTask = {
    id: string
    name: string
    priority: string
    description: string
}

type IAddTaskProps = {
    taskType: string
    assigneesUsers: IAssigneesUsers[]
    onUpdateTasks: ({
        taskType,
        taskDetails,
    }: {
        taskType: string
        taskDetails: IAddAssigneeToTask
    }) => void
}

export default function AddTask({
    assigneesUsers,
    taskType,
    onUpdateTasks,
}: IAddTaskProps) {
    const [open, setOpen] = React.useState(false)

    const [taskDetails, setTaskDetails] = React.useState<IAddAssigneeToTask>({
        id: '',
        name: '',
        priority: '',
        description: '',
    })

    const handleTaskDetailsChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        key: keyof IAddAssigneeToTask,
    ) => {
        setTaskDetails((prevTask) => ({
            ...prevTask,
            [key]: e.target.value,
        }))
    }

    const handleAssigneeChange = (value: string) => {
        setTaskDetails((prevTask) => ({
            ...prevTask,
            id: value,
        }))
    }

    const handleSubmit = () => {
        onUpdateTasks({ taskType, taskDetails })
        setOpen(false)
        toast({
            title: 'Task Added Successfully',
            description: 'You can now start working on it.',
            icon: <Check className="mt-0.5 size-5 text-success" />,
            variant: 'default',
        })
        handleReset()
    }

    const handleReset = () => {
        setTaskDetails({
            id: '',
            name: '',
            priority: '',
            description: '',
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Plus className="size-[18px] text-black hover:text-gray" />
            </DialogTrigger>
            <DialogContent className="w-full max-w-[392px]">
                <Card className="shadow-none">
                    <CardHeader>
                        <div className="space-y-1.5 text-base/5 font-semibold text-black">
                            <h2>Add Task</h2>
                            <p className="text-xs/snug font-medium text-gray-700">
                                New tasks are added to the default category.
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="my-[30px] space-y-5">
                        <div className="space-y-3">
                            <label className="block font-semibold leading-none text-black">
                                Task name
                            </label>
                            <Input
                                placeholder="Add task name"
                                value={taskDetails.name}
                                onChange={(e) =>
                                    handleTaskDetailsChange(e, 'name')
                                }
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block font-semibold leading-none text-black">
                                Task priority
                            </label>
                            <Input
                                placeholder="Add task priority"
                                value={taskDetails.priority}
                                onChange={(e) =>
                                    handleTaskDetailsChange(e, 'priority')
                                }
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="block font-semibold leading-none text-black">
                                Assignee
                            </label>
                            <Select
                                value={taskDetails?.id}
                                onValueChange={handleAssigneeChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Add someone" />
                                </SelectTrigger>
                                <SelectContent>
                                    {!!assigneesUsers?.length ? (
                                        assigneesUsers?.map(
                                            (assigneeUser: IAssigneesUsers) => {
                                                return (
                                                    <SelectItem
                                                        key={assigneeUser.id}
                                                        value={assigneeUser.id?.toString()}
                                                    >
                                                        {assigneeUser.name}
                                                    </SelectItem>
                                                )
                                            },
                                        )
                                    ) : (
                                        <SelectItem value={'none'}>
                                            No assignees found
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="block font-semibold leading-none text-black">
                                Task description
                            </label>
                            <Textarea
                                placeholder="Add task description"
                                value={taskDetails.description}
                                onChange={(e) =>
                                    handleTaskDetailsChange(e, 'description')
                                }
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex items-center justify-end gap-4">
                            <Button
                                variant={'outline-general'}
                                onClick={handleReset}
                            >
                                Reset
                            </Button>
                            <Button variant={'black'} onClick={handleSubmit}>
                                Add
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </DialogContent>
        </Dialog>
    )
}
