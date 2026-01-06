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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useI18n } from '@/contexts/I18nContext'
import { EllipsisVertical, Eye } from "lucide-react"

// Generate consistent random color based on name
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

export function UmrahTable({ umrahs, onDelete, onView }) {
    const { t, language } = useI18n();
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t({ en: "Pilgrim", bn: "পিলগ্রিম" })}</TableHead>
                    <TableHead>{t({ en: "NID & DOB", bn: "এনআইডি ও জন্ম তারিখ" })}</TableHead>
                    <TableHead>{t({ en: "Passport", bn: "পাসপোর্ট" })}</TableHead>
                    <TableHead>{t({ en: "Group Leader", bn: "গ্রুপ লিডার" })}</TableHead>
                    <TableHead>{t({ en: "Package", bn: "প্যাকেজ" })}</TableHead>
                    <TableHead>{t({ en: "Address", bn: "ঠিকানা" })}</TableHead>
                    <TableHead>{t({ en: "Status", bn: "স্ট্যাটাস" })}</TableHead>
                    <TableHead className="text-right">{t({ en: "Action", bn: "অ্যাকশন" })}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {umrahs?.map((umrah) => {
                    const user = umrah.relationships?.pilgrim?.relationships?.user?.attributes
                    const groupLeader = umrah.relationships?.groupLeader?.attributes
                    const packageData = umrah.relationships?.package?.attributes
                    const passport = umrah.relationships?.passport?.attributes

                    return (
                        <TableRow key={umrah.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user?.avatar} alt={`${user?.firstName} ${user?.lastName}`} />
                                        <AvatarFallback className={`${getAvatarColor(`${user?.firstName}${user?.lastName}`)} text-white font-semibold`}>
                                            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <div className="font-medium text-sm">
                                            {user?.firstName} {user?.lastName}
                                            {user?.gender && (
                                                <span className="ml-1 uppercase">
                                                    ({user.gender === 'male' ? 'M' : user.gender === 'female' ? 'F' : 'O'})
                                                </span>
                                            )}
                                        </div>
                                        {user?.phone ? (
                                            <div className="text-xs text-muted-foreground">
                                                {user.phone}
                                            </div>
                                        ) : (<div>Phone: N/A</div>)}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {user?.nid ? <div>NID: {user.nid}</div> : <div>NID: N/A</div>}
                                    {user?.dateOfBirth ? (
                                        <div>DOB: {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
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
                                        <div className="font-medium">{passport.passportNumber}</div>
                                        {passport.expiryDate && (
                                            <div className="text-muted-foreground">
                                                Exp: {new Date(passport.expiryDate).toLocaleDateString('en-US', {
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
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                        {groupLeader?.groupName}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                        {packageData?.name}
                                    </div>
                                    {packageData?.price && (
                                        <div className="text-xs font-semibold text-green-600">
                                            ৳{parseFloat(packageData.price).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="text-sm text-muted-foreground">
                                    <div className="font-medium text-sm truncate max-w-[220px]">
                                        {umrah.relationships?.pilgrim?.relationships?.user?.relationships?.presentAddress?.attributes?.district
                                            || umrah.relationships?.pilgrim?.relationships?.user?.relationships?.permanentAddress?.attributes?.district
                                            || 'N/A'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {umrah.relationships?.pilgrim?.relationships?.user?.relationships?.presentAddress?.attributes?.postal_code
                                            || umrah.relationships?.pilgrim?.relationships?.user?.relationships?.permanentAddress?.attributes?.postal_code
                                            || ''}
                                    </div>
                                </div>
                            </TableCell>

                            <TableCell>
                                <div className="space-y-1.5">
                                    <span className={`inline-block px-2 capitalize py-0.5 rounded text-[10px] font-medium ${umrah.attributes.status === 'registered'
                                        ? 'bg-blue-100 text-blue-800'
                                        : umrah.attributes.status === 'completed'
                                            ? 'bg-green-100 text-green-800'
                                            : umrah.attributes.status === 'cancelled'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {umrah.attributes.status}
                                    </span>
                                    <div className="text-[10px] text-muted-foreground">
                                        Created At: {new Date(umrah.attributes.createdAt).toLocaleDateString('en-US', {
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
                                            <DropdownMenuItem onClick={() => onView(umrah)}>
                                                View Details
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDelete(umrah)} className="text-destructive">
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