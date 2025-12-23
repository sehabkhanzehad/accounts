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

export function EmployeeTable({ employees, onEdit, onDelete }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Email</TableHead>
                    <TableHead className="text-center">Phone</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {employees?.map((employee) => (
                    <TableRow key={employee.id}>
                        <TableCell>{employee.attributes.code}</TableCell>
                        <TableCell>
                            {(() => {
                                const user = employee.relationships?.employee?.relationships?.user?.attributes
                                const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
                                return userName || employee.attributes.name || '-'
                            })()}
                        </TableCell>
                        <TableCell>{employee.attributes.description}</TableCell>
                        <TableCell className="text-center">{employee.relationships?.employee?.relationships?.user?.attributes?.email || '-'}</TableCell>
                        <TableCell className="text-center">{employee.relationships?.employee?.relationships?.user?.attributes?.phone || '-'}</TableCell>
                        <TableCell className="text-center">{employee.relationships?.employee?.attributes?.position || '-'}</TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                            <EllipsisVertical size={15} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEdit(employee)}>
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={() => onDelete(employee)}
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