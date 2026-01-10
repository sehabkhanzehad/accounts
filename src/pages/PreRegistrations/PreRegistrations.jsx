import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { PreRegistrationTable } from './components/PreRegistrationTable'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText } from 'lucide-react'

export default function PreRegistrations() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [preRegistrationToDelete, setPreRegistrationToDelete] = useState(null)

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

    const handleEdit = (preRegistration) => {
        navigate(`/pre-registrations/edit/${preRegistration.id}`)
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
        navigate('/pre-registrations/create')
    }

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