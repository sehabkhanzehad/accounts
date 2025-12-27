import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { GroupLeaderTable } from './components/GroupLeaderTable'
import { GroupLeaderForm } from './components/GroupLeaderForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, Users } from 'lucide-react'

export default function GroupLeaders() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingGroupLeader, setEditingGroupLeader] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [groupLeaderToDelete, setGroupLeaderToDelete] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['group-leaders', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/group-leaders', {
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
        mutationFn: (data) => api.post('/sections/group-leaders', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-leaders'] })
            toast.success(t('app.sectionCreated', { section: t('app.sidebar.options.groupLeaders') }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToCreateSection', { section: t('app.sidebar.options.groupLeaders') }))
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/group-leaders/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['group-leaders'] })
            toast.success(t('app.sectionUpdated', { section: t('app.sidebar.options.groupLeaders') }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToUpdateSection', { section: t('app.sidebar.options.groupLeaders') }))
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setGroupLeaderToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['group-leaders'] })
            toast.success(t('app.sectionDeleted', { section: t('app.sidebar.options.groupLeaders') }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t('app.failedToDeleteSection', { section: t('app.sidebar.options.groupLeaders') }))
        }
    })

    const handleSubmit = (formData, editingGroupLeader) => {
        if (editingGroupLeader) {
            updateMutation.mutate({
                id: editingGroupLeader.id,
                data: formData
            })
        } else {
            createMutation.mutate(formData)
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

    const handleViewTransactions = (groupLeader) => {
        navigate(`/sections/group-leaders/${groupLeader.id}/transactions`)
    }

    const resetForm = () => {
        setEditingGroupLeader(null)
    }

    const openCreateDialog = () => {
        resetForm()
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
                    text: t('app.sidebar.options.groupLeaders'),
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading title={t('app.sidebar.options.groupLeaders')} description={t('app.manageSections', { section: t('app.sidebar.options.groupLeaders') })} />
                    <Button variant="outline" icon={<Plus />} onClick={openCreateDialog}>
                        {t('app.addSection', { section: t('app.sidebar.options.groupLeaders') })}
                    </Button>
                </div>

                <div className="flex-1">
                    {groupLeaders?.length === 0 && !isLoading ? (
                        <EmptyComponent
                            title={t('app.noSectionsFound', { section: t('app.sidebar.options.groupLeaders') })}
                            description={t('app.addSections', { section: t('app.sidebar.options.groupLeaders'), purpose: t('app.groupLeaderPurpose') })}
                            actionLabel={t('app.addSection', { section: t('app.sidebar.options.groupLeaders') })}
                            onAction={openCreateDialog}
                            icon={<Users />}
                        />
                    ) : (
                        <>
                            {isLoading ? (
                                <TableSkeletons />
                            ) : (
                                <GroupLeaderTable
                                    groupLeaders={groupLeaders}
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

            {/* create/edit group leader dialog */}
            <GroupLeaderForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingGroupLeader={editingGroupLeader}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* delete group leader alert */}
            <AppDeleteAlert
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                deleteData={groupLeaderToDelete}
                isPending={deleteMutation.isPending}
                mutate={deleteMutation.mutate}
                title={t('app.deleteSection', { section: t('app.sidebar.options.groupLeaders') })}
                description={t('app.confirmDeleteSection', { section: t('app.sidebar.options.groupLeaders'), name: groupLeaderToDelete?.attributes?.name })}
            />
        </DashboardLayout>
    )
}