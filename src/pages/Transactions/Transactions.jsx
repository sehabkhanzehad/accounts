import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Plus, Receipt } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppPagination from '@/components/app/AppPagination'
import CreateTransactionModal from './components/CreateTransactionModal'
import PageHeading from '@/components/PageHeading'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'

export default function Transactions() {
    const { t } = useTranslation()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/transactions', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage
                }
            })
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

    return (
        <DashboardLayout
            breadcrumbs={[
                {
                    type: 'link',
                    text: t('app.home'),
                    href: '/',
                },
                {
                    type: 'page',
                    text: 'Transactions',
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title="Transactions"
                        description="Manage your financial transactions"
                    />
                    <Button variant="outline" onClick={() => setIsModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Transaction
                    </Button>
                </div>

                <div className="flex-1">
                    {transactions.length === 0 ? (
                        <EmptyComponent
                            icon={<Receipt />}
                            title="No transactions found"
                            description="Get started by creating your first transaction."
                            action={
                                <Button variant="outline" onClick={() => setIsModalOpen(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Transaction
                                </Button>
                            }
                        />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Title</TableHead>
                                        <TableHead>Voucher No</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>{new Date(transaction.attributes.date).toLocaleDateString('en-GB')}</TableCell>
                                            <TableCell>
                                                {transaction.relationships?.section?.attributes?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {transaction.attributes.title}
                                            </TableCell>
                                            <TableCell>{transaction.attributes.voucherNo ?? '-'}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${transaction.attributes.type === 'income'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {transaction.attributes.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">{transaction.attributes.amount}</TableCell>
                                        </TableRow>
                                    ))}
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
            </div>

            <CreateTransactionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </DashboardLayout>
    )
}
