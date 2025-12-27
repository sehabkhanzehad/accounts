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

export function GroupLeaderTable({ groupLeaders, onEdit, onDelete, onViewTransactions }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>GL. Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-center">Pilgrim Required</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {groupLeaders?.map((groupLeader) => (
                    <TableRow key={groupLeader.id}>
                        <TableCell>{groupLeader.attributes.code}</TableCell>
                        <TableCell>{groupLeader.attributes.name}</TableCell>
                        <TableCell>
                            {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.firstName || ''}{' '}
                            {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.lastName || ''}
                        </TableCell>
                        <TableCell>{groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.phone || '-'}</TableCell>
                        <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                groupLeader.relationships?.groupLeader?.attributes?.pilgrimRequired
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {groupLeader.relationships?.groupLeader?.attributes?.pilgrimRequired ? 'Required' : 'Optional'}
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
                                        <DropdownMenuItem onClick={() => onViewTransactions(groupLeader)}>
                                            See Transactions
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
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