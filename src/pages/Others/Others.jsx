import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { OtherTable } from './components/OtherTable'
import { OtherForm } from './components/OtherForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText } from 'lucide-react'

export default function Others() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingOther, setEditingOther] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [otherToDelete, setOtherToDelete] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['others', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/others', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const others = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/sections/others', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['others'] })
            toast.success('Other section created successfully')
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create other section')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/others/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['others'] })
            toast.success('Other section updated successfully')
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update other section')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setOtherToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['others'] })
            toast.success('Other section deleted successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete other section')
        }
    })

    const handleSubmit = (formData, editingOther) => {
        if (editingOther) {
            updateMutation.mutate({
                id: editingOther.id,
                data: formData
            })
        } else {
            createMutation.mutate(formData)
        }
    }

    const handleEdit = (other) => {
        setEditingOther(other)
        setDialogOpen(true)
    }

    const handleDelete = (other) => {
        setOtherToDelete(other)
        setOpenDeleteDialog(true)
    }

    const resetForm = () => {
        setEditingOther(null)
    }

    const breadcrumbs = [
        { type: 'link', text: t('app.home'), href: '/' },
        { type: 'separator' },
        { type: 'link', text: t('app.sidebar.menu.sections'), href: '/sections/banks' },
        { type: 'separator' },
        { type: 'page', text: t('app.sidebar.options.others') },
    ]

    return (
        <DashboardLayout breadcrumbs={breadcrumbs}>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between">
                    <PageHeading title={t('app.sidebar.options.others')} description="Manage your other sections." />
                    <Button onClick={() => setDialogOpen(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add Other Section
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : others?.length === 0 ? (
                        <EmptyComponent
                            icon={<FileText />}
                            title="No other sections found"
                            description="Get started by creating your first other section."
                            actionLabel="Add Other Section"
                            onAction={() => setDialogOpen(true)}
                        />
                    ) : (
                        <OtherTable
                            others={others}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    )}
                </div>

                <AppPagination
                    meta={meta}
                    rowsPerPage={rowsPerPage}
                    setRowsPerPage={setRowsPerPage}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                />

                <OtherForm
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    onSubmit={handleSubmit}
                    editingOther={editingOther}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />

                <AppDeleteAlert
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    deleteData={otherToDelete}
                    isPending={deleteMutation.isPending}
                    mutate={deleteMutation.mutate}
                    title="Delete Other Section"
                    description={`Are you sure you want to delete "${otherToDelete?.attributes?.name}"? This action cannot be undone.`}
                />
            </div>
        </DashboardLayout>
    )
}