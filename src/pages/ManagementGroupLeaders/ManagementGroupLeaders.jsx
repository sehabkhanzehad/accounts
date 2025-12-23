import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { ManagementGroupLeaderTable } from './components/ManagementGroupLeaderTable'
import { ManagementGroupLeaderForm } from './components/ManagementGroupLeaderForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, Users } from 'lucide-react'

export default function ManagementGroupLeaders() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingGroupLeader, setEditingGroupLeader] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [groupLeaderToDelete, setGroupLeaderToDelete] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['management-group-leaders', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/group-leaders', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const groupLeaders = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/group-leaders', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['management-group-leaders'] })
            toast.success('Group leader created successfully')
            setDialogOpen(false)
            setEditingGroupLeader(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create group leader')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/group-leaders/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['management-group-leaders'] })
            toast.success('Group leader updated successfully')
            setDialogOpen(false)
            setEditingGroupLeader(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update group leader')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/group-leaders/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['management-group-leaders'] })
            setOpenDeleteDialog(false)
            setGroupLeaderToDelete(null)
            toast.success('Group leader deleted successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete group leader')
        }
    })

    const handleSubmit = (data) => {
        if (editingGroupLeader) {
            updateMutation.mutate({ id: editingGroupLeader.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (groupLeader) => {
        setEditingGroupLeader(groupLeader)
        setDialogOpen(true)
    }

    const handleDelete = (groupLeader) => {
        setGroupLeaderToDelete(groupLeader)
        setOpenDeleteDialog(true)
    }

    const confirmDelete = () => {
        if (groupLeaderToDelete) {
            deleteMutation.mutate(groupLeaderToDelete.id)
        }
    }

    const openCreateDialog = () => {
        setEditingGroupLeader(null)
        setDialogOpen(true)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title="Management Group Leaders"
                        description="Manage group leaders for pilgrim management"
                    />
                    <Button onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Group Leader
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : groupLeaders?.length > 0 ? (
                        <ManagementGroupLeaderTable
                            groupLeaders={groupLeaders}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <EmptyComponent
                            icon={<Users />}
                            title="No group leaders found"
                            description="Create your first group leader to get started"
                            action={
                                <Button onClick={openCreateDialog} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Group Leader
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

                <ManagementGroupLeaderForm
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    editingGroupLeader={editingGroupLeader}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />

                <AppDeleteAlert
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    deleteData={groupLeaderToDelete}
                    isPending={deleteMutation.isPending}
                    mutate={deleteMutation.mutate}
                    title="Delete Group Leader"
                    description="Are you sure you want to delete this group leader?"
                />
            </div>
        </DashboardLayout>
    )
}