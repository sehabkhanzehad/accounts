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

export function BillTable({ bills, onEdit, onDelete, onSeeTransactions }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Bill Number</TableHead>
                    <TableHead className="text-center">Biller Name</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bills?.map((bill) => (
                    <TableRow key={bill.id}>
                        <TableCell>{bill.attributes.code}</TableCell>
                        <TableCell>{bill.attributes.name}</TableCell>
                        <TableCell className="text-center">{bill.relationships?.bill?.attributes?.number ?? 'N/A'}</TableCell>
                        <TableCell className="text-center">{bill.relationships?.bill?.attributes?.billerName ?? 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(bill)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onSeeTransactions(bill)}>
                                            See Transactions
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => onDelete(bill)}
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