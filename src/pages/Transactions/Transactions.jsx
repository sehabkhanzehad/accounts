import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Receipt, Edit, Eye, Printer, EllipsisVertical, Search, Filter, Calendar, CalendarDays, Check } from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppPagination from '@/components/app/AppPagination'
import CreateTransactionModal from './components/CreateTransactionModal'
import EditTransactionModal from './components/EditTransactionModal'
import PageHeading from '@/components/PageHeading'
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
} from "@/components/ui/dropdown-menu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function Transactions() {
    const { t } = useTranslation()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [specificDate, setSpecificDate] = useState('')

    // Filter states
    const [appliedFilter, setAppliedFilter] = useState({ date: null, from: null, to: null })
    const [draftFilter, setDraftFilter] = useState({ date: null, from: null, to: null })
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

    // Initialize draft filter when drawer opens
    const handleFilterDrawerOpen = (open) => {
        setIsFilterDrawerOpen(open)
        if (open) {
            setDraftFilter({ ...appliedFilter })
        }
    }

    // Handlers that update draft state only
    const handleSpecificDateChange = (value) => {
        setDraftFilter(prev => ({
            ...prev,
            date: value,
            from: value ? null : prev.from,
            to: value ? null : prev.to
        }))
    }

    const handleStartDateChange = (value) => {
        setDraftFilter(prev => ({
            ...prev,
            from: value,
            date: value ? null : prev.date
        }))
    }

    const handleEndDateChange = (value) => {
        setDraftFilter(prev => ({
            ...prev,
            to: value,
            date: value ? null : prev.date
        }))
    }

    // Apply filter
    const handleApplyFilter = () => {
        let payload = null;

        // Priority: specific date first, then range
        if (draftFilter.date) {
            payload = { type: "single", date: draftFilter.date };
        } else if (draftFilter.from && draftFilter.to && draftFilter.from <= draftFilter.to) {
            payload = { type: "range", from: draftFilter.from, to: draftFilter.to };
        }

        if (payload) {
            setAppliedFilter(draftFilter)
            setSpecificDate(draftFilter.date || '')
            setStartDate(draftFilter.from || '')
            setEndDate(draftFilter.to || '')
            setCurrentPage(1)
            console.log('Filter payload:', payload);
            setIsFilterDrawerOpen(false)
        }
    }

    // Clear draft filter
    const handleClearFilter = () => {
        setDraftFilter({ date: null, from: null, to: null })
        setAppliedFilter({ date: null, from: null, to: null })
        setSpecificDate('')
        setStartDate('')
        setEndDate('')
        setCurrentPage(1)
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading } = useQuery({
        queryKey: ['transactions', currentPage, rowsPerPage, debouncedSearch, appliedFilter.date, appliedFilter.from, appliedFilter.to],
        queryFn: async () => {
            const params = {
                page: currentPage,
                per_page: rowsPerPage,
            }
            if (debouncedSearch) params.search = debouncedSearch
            if (appliedFilter.date) params.date = appliedFilter.date
            if (appliedFilter.from) params.start_date = appliedFilter.from
            if (appliedFilter.to) params.end_date = appliedFilter.to

            const response = await api.get('/transactions', { params })
            return response.data
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/transactions/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] })
            toast.success('Transaction updated successfully')
            setIsEditModalOpen(false)
            setEditingTransaction(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update transaction')
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
            <div className="flex flex-col h-full gap-6">
                <div className="flex items-center justify-between">
                    <PageHeading
                        title="Transactions"
                        description="Manage your financial transactions"
                    />
                    <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Transaction
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by voucher number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 h-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Sheet open={isFilterDrawerOpen} onOpenChange={handleFilterDrawerOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="sm" className={`gap-2 ${(appliedFilter.date || (appliedFilter.from && appliedFilter.to)) ? 'border-primary bg-primary/5' : ''}`}>
                                    <Filter className="h-4 w-4" />
                                    Filter
                                    {(appliedFilter.date || (appliedFilter.from && appliedFilter.to)) && (
                                        <Check className="h-3 w-3 text-primary" />
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[400px] sm:w-[450px] flex flex-col p-0">
                                <SheetHeader className="px-5 py-4 border-b border-border/50 flex-shrink-0">
                                    <SheetTitle className="text-lg">Filter Transactions</SheetTitle>
                                </SheetHeader>

                                <div className="flex-1 px-5 py-5 space-y-6">
                                    {/* Section 1: Specific Date */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-sm font-medium text-foreground">Specific date</Label>
                                        </div>
                                        <div className="space-y-2">
                                            <Input
                                                id="specific-date"
                                                type="date"
                                                value={draftFilter.date || ''}
                                                onChange={(e) => handleSpecificDateChange(e.target.value)}
                                                className="h-10"
                                            />
                                            <p className="text-xs text-muted-foreground">Filter transactions for a single date</p>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="border-t border-border/50" />

                                    {/* Section 2: Date Range */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                            <Label className="text-sm font-medium text-foreground">Date range</Label>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label htmlFor="start-date" className="text-sm font-medium">From</Label>
                                                    <Input
                                                        id="start-date"
                                                        type="date"
                                                        value={draftFilter.from || ''}
                                                        onChange={(e) => handleStartDateChange(e.target.value)}
                                                        className="h-10 mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="end-date" className="text-sm font-medium">To</Label>
                                                    <Input
                                                        id="end-date"
                                                        type="date"
                                                        value={draftFilter.to || ''}
                                                        onChange={(e) => handleEndDateChange(e.target.value)}
                                                        className="h-10 mt-1"
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">Filter transactions within a date range</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sticky Footer */}
                                <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm px-5 py-4 flex items-center justify-between flex-shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearFilter}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        Clear all
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleApplyFilter}
                                        disabled={!draftFilter.date && !(draftFilter.from && draftFilter.to && draftFilter.from <= draftFilter.to)}
                                        className="min-w-[100px]"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
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
                                    <TableRow className="h-10">
                                        <TableHead className="h-10 px-4">Date</TableHead>
                                        <TableHead className="h-10 px-4">Section</TableHead>
                                        <TableHead className="h-10 px-4">Title</TableHead>
                                        <TableHead className="h-10 px-4">Voucher No</TableHead>
                                        <TableHead className="h-10 px-4">Type</TableHead>
                                        <TableHead className="h-10 px-4 text-right">Amount</TableHead>
                                        <TableHead className="h-10 px-4 text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow key={transaction.id} className="h-12">
                                            <TableCell className="px-4 py-2">{new Date(transaction.attributes.date).toLocaleDateString('en-GB')}</TableCell>
                                            <TableCell className="px-4 py-2">
                                                {transaction.relationships?.section?.attributes?.name || 'N/A'}
                                            </TableCell>
                                            <TableCell className="px-4 py-2 font-medium">
                                                {transaction.attributes.title}
                                            </TableCell>
                                            <TableCell className="px-4 py-2">{transaction.attributes.voucherNo ?? '-'}</TableCell>
                                            <TableCell className="px-4 py-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${transaction.attributes.type === 'income'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {transaction.attributes.type}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-4 py-2 text-right">{transaction.attributes.amount}</TableCell>
                                            <TableCell className="px-4 py-2 text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <button className="data-[state=open]:bg-accent bg-background hover:bg-accent ml-auto cursor-pointer rounded-md border p-1">
                                                            <EllipsisVertical size={15} />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => toast.info('View feature coming soon')}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => {
                                                            setEditingTransaction(transaction)
                                                            setIsEditModalOpen(true)
                                                        }}>
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => toast.info('Print feature coming soon')}>
                                                            <Printer className="h-4 w-4 mr-2" />
                                                            Print
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
            <EditTransactionModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                transaction={editingTransaction}
                onUpdate={updateMutation.mutate}
                isUpdating={updateMutation.isPending}
            />
        </DashboardLayout>
    )
}
