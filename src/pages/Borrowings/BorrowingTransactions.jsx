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
import { EllipsisVertical, Eye, X, User } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function BorrowingTransactions() {
    const { t } = useTranslation()
    const { id } = useParams()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(15)
    const [selectedTransaction, setSelectedTransaction] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['borrowing-transactions', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/sections/loans/borrowings/${id}/transactions`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage
                }
            })
            return response.data
        }
    })

    const { data: borrowingData } = useQuery({
        queryKey: ['borrowing-details', id],
        queryFn: async () => {
            const response = await api.get(`/sections/loans/borrowings/${id}`)
            return response.data
        }
    })

    if (isLoading) {
        return (
            <DashboardLayout>
                <TableSkeletons />
            </DashboardLayout>
        )
    }

    const transactions = data?.data || []
    const meta = data?.meta

    const handleViewTransaction = (transaction) => {
        setSelectedTransaction(transaction)
        setIsDialogOpen(true)
    }

    // Calculate running balance (process from oldest to newest)
    const transactionsWithBalance = [...transactions].reverse().reduce((acc, transaction, index) => {
        const amount = Number(transaction?.attributes?.amount) || 0
        const type = transaction?.attributes?.type
        const previousBalance = index > 0 ? acc[index - 1].balance : 0

        let currentBalance = previousBalance
        if (type === 'income') {
            currentBalance += amount
        } else if (type === 'expense') {
            currentBalance -= amount
        }

        acc.push({
            ...transaction,
            balance: currentBalance
        })

        return acc
    }, []).reverse() || [] // Reverse back to original order for display

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
                    text: t('app.sidebar.options.borrowings'),
                    href: '/sections/borrowings',
                },
                {
                    type: 'page',
                    text: 'Transactions',
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <PageHeading
                    title="Borrowing Transactions"
                    description="View and manage borrowing transactions and lender details"
                />

                <div className="flex-1">
                    {/* Borrowing Details Section */}
                    {borrowingData && (
                        <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2 mb-0.5">
                                            <span className="text-xs font-medium text-muted-foreground">Borrower:</span>
                                            <span className="text-sm font-medium text-foreground">
                                                {borrowingData.data.relationships.loanable.attributes.firstName} {borrowingData.data.relationships.loanable.attributes.lastName || ''}
                                            </span>
                                            <div className={`px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800`}>
                                                Unpaid
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {borrowingData.data.relationships.loanable.attributes.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Borrowed Amount</p>
                                        <p className="text-sm font-medium text-foreground">
                                            ৳{Number(borrowingData.data.attributes.amount || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Paid Amount</p>
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            ৳0
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">Amount Due</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            ৳{Number(borrowingData.data.attributes.amount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {transactions.length === 0 ? (
                        <EmptyComponent
                            title="No transactions found"
                            description="This borrowing doesn't have any transactions yet."
                        />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Voucher No</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Balance</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactionsWithBalance?.map((transaction, index) => (
                                        <TableRow key={transaction?.id || `transaction-${index}`}>
                                            <TableCell>{transaction?.attributes?.date ? new Date(transaction.attributes.date).toLocaleDateString('en-GB') : 'N/A'}</TableCell>
                                            <TableCell className="font-medium max-w-xs truncate" title={transaction?.attributes?.title || 'N/A'}>
                                                {transaction?.attributes?.title || 'N/A'}
                                            </TableCell>
                                            <TableCell>{transaction?.attributes?.voucherNo || 'N/A'}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${transaction?.attributes?.type === 'income'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {transaction?.attributes?.type ? (transaction.attributes.type.charAt(0).toUpperCase() + transaction.attributes.type.slice(1)) : 'Unknown'}
                                                </span>
                                            </TableCell>
                                            <TableCell>{Number(transaction?.attributes?.amount) || 0}</TableCell>
                                            <TableCell className={`font-medium ${(transaction?.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {Number(transaction?.balance || 0).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                            <EllipsisVertical size={15} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewTransaction(transaction)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )) || []}
                                </TableBody>
                            </Table>
                        </div>
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

                {/* Transaction Details Dialog */}
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
                            {selectedTransaction && borrowingData && (
                                <>
                                    {/* Transaction Type */}
                                    <div className="flex justify-center">
                                        <Badge variant={selectedTransaction?.attributes?.type === 'income' ? 'default' : 'destructive'}>
                                            {selectedTransaction?.attributes?.type === 'income' ? 'Payment Receipt' : 'Loan Disbursement'}
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
                                                {selectedTransaction?.attributes?.type === 'income' ? 'Payment' : 'Loan'}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Borrower */}
                                    <div className="flex items-center space-x-3">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Borrower</p>
                                            <p className="text-sm font-medium">
                                                {borrowingData.data.relationships.loanable.attributes.firstName} {borrowingData.data.relationships.loanable.attributes.lastName || ''}
                                            </p>
                                        </div>
                                        <div className="ml-auto">
                                            <Badge variant="outline" className="text-xs">
                                                Unpaid
                                            </Badge>
                                        </div>
                                    </div>

                                    <Separator />

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
                                            {selectedTransaction?.attributes?.type === 'income' ? 'Amount Received' : 'Amount Disbursed'}
                                        </p>
                                        <p className={`text-2xl font-bold ${selectedTransaction?.attributes?.type === 'income' ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            ৳{Number(selectedTransaction?.attributes?.amount || 0).toLocaleString()}
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
            </div>
        </DashboardLayout>
    )
}