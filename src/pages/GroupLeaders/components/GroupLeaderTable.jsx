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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EllipsisVertical } from "lucide-react"

export function GroupLeaderTable({ groupLeaders, onEdit, onDelete, onViewTransactions }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Leader Info</TableHead>
                    <TableHead>Group Name</TableHead>
                    <TableHead className="text-center">Track Payment</TableHead>
                    <TableHead className={'text-right'}>{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</TableHead>
                    <TableHead className={'text-right'}>Total Collection</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {groupLeaders?.map((groupLeader) => (
                    <TableRow key={groupLeader.id}>
                        <TableCell>{groupLeader.attributes.code}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.avatar} />
                                    <AvatarFallback>
                                        {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.firstName?.[0] || ''}
                                        {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.lastName?.[0] || ''}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p>
                                        {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.firstName || ''}{' '}
                                        {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.lastName || ''}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {groupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.phone || '-'}
                                    </p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>{groupLeader.attributes.name}</TableCell>
                        <TableCell className="text-center">
                            <Badge variant={groupLeader.relationships?.groupLeader?.attributes?.trackPayment ? "default" : "secondary"}>
                                {groupLeader.relationships?.groupLeader?.attributes?.trackPayment ? 'Yes' : 'No'}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <div>
                                Collection: <span className="text-green-600">৳{groupLeader.attributes?.totalIncome ? parseFloat(groupLeader.attributes.totalIncome).toFixed(2) : '0.00'}</span><br />
                                Refund: <span className="text-red-600">৳{groupLeader.attributes?.totalExpense ? parseFloat(groupLeader.attributes.totalExpense).toFixed(2) : '0.00'}</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <span className="text-green-600">৳{groupLeader.relationships?.lastTransaction?.attributes?.afterBalance
                                ? parseFloat(groupLeader.relationships.lastTransaction.attributes.afterBalance).toFixed(2)
                                : '0.00'}</span>
                        </TableCell>
                        <TableCell>
                            {groupLeader.relationships?.lastTransaction?.attributes?.createdAt
                                ? new Date(groupLeader.relationships.lastTransaction.attributes.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })
                                : groupLeader.relationships?.groupLeader?.attributes?.createdAt
                                    ? new Date(groupLeader.relationships.groupLeader.attributes.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : 'N/A'}
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