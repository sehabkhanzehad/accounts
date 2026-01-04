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

export function UmrahTable({ umrahs, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Pilgrim Details</TableHead>
                    <TableHead>NID & DOB</TableHead>
                    <TableHead>Group Leader</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {umrahs?.map((umrah) => {
                    const user = umrah.relationships?.pilgrim?.relationships?.user?.attributes
                    const groupLeader = umrah.relationships?.groupLeader?.attributes
                    const packageData = umrah.relationships?.package?.attributes
                    
                    return (
                        <TableRow key={umrah.id}>
                            <TableCell>
                                <div className="space-y-1">
                                    <div className="font-medium text-sm">
                                        {user?.firstName} {user?.lastName}
                                        {user?.gender && (
                                            <span className="ml-1 uppercase">
                                                ({user.gender === 'male' ? 'M' : user.gender === 'female' ? 'F' : 'O'})
                                            </span>
                                        )}
                                    </div>
                                    {user?.phone && (
                                        <div className="text-xs text-muted-foreground">
                                            {user.phone}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {user?.nid && <div>NID: {user.nid}</div>}
                                    {user?.dateOfBirth && (
                                        <div>DOB: {new Date(user.dateOfBirth).toLocaleDateString('en-US', { 
                                            month: 'short', 
                                            day: 'numeric', 
                                            year: 'numeric' 
                                        })}</div>
                                    )}
                                </div>
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
                                <div className="space-y-1.5">
                                    <span className={`inline-block px-2 capitalize py-0.5 rounded text-[10px] font-medium ${
                                        umrah.attributes.status === 'registered'
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
                                            <DropdownMenuItem onClick={() => onEdit(umrah)}>
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
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