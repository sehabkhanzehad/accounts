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
import { useNavigate } from 'react-router-dom'

export function LendingTable({ lendings }) {
    const navigate = useNavigate()
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Since</TableHead>
                    <TableHead>Last Update</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {lendings?.map((lending, index) => (
                    <TableRow key={lending?.id || `lending-${index}`}>
                        <TableCell>
                            {lending?.relationships?.loanable?.attributes?.firstName || 'Unknown'} {lending?.relationships?.loanable?.attributes?.lastName || ''}
                        </TableCell>
                        <TableCell>{lending?.attributes?.amount || 0}</TableCell>
                        <TableCell>{lending?.attributes?.paidAmount || 0}</TableCell>
                        <TableCell>{((lending?.attributes?.amount || 0) - (lending?.attributes?.paidAmount || 0)).toFixed(2)}</TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${lending?.attributes?.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : lending?.attributes?.status === 'unpaid'
                                    ? 'bg-red-100 text-red-800'
                                    : lending?.attributes?.status === 'partial'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-muted text-muted-foreground'
                                }`}>
                                {lending?.attributes?.status ? (lending.attributes.status.charAt(0).toUpperCase() + lending.attributes.status.slice(1)) : 'Unknown'}
                            </span>
                        </TableCell>
                        <TableCell>{lending?.attributes?.createdAt ? new Date(lending.attributes.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{lending?.attributes?.updatedAt ? new Date(lending.attributes.updatedAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/sections/lendings/${lending?.id}/transactions`)}>
                                            See Transactions
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