import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const Chatmenu = ({
    contactList,
    setSelectedUser,
    selectedUser,
    loginUser,
}: {
    contactList: any[]
    setSelectedUser: (val: any) => void
    selectedUser: any
    loginUser: any
}) => {
    return (
        <Card className="h-[calc(100vh_-_172px)] w-[314px] shrink-0 overflow-y-auto shadow-none">
            <CardHeader className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gray-300 bg-white px-5 py-3">
                <h3 className="line-clamp-1 font-semibold leading-tight text-black">
                    Chats
                </h3>
                <button
                    type="button"
                    className="hidden text-xs/tight font-medium transition hover:text-black md:block"
                >
                    See All
                </button>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <div className="flex items-center gap-2.5 overflow-x-auto bg-gray-200 p-4 shadow-sm">
                    {contactList
                        ?.filter((contact: any) => contact.active)
                        ?.map((contact) => (
                            <div
                                key={contact?.userId}
                                className="relative size-10 shrink-0"
                            >
                                <Image
                                    src={
                                        contact?.path ||
                                        '/images/blog-avatar.svg'
                                    }
                                    alt="chat-avatar"
                                    height={40}
                                    width={40}
                                    className="size-full rounded-full"
                                ></Image>
                                <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-success ring-[3px] ring-white"></span>
                            </div>
                        ))}
                </div>
                <div className="max-h-96 divide-y divide-gray-300 overflow-y-auto">
                    {contactList
                        ?.filter((contact: any) => contact?.type !== 'group')
                        ?.map((contact: any) => (
                            <div
                                key={contact?.userId}
                                className={cn(
                                    'group relative transition-all hover:bg-primary/5',
                                    {
                                        'bg-primary/5':
                                            selectedUser?.userId ===
                                            contact?.userId,
                                    },
                                )}
                            >
                                <button
                                    type="button"
                                    className="absolute inset-0 z-[1] size-full"
                                    onClick={() => setSelectedUser(contact)}
                                />
                                <div className="flex items-center gap-2.5 border-l-2 p-4 text-gray-700 transition group-hover:border-l-primary">
                                    <div className="relative size-10 shrink-0">
                                        <Image
                                            src={contact?.path || ''}
                                            alt="chat-avatar"
                                            height={40}
                                            width={40}
                                            className="size-full rounded-full"
                                        ></Image>
                                        {!!contact?.active && (
                                            <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-success ring-[3px] ring-white"></span>
                                        )}
                                    </div>
                                    <div className="grow space-y-1.5">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <h4 className="line-clamp-1 font-semibold leading-tight text-black">
                                                {contact?.name}
                                            </h4>
                                            {!!contact?.messages?.length && (
                                                <span className="shrink-0 text-xs/tight font-semibold">
                                                    {
                                                        contact?.messages[
                                                            contact?.messages
                                                                ?.length - 1
                                                        ]?.time
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        {!!contact?.messages?.length && (
                                            <div className="flex items-center justify-between gap-1.5">
                                                <p className="line-clamp-1 text-xs/tight font-medium">
                                                    {
                                                        contact?.messages[
                                                            contact?.messages
                                                                ?.length - 1
                                                        ]?.text
                                                    }
                                                </p>
                                                {!!contact?.messages?.filter(
                                                    (message: any) =>
                                                        !message.status &&
                                                        message?.fromUserId !==
                                                            loginUser?.userId,
                                                )?.length && (
                                                    <Badge
                                                        variant={'primary'}
                                                        size={'number'}
                                                    >
                                                        {
                                                            contact?.messages?.filter(
                                                                (
                                                                    message: any,
                                                                ) =>
                                                                    !message.status &&
                                                                    message?.fromUserId !==
                                                                        loginUser?.userId,
                                                            )?.length
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
                <div className="flex items-center justify-between gap-1.5 bg-gray-200 px-5 py-3">
                    <h3 className="line-clamp-1 font-semibold leading-tight text-black">
                        Groups
                    </h3>
                    <button
                        type="button"
                        className="text-xs/tight font-medium transition hover:text-black"
                    >
                        See All
                    </button>
                </div>
                <div className="max-h-[210px] divide-y divide-gray-300 overflow-y-auto border-b border-gray-300">
                    {contactList
                        ?.filter((contact: any) => contact?.type === 'group')
                        ?.map((contact: any) => (
                            <div
                                key={contact?.userId}
                                className={cn(
                                    'group relative transition-all hover:bg-primary/5',
                                    {
                                        'bg-primary/5':
                                            selectedUser?.userId ===
                                            contact?.userId,
                                    },
                                )}
                            >
                                <button
                                    type="button"
                                    className="absolute inset-0 z-[1] size-full"
                                    onClick={() => setSelectedUser(contact)}
                                />
                                <div className="flex items-center gap-2.5 border-l-2 p-4 text-gray-700 transition group-hover:border-l-primary">
                                    <div className="relative size-10 shrink-0">
                                        <Image
                                            src={contact?.path || ''}
                                            alt="chat-avatar"
                                            height={40}
                                            width={40}
                                            className="size-full rounded-full"
                                        ></Image>
                                        {!!contact?.active && (
                                            <span className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-success ring-[3px] ring-white"></span>
                                        )}
                                    </div>
                                    <div className="grow space-y-1.5">
                                        <div className="flex items-center justify-between gap-1.5">
                                            <h4 className="line-clamp-1 font-semibold leading-tight text-black">
                                                {contact?.name}
                                            </h4>
                                            {!!contact?.messages?.length && (
                                                <span className="shrink-0 text-xs/tight font-semibold">
                                                    {
                                                        contact?.messages[
                                                            contact?.messages
                                                                ?.length - 1
                                                        ]?.time
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        {!!contact?.messages?.length && (
                                            <div className="flex items-center justify-between gap-1.5">
                                                <p className="line-clamp-1 text-xs/tight font-medium">
                                                    {
                                                        contact?.messages[
                                                            contact?.messages
                                                                ?.length - 1
                                                        ]?.text
                                                    }
                                                </p>
                                                {!!contact?.messages?.filter(
                                                    (message: any) =>
                                                        !message.status &&
                                                        message?.fromUserId !==
                                                            loginUser?.userId,
                                                )?.length && (
                                                    <Badge
                                                        variant={'primary'}
                                                        size={'number'}
                                                    >
                                                        {
                                                            contact?.messages?.filter(
                                                                (
                                                                    message: any,
                                                                ) =>
                                                                    !message.status &&
                                                                    message?.fromUserId !==
                                                                        loginUser?.userId,
                                                            )?.length
                                                        }
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </CardContent>
        </Card>
    )
}
export default Chatmenu
