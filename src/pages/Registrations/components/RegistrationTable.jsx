import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisVertical } from "lucide-react"
import { useI18n } from "@/contexts/I18nContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const getAvatarColor = (name) => {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
    ]

    const str = name || 'default'
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

export function RegistrationTable({ registrations, onEdit, onDelete, onView, onReplace }) {
    const { t } = useI18n();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-37.5">{t({ en: "Serial & Tracking", bn: "সিরিয়াল ও ট্র্যাকিং" })}</TableHead>
                    <TableHead className="w-50">{t({ en: "Pilgrim", bn: "পিলগ্রিম" })}</TableHead>
                    <TableHead className="w-37.5">{t({ en: "NID & DOB", bn: "এনআইডি ও জন্ম তারিখ" })}</TableHead>
                    <TableHead className="w-37.5">{t({ en: "Passport", bn: "পাসপোর্ট" })}</TableHead>
                    <TableHead className="w-37.5">{t({ en: "Group Leader", bn: "গ্রুপ লিডার" })}</TableHead>
                    <TableHead className="w-50">{t({ en: "Address", bn: "ঠিকানা" })}</TableHead>
                    <TableHead className="w-25">{t({ en: "Status", bn: "স্ট্যাটাস" })}</TableHead>
                    <TableHead className="w-12.5">{t({ en: "Action", bn: "অ্যাকশন" })}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                 {registrations?.map((registration) => {
                    const pilgrim = registration.relationships?.pilgrim;
                    const user = pilgrim?.relationships?.user?.attributes;
                    const pilgrimName = user ? `${user.firstName} ${user.lastName ?? ""}` : 'N/A';
                    const avatarColor = getAvatarColor(pilgrimName);
                    const passport = registration.relationships?.passport;

                    const mainReg = registration?.relationships?.registration;

                    const hasReplace = mainReg?.attributes?.hasReplace;


                    return (
                        <TableRow key={registration.id}>
                            <TableCell>
                                <div className="text-sm">
                                    {registration.attributes.serialNo || registration.attributes.trackingNumber ? (
                                        <>
                                            {registration.attributes.serialNo && (
                                                <div>NG-{registration.attributes.serialNo}</div>
                                            )}
                                            {registration.attributes.trackingNo && (
                                                <div>{registration.attributes.trackingNo}</div>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-muted-foreground font-medium">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.avatar} alt={pilgrimName} />
                                        <AvatarFallback className={`${avatarColor} text-white text-xs`}>
                                            {pilgrimName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{pilgrimName}{user?.gender && (
                                                <span className="ml-1 uppercase">
                                                    ({user.gender === 'male' ? 'M' : user.gender === 'female' ? 'F' : 'O'})
                                                </span>
                                            )}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {user?.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {user?.nid ? <div>NID: {user?.nid}</div> : <div>NID: N/A</div>}
                                    {user?.dateOfBirth ? (
                                        <div>DOB: {new Date(user?.dateOfBirth).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}</div>
                                    ) : (<div>DOB: N/A</div>)}
                                </div>
                            </TableCell>
                            <TableCell>
                                {passport ? (
                                    <div className="text-xs space-y-1">
                                        <div className="font-medium">{passport?.attributes?.passportNumber}</div>
                                        {passport?.attributes?.expiryDate && (
                                            <div className="text-muted-foreground">
                                                Exp: {new Date(passport?.attributes?.expiryDate).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground">N/A</div>
                                )}
                            </TableCell>
                            <TableCell>{registration.relationships?.groupLeader?.attributes?.groupName || 'N/A'}</TableCell>
                            <TableCell>
                                <div className="text-sm text-muted-foreground">
                                    <div className="font-medium text-sm truncate max-w-55">
                                        {pilgrim?.relationships?.user?.relationships?.presentAddress?.attributes?.district || 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {pilgrim?.relationships?.user?.relationships?.presentAddress?.attributes?.postal_code || ''}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1.5">
                                    <div className="flex gap-1 items-center">
                                        <span className={`inline-block px-2 capitalize py-0.5 rounded text-[10px] font-medium ${ mainReg?.attributes.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : mainReg?.attributes.status === 'completed'
                                                    ? 'bg-blue-100 text-blue-800'
                                                        : mainReg?.attributes.status === 'transferred'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : mainReg?.attributes.status === 'cancelled'
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {mainReg?.attributes.status}
                                        </span>
                                        {hasReplace && (
                                            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-orange-100 text-orange-800">
                                                Replaced
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">
                                        Reg At: {new Date(mainReg?.attributes.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                <EllipsisVertical size={15} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onView(registration?.id)}>
                                              View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onEdit(mainReg)}>
                                              Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onReplace(mainReg)}>
                                              Replace
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onDelete(mainReg)} className="text-destructive">
                                            Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}