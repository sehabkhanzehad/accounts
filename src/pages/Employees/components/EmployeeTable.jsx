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
import { EllipsisVertical, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function EmployeeTable({ employees, onEdit, onDelete, onViewTransactions }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-center">Phone</TableHead>
                    <TableHead className="text-center">Position</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {employees?.map((employee) => {
                    const user = employee.relationships?.employee?.relationships?.user?.attributes
                    const employeeData = employee.relationships?.employee?.attributes
                    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
                    const displayName = userName || employee.attributes.name || '-'
                    const email = user?.email || '-'
                    const avatarUrl = user?.avatar

                    return (
                        <TableRow key={employee.id}>
                            <TableCell>{employee.attributes.code}</TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={avatarUrl} alt={displayName} />
                                        <AvatarFallback>
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{displayName}</div>
                                        <div className="text-sm text-muted-foreground">{email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{user?.phone || employeeData?.phone || '-'}</TableCell>
                            <TableCell className="text-center">{employeeData?.position || '-'}</TableCell>
                            <TableCell>
                                <div className="flex items-center justify-end">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                <EllipsisVertical size={15} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => onViewTransactions(employee)}>
                                                See Transactions
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
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
                    )
                })}
            </TableBody>
        </Table>
    )
}