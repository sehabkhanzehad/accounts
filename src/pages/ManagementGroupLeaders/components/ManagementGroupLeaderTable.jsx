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

export function ManagementGroupLeaderTable({ groupLeaders, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Leader Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {groupLeaders?.map((groupLeader) => (
                    <TableRow key={groupLeader.id}>
                        <TableCell>{groupLeader.attributes.groupName}</TableCell>
                        <TableCell>
                            {groupLeader.relationships?.user?.attributes?.firstName} {groupLeader.relationships?.user?.attributes?.lastName}
                        </TableCell>
                        <TableCell>{groupLeader.relationships?.user?.attributes?.email}</TableCell>
                        <TableCell>{groupLeader.relationships?.user?.attributes?.phone}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                groupLeader.attributes.status
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {groupLeader.attributes.status ? 'Active' : 'Inactive'}
                            </span>
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
                                        <DropdownMenuItem onClick={() => onEdit(groupLeader)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDelete(groupLeader)} className="text-destructive">
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}