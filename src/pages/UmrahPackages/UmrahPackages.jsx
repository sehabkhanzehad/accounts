import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { PackageTable } from './components/PackageTable'
import { PackageGrid } from './components/PackageGrid'
import { PackageForm } from './components/PackageForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, Package, LayoutGrid, List } from 'lucide-react'

export default function UmrahPackages() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [packageToDelete, setPackageToDelete] = useState(null)
    const [view, setView] = useState(localStorage.getItem('umrah-packages-view') || 'grid')

    useEffect(() => {
        localStorage.setItem('umrah-packages-view', view)
    }, [view])

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

    const openCreateDialog = () => {
        setEditingPackage(null)
        setDialogOpen(true)
    }

    const openCreatePilgrimPage = () => {
        navigate('/umrah/create')
    }

    const handleViewPilgrims = (pkg) => {
        navigate(`/umrah-packages/${pkg.id}/pilgrims`)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending

    return (
        <DashboardLayout
            breadcrumbs={[
                { type: 'link', text: t('app.home'), href: '/' },
                { type: 'page', text: 'Umrah Packages' },
            ]}>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title="Umrah Packages"
                        description="Manage Umrah packages for pilgrims"
                    />
                   <div className="flex items-center gap-2">
                        {/* Toggle */}
                        <div className="flex items-center gap-2 h-10 rounded-md border border-border/30 bg-background/50 px-1">
                            <Button
                            variant={view === "grid" ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setView("grid")}
                            className={`h-8 w-8 rounded-md transition-all duration-150 ${
                                view === "grid"
                                ? "bg-primary text-primary-foreground shadow"
                                : "bg-transparent text-muted-foreground hover:bg-muted/80"
                            }`}
                            >
                            <LayoutGrid className="h-4 w-4" />
                            </Button>
                            
                            <Button
                            variant={view === "list" ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setView("list")}
                            className={`h-8 w-8 rounded-md transition-all duration-150 ${
                                view === "list"
                                ? "bg-primary text-primary-foreground shadow"
                                : "bg-transparent text-muted-foreground hover:bg-muted/80"
                            }`}
                            >
                            <List className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <Button variant="outline" onClick={openCreatePilgrimPage} className="h-10 gap-2">
                            <Plus className="h-4 w-4" />
                            Add Pilgrim
                            </Button>

                            <Button variant="outline" onClick={openCreateDialog} className="h-10 gap-2">
                            <Plus className="h-4 w-4" />
                            Add Package
                            </Button>
                        </div>
                   </div>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : packages?.length > 0 ? (
                        view === 'list' ? (
                            <PackageTable
                                packages={packages}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewPilgrims={handleViewPilgrims}
                            />
                        ) : (
                            <PackageGrid
                                packages={packages}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onViewPilgrims={handleViewPilgrims}
                            />
                        )
                    ) : (
                        <EmptyComponent
                            icon={<Package />}
                            title="No umrah packages found"
                            description="Create your first umrah package to get started"
                            action={
                                <Button onClick={openCreateDialog} className="gap-2">
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