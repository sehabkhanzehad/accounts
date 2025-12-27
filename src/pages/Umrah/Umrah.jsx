import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { UmrahTable } from './components/UmrahTable'
import { UmrahForm } from './components/UmrahForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText } from 'lucide-react'

export default function Umrah() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUmrah, setEditingUmrah] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [umrahToDelete, setUmrahToDelete] = useState(null)

    const { data: packages } = useQuery({
        queryKey: ['umrah-packages'],
        queryFn: async () => {
            const response = await api.get('/umrahs/packages')
            return response.data.data
        }
    })

    const { data: groupLeaders } = useQuery({
        queryKey: ['umrah-group-leaders'],
        queryFn: async () => {
            const response = await api.get('/umrahs/group-leaders')
            return response.data.data
        }
    })

    const { data: pilgrims } = useQuery({
        queryKey: ['umrah-pilgrims'],
        queryFn: async () => {
            const response = await api.get('/umrahs/pilgrims')
            return response.data.data
        }
    })

    const { data, isLoading } = useQuery({
        queryKey: ['umrahs', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/umrahs', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const umrahs = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/umrahs', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrahs'] })
            toast.success('Umrah created successfully')
            setDialogOpen(false)
            setEditingUmrah(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create umrah')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/umrahs/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrahs'] })
            toast.success('Umrah updated successfully')
            setDialogOpen(false)
            setEditingUmrah(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update umrah')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/umrahs/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrahs'] })
            setOpenDeleteDialog(false)
            setUmrahToDelete(null)
            toast.success('Umrah deleted successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete umrah')
        }
    })

    const handleSubmit = (data) => {
        if (editingUmrah) {
            updateMutation.mutate({ id: editingUmrah.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (umrah) => {
        setEditingUmrah(umrah)
        setDialogOpen(true)
    }

    const handleDelete = (umrah) => {
        setUmrahToDelete(umrah)
        setOpenDeleteDialog(true)
    }

    const confirmDelete = () => {
        if (umrahToDelete) {
            deleteMutation.mutate(umrahToDelete.id)
        }
    }

    const openCreateDialog = () => {
        setEditingUmrah(null)
        setDialogOpen(true)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title="Umrah"
                        description="Manage pilgrim umrah registrations"
                    />
                    <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Umrah
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : umrahs?.length > 0 ? (
                        <UmrahTable
                            umrahs={umrahs}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <EmptyComponent
                            icon={<FileText />}
                            title="No umrah registrations found"
                            description="Create your first umrah registration to get started"
                            action={
                                <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Umrah
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

                <UmrahForm
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    editingUmrah={editingUmrah}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    packages={packages}
                    groupLeaders={groupLeaders}
                    pilgrims={pilgrims}
                />

                <AppDeleteAlert
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    deleteData={umrahToDelete}
                    isPending={deleteMutation.isPending}
                    mutate={deleteMutation.mutate}
                    title="Delete Umrah"
                    description="Are you sure you want to delete this umrah registration?"
                />
            </div>
        </DashboardLayout>
    )
}