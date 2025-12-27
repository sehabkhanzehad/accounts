import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { PreRegistrationTable } from './components/PreRegistrationTable'
import { PreRegistrationForm } from './components/PreRegistrationForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText } from 'lucide-react'

export default function PreRegistrations() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingPreRegistration, setEditingPreRegistration] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [preRegistrationToDelete, setPreRegistrationToDelete] = useState(null)

    const { data: groupLeaders } = useQuery({
        queryKey: ['group-leaders'],
        queryFn: async () => {
            const response = await api.get('/pre-registrations/group-leaders')
            return response.data.data
        }
    })

    const { data: banks } = useQuery({
        queryKey: ['banks-list'],
        queryFn: async () => {
            const response = await api.get('/pre-registrations/banks')
            return response.data.data
        }
    })

    const { data, isLoading } = useQuery({
        queryKey: ['pre-registrations', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/pre-registrations', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const preRegistrations = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/pre-registrations', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pre-registrations'] })
            setDialogOpen(false)
            toast.success("Pre-registration created successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to create pre-registration")
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/pre-registrations/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pre-registrations'] })
            setDialogOpen(false)
            setEditingPreRegistration(null)
            toast.success("Pre-registration updated successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to update pre-registration")
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/pre-registrations/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pre-registrations'] })
            setOpenDeleteDialog(false)
            setPreRegistrationToDelete(null)
            toast.success("Pre-registration deleted successfully")
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "Failed to delete pre-registration")
        }
    })

    const handleSubmit = (data) => {
        if (editingPreRegistration) {
            updateMutation.mutate({ id: editingPreRegistration.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (preRegistration) => {
        setEditingPreRegistration(preRegistration)
        setDialogOpen(true)
    }

    const handleDelete = (preRegistration) => {
        setPreRegistrationToDelete(preRegistration)
        setOpenDeleteDialog(true)
    }

    const confirmDelete = () => {
        if (preRegistrationToDelete) {
            deleteMutation.mutate(preRegistrationToDelete.id)
        }
    }

    const openCreateDialog = () => {
        setEditingPreRegistration(null)
        setDialogOpen(true)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title={t('app.pre-registrations.title')}
                        description={t('app.pre-registrations.description')}
                    />
                    <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('app.pre-registrations.add_new')}
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : preRegistrations?.length > 0 ? (
                        <PreRegistrationTable
                            preRegistrations={preRegistrations}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <EmptyComponent
                            icon={<FileText />}
                            title={t('app.pre-registrations.empty.title')}
                            description={t('app.pre-registrations.empty.description')}
                            action={
                                <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    {t('app.pre-registrations.add_new')}
                                </Button>
                            }
                        />
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

                <PreRegistrationForm
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    editingPreRegistration={editingPreRegistration}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    groupLeaders={groupLeaders}
                    banks={banks}
                />

                <AppDeleteAlert
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    deleteData={preRegistrationToDelete}
                    isPending={deleteMutation.isPending}
                    mutate={deleteMutation.mutate}
                    title={t('app.pre-registrations.delete.title')}
                    description={t('app.pre-registrations.delete.description')}
                />
            </div>
        </DashboardLayout>
    )
}