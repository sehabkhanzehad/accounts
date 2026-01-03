import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import api from '@/lib/api'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppPagination from '@/components/app/AppPagination'

export function TransactionModal({ open, onOpenChange, bank }) {
    const { t } = useTranslation()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const { data, isLoading } = useQuery({
        queryKey: ['bank-transactions', bank?.id, currentPage, rowsPerPage],
        queryFn: async () => {
            if (!bank?.id) return null
            const response = await api.get(`/sections/banks/${bank.id}/transactions`, {
                params: { page: currentPage, per_page: rowsPerPage }
            })
            return response.data
        },
        enabled: open && !!bank?.id
    })

    const transactions = data?.data
    const meta = data?.meta

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('app.transactions')} - {bank?.attributes?.name}</DialogTitle>
                    <DialogDescription>
                        {t('app.viewTransactionsFor', { bank: bank?.attributes?.name })}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : transactions?.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('app.date')}</TableHead>
                                        <TableHead>{t('app.title')}</TableHead>
                                        <TableHead>{t('app.type')}</TableHead>
                                        <TableHead>{t('app.amount')}</TableHead>
                                        <TableHead>{t('app.description')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                {new Date(transaction.attributes.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{transaction.attributes.title}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    transaction.attributes.type === 'income'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {transaction.attributes.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>{transaction.attributes.amount}</TableCell>
                                            <TableCell>{transaction.attributes.description}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <AppPagination
                                meta={meta}
                                rowsPerPage={rowsPerPage}
                                setRowsPerPage={setRowsPerPage}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                            />
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <p>{t('app.noTransactions')}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}