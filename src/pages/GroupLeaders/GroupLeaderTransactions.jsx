import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import PageHeading from '@/components/PageHeading'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppPagination from '@/components/app/AppPagination'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EllipsisVertical, X, User, Receipt } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function GroupLeaderTransactions() {
    const { t } = useTranslation()
    const { id } = useParams()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [selectedTransaction, setSelectedTransaction] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data: groupLeaderData } = useQuery({
        queryKey: ['group-leader', id],
        queryFn: async () => {
            const response = await api.get(`/sections/group-leaders/${id}`)
            return response.data.data
        }
    })

    const { data, isLoading } = useQuery({
        queryKey: ['group-leader-transactions', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/sections/group-leaders/${id}/transactions`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage
                }
            })
            return response.data
        }
    })

    const transactions = data?.data
    const meta = data?.meta

    const groupLeader = groupLeaderData
    const user = groupLeader?.relationships?.groupLeader?.relationships?.user?.attributes
    const groupLeaderDataInfo = groupLeader?.relationships?.groupLeader?.attributes
    const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : ''
    const displayName = userName || groupLeader?.attributes?.name || '-'
    const email = user?.email || '-'
    const avatarUrl = user?.avatar

    const handleViewDetails = (transaction) => {
        setSelectedTransaction(transaction)
        setIsDialogOpen(true)
    }

    return (
        <DashboardLayout
            breadcrumbs={[
                {
                    type: 'link',
                    text: t('app.home'),
                    href: '/',
                },
                {
                    type: 'link',
                    text: t('app.sidebar.options.groupLeaders'),
                    href: '/sections/group-leaders',
                },
                {
                    type: 'page',
                    text: 'Transactions',
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <PageHeading
                    title="Group Leader Transactions"
                    description="View all transactions for this group leader section"
                />

                <div className="flex-1">
                    {/* Group Leader Details Section */}
                    {groupLeader && (
                        <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={avatarUrl} alt={displayName} />
                                        <AvatarFallback>
                                            <User className="h-6 w-6" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-0.5">
                                            <span className="text-sm font-medium text-foreground">
                                                {displayName}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                Group Leader
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {email}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Group: {groupLeader.attributes.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading ? (
                        <TableSkeletons />
                    ) : transactions?.length === 0 ? (
                        <EmptyComponent
                            title="No transactions found"
                            description="This group leader section doesn't have any transactions yet."
                            icon={<Receipt />}
                        />
                    ) : (
                        <>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Voucher No</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Before Balance</TableHead>
                                            <TableHead>Amount</TableHead>
                                            <TableHead>After Balance</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions?.map((transaction, index) => (
                                            <TableRow key={transaction?.id || `transaction-${index}`}>
                                                <TableCell>{transaction?.attributes?.date ? new Date(transaction.attributes.date).toLocaleDateString('en-GB') : 'N/A'}</TableCell>
                                                <TableCell className="font-medium max-w-xs truncate" title={transaction?.attributes?.title || 'N/A'}>
                                                    {transaction?.attributes?.title || 'N/A'}
                                                </TableCell>
                                                <TableCell>{transaction?.attributes?.voucherNo || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                        transaction?.attributes?.type === 'income'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {transaction?.attributes?.type ? (transaction.attributes.type.charAt(0).toUpperCase() + transaction.attributes.type.slice(1)) : 'Unknown'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{Number(transaction?.attributes?.beforeBalance || 0).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span className={transaction?.attributes?.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                                                        {transaction?.attributes?.type === 'income' ? '+' : '-'}
                                                        {Number(transaction?.attributes?.amount || 0).toFixed(2)}
                                                    </span>
                                                </TableCell>
                                                <TableCell>{Number(transaction?.attributes?.afterBalance || 0).toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                                <EllipsisVertical size={15} />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleViewDetails(transaction)}>
                                                                View Details
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            )}
                        </>
                    )}
                </div>

                {meta && (
                    <AppPagination
                        meta={meta}
                        rowsPerPage={rowsPerPage}
                        setRowsPerPage={setRowsPerPage}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                    />
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg font-semibold">Transaction Details</DialogTitle>
                        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                    </DialogHeader>

                    <div className="space-y-4">
                        {selectedTransaction && (
                            <>
                                {/* Transaction Type */}
                                <div className="flex justify-center">
                                    <Badge variant={selectedTransaction?.attributes?.type === 'income' ? 'default' : 'destructive'}>
                                        {selectedTransaction?.attributes?.type === 'income' ? 'Deposit' : 'Expense'}
                                    </Badge>
                                </div>

                                {/* Transaction Info */}
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Date</p>
                                        <p className="font-medium">
                                            {selectedTransaction?.attributes?.date
                                                ? new Date(selectedTransaction.attributes.date).toLocaleDateString('en-GB')
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Voucher No</p>
                                        <p className="font-medium">
                                            {selectedTransaction?.attributes?.voucherNo || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Type</p>
                                        <p className="font-medium">
                                            {selectedTransaction?.attributes?.type === 'income' ? 'Deposit' : 'Expense'}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                {/* Group Leader Info */}
                                {groupLeader && (
                                    <>
                                        <div className="flex items-center space-x-3">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm text-muted-foreground">Group Leader</p>
                                                <p className="text-sm font-medium">
                                                    {displayName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Group: {groupLeader.attributes.name}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                {/* Transaction Details */}
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Transaction</h4>
                                    <p className="text-sm font-medium">
                                        {selectedTransaction?.attributes?.title || 'N/A'}
                                    </p>
                                    {selectedTransaction?.attributes?.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedTransaction.attributes.description}
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                {/* Amount */}
                                <div className="text-center py-4">
                                    <p className="text-sm text-muted-foreground mb-1">
                                        Amount
                                    </p>
                                    <p className={`text-2xl font-bold ${selectedTransaction?.attributes?.type === 'income' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        ৳{Number(selectedTransaction?.attributes?.amount || 0).toFixed(2)}
                                    </p>
                                </div>

                                <Separator />

                                {/* Footer */}
                                <div className="text-center text-xs text-muted-foreground">
                                    <p>Generated on {new Date().toLocaleDateString('en-GB')}</p>
                                    <p className="mt-1">M/S Raj Travels</p>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    )
}