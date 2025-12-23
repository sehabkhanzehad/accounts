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

export function GroupLeaderTable({ groupLeaders, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Group Name</TableHead>
                    <TableHead>Pilgrim Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Gender</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {groupLeaders?.map((groupLeader) => (
                    <TableRow key={groupLeader.id}>
                        <TableCell>{groupLeader.attributes.code}</TableCell>
                        <TableCell>{groupLeader.attributes.name}</TableCell>
                        <TableCell>{groupLeader.relationships?.groupLeader?.attributes?.groupName}</TableCell>
                        <TableCell>
                            {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.firstName || ''}{' '}
                            {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.lastName || ''}
                        </TableCell>
                        <TableCell>{groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.phone || '-'}</TableCell>
                        <TableCell className="text-center capitalize">
                            {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.gender || '-'}
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
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => onDelete(groupLeader)}
                                        >
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