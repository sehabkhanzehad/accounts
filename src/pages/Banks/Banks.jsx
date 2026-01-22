import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { BankTable } from './components/BankTable'
import { BankForm } from './components/BankForm'
import { DepositForm } from './components/DepositForm'
import { WithdrawForm } from './components/WithdrawForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, CreditCard } from 'lucide-react'

export default function Banks() {
    const { t } = useI18n();
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingBank, setEditingBank] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [bankToDelete, setBankToDelete] = useState(null)
    const [depositDialogOpen, setDepositDialogOpen] = useState(false)
    const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ['banks', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/banks', {
                params: {
                    paginate: true,
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const { data: allBanksData } = useQuery({
        queryKey: ['all-banks'],
        queryFn: async () => {
            const response = await api.get('/sections/banks', {
                params: {
                    paginate: false,
                }
            })
            return response.data
        },
        enabled: depositDialogOpen || withdrawDialogOpen
    })

    const banks = data?.data
    const meta = data?.meta
    const allBanks = allBanksData?.data

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/sections/banks', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banks'] })
            toast.success(t('app.sectionCreated', { section: t('app.sidebar.options.banks') }))
            setDialogOpen(false)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToCreateSection', { section: t('app.sidebar.options.banks') }))
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/banks/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banks'] })
            toast.success(t('app.sectionUpdated', { section: t('app.sidebar.options.banks') }))
            setDialogOpen(false)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToUpdateSection', { section: t('app.sidebar.options.banks') }))
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setBankToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['banks'] })
            toast.success(t('app.sectionDeleted', { section: t('app.sidebar.options.banks') }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.failedToDeleteSection', { section: t('app.sidebar.options.banks') }))
        }
    })

    const depositMutation = useMutation({
        mutationFn: ({ id, data }) => api.post(`/sections/banks/${id}/deposit`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banks'] })
            toast.success(t('app.depositSuccessful'))
            setDepositDialogOpen(false)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToDeposit'))
        }
    })

    const withdrawMutation = useMutation({
        mutationFn: ({ id, data }) => api.post(`/sections/banks/${id}/withdraw`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['banks'] })
            toast.success(t('app.withdrawSuccessful'))
            setWithdrawDialogOpen(false)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToWithdraw'))
        }
    })

    const handleSubmit = (data) => {
        if (editingBank) {
            updateMutation.mutate({ id: editingBank.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (bank) => {
        setEditingBank(bank)
        setDialogOpen(true)
    }

    const handleDelete = (bank) => {
        setBankToDelete(bank)
        setOpenDeleteDialog(true)
    }

    const handleViewTransactions = (bank) => {
        navigate(`/accounts/sections/banks/${bank.id}/transactions`)
    }

    const handleDepositSubmit = (data) => {
        const { bank_id, ...formData } = data
        formData.voucher_no = `E${formData.voucher_no}`
        depositMutation.mutate({ id: bank_id, data: formData })
    }

    const handleWithdrawSubmit = (data) => {
        const { bank_id, ...formData } = data
        formData.voucher_no = `I${formData.voucher_no}`
        withdrawMutation.mutate({ id: bank_id, data: formData })
    }

    const openCreateDialog = () => {
        setEditingBank(null)
        setDialogOpen(true)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

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
                    text: t('app.sidebar.options.banks'),
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading title={t('app.sidebar.options.banks')} description={t('app.manageSections', { section: t('app.sidebar.options.banks').toLowerCase() })} />
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setDepositDialogOpen(true)}
                        >
                            {t('app.deposit')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setWithdrawDialogOpen(true)}
                        >
                            {t('app.withdraw')}
                        </Button>
                        <Button variant="outline" icon={<Plus />} onClick={openCreateDialog}>
                            {t('app.addSection', { section: t('app.sidebar.options.banks') })}
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    {banks?.length === 0 && !isLoading ? (
                        <EmptyComponent
                            title={t('app.noSectionsFound', { section: t('app.sidebar.options.banks').toLowerCase() })}
                            description={t('app.addSections', { section: t('app.sidebar.options.banks').toLowerCase(), purpose: t('app.bankPurpose') })}
                            actionLabel={t('app.addSection', { section: t('app.sidebar.options.banks') })}
                            onAction={openCreateDialog}
                            icon={<CreditCard />}
                        />
                    ) : (
                        <>
                            {isLoading ? (
                                <TableSkeletons />
                            ) : (
                                <BankTable
                                    banks={banks}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onViewTransactions={handleViewTransactions}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* pagination */}
                <AppPagination
                    meta={meta}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />
            </div>

            {/* create/edit bank dialog */}
            <BankForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingBank={editingBank}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* deposit dialog */}
            <DepositForm
                open={depositDialogOpen}
                onOpenChange={setDepositDialogOpen}
                onSubmit={handleDepositSubmit}
                isSubmitting={depositMutation.isPending}
                allBanks={allBanks}
            />

            {/* withdraw dialog */}
            <WithdrawForm
                open={withdrawDialogOpen}
                onOpenChange={setWithdrawDialogOpen}
                onSubmit={handleWithdrawSubmit}
                isSubmitting={withdrawMutation.isPending}
                allBanks={allBanks}
            />

            {/* delete bank alert */}
            <AppDeleteAlert
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                deleteData={bankToDelete}
                isPending={deleteMutation.isPending}
                mutate={deleteMutation.mutate}
                title="Delete bank"
                description={`Are you sure you want to delete the bank ${bankToDelete?.attributes?.name}?`}
            />
        </DashboardLayout>
    )
}