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

export function BankTable({ banks, onEdit, onDelete, onViewTransactions }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Account Details</TableHead>
                    <TableHead>Open Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {banks?.map((bank) => (
                    <TableRow key={bank.id}>
                        <TableCell>{bank.attributes.code}</TableCell>
                        <TableCell>
                            <div>
                                <div className="font-semibold text-foreground">{bank.attributes.name}</div>
                                <div className="text-sm text-muted-foreground">Branch: {bank.relationships?.bank?.attributes?.branch}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div>
                                <div className="text-sm">A/C Name: {bank.relationships?.bank?.attributes?.accountHolderName}</div>
                                <div className="text-sm">A/C No: {bank.relationships?.bank?.attributes?.accountNumber}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div>
                                <div className="text-sm">
                                    {bank.relationships?.bank?.attributes?.openingDate
                                        ? new Date(bank.relationships.bank.attributes.openingDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : 'N/A'}
                                </div>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${bank.relationships?.bank?.attributes?.status === true
                                            ? 'bg-green-100 text-green-800'
                                            : bank.relationships?.bank?.attributes?.status === false
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {bank.relationships?.bank?.attributes?.status === true
                                            ? 'Active'
                                            : bank.relationships?.bank?.attributes?.status === false
                                                ? 'Inactive'
                                                : 'Unknown'}
                                    </span>
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
                                        <DropdownMenuItem onClick={() => onViewTransactions(bank)}>
                                            See Transactions
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onEdit(bank)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => onDelete(bank)}
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