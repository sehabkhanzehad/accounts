import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { PackageTable } from './components/PackageTable'
import { PackageForm } from './components/PackageForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, Package } from 'lucide-react'

export default function UmrahPackages() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [packageToDelete, setPackageToDelete] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['umrah-packages', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/umrah-packages', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const packages = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/umrah-packages', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah-packages'] })
            toast.success('Umrah package created successfully')
            setDialogOpen(false)
            setEditingPackage(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create umrah package')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/umrah-packages/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah-packages'] })
            toast.success('Umrah package updated successfully')
            setDialogOpen(false)
            setEditingPackage(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update umrah package')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/umrah-packages/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah-packages'] })
            setOpenDeleteDialog(false)
            setPackageToDelete(null)
            toast.success('Umrah package deleted successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete umrah package')
        }
    })

    const handleSubmit = (data) => {
        if (editingPackage) {
            updateMutation.mutate({ id: editingPackage.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (pkg) => {
        setEditingPackage(pkg)
        setDialogOpen(true)
    }

    const handleDelete = (pkg) => {
        setPackageToDelete(pkg)
        setOpenDeleteDialog(true)
    }

    const confirmDelete = () => {
        if (packageToDelete) {
            deleteMutation.mutate(packageToDelete.id)
        }
    }

    const openCreateDialog = () => {
        setEditingPackage(null)
        setDialogOpen(true)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title="Umrah Packages"
                        description="Manage Umrah packages for pilgrims"
                    />
                    <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Umrah Package
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : packages?.length > 0 ? (
                        <PackageTable
                            packages={packages}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <EmptyComponent
                            icon={<Package />}
                            title="No umrah packages found"
                            description="Create your first umrah package to get started"
                            action={
                                <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Umrah Package
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

                <PackageForm
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    editingPackage={editingPackage}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                />

                <AppDeleteAlert
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    deleteData={packageToDelete}
                    isPending={deleteMutation.isPending}
                    mutate={deleteMutation.mutate}
                    title="Delete Umrah Package"
                    description="Are you sure you want to delete this umrah package?"
                />
            </div>
        </DashboardLayout>
    )
}