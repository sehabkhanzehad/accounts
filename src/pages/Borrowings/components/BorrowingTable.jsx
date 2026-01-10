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
import { EllipsisVertical } from "lucide-react"
import { useNavigate } from 'react-router-dom'

export function BorrowingTable({ borrowings }) {
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
                {borrowings?.map((borrowing, index) => (
                    <TableRow key={borrowing?.id || `borrowing-${index}`}>
                        <TableCell>
                            {borrowing?.relationships?.loanable?.attributes?.firstName || 'Unknown'} {borrowing?.relationships?.loanable?.attributes?.lastName || ''}
                        </TableCell>
                        <TableCell>{borrowing?.attributes?.amount || 0}</TableCell>
                        <TableCell>0</TableCell>
                        <TableCell>{borrowing?.attributes?.amount || 0}</TableCell>
                        <TableCell>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800`}>
                                Unpaid
                            </span>
                        </TableCell>
                        <TableCell>{borrowing?.attributes?.createdAt ? new Date(borrowing.attributes.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{borrowing?.attributes?.updatedAt ? new Date(borrowing.attributes.updatedAt).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/sections/borrowings/${borrowing?.id}/transactions`)}>
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