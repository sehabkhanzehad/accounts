import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { RegistrationTable } from './components/RegistrationTable'
import { RegistrationForm } from './components/RegistrationForm'
import { ReplaceForm } from './components/ReplaceForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Registrations() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingRegistration, setEditingRegistration] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [registrationToDelete, setRegistrationToDelete] = useState(null)
    const [replaceDialogOpen, setReplaceDialogOpen] = useState(false)
    const [replacingRegistration, setReplacingRegistration] = useState(null)
    const navigate = useNavigate()

    const { data: preRegistrations } = useQuery({
        queryKey: ['registration-pre-registrations'],
        queryFn: async () => {
            const response = await api.get('/registrations/pre-registrations')
            return response.data.data
        }
    })

    const { data: packages } = useQuery({
        queryKey: ['registration-packages'],
        queryFn: async () => {
            const response = await api.get('/registrations/packages')
            return response.data.data
        }
    })

    const { data: banks } = useQuery({
        queryKey: ['registration-banks'],
        queryFn: async () => {
            const response = await api.get('/registrations/banks')
            return response.data.data
        }
    })

    const { data, isLoading } = useQuery({
        queryKey: ['registrations', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/registrations', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const registrations = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/registrations', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] })
            queryClient.invalidateQueries({ queryKey: ['registration-pre-registrations'] })
            toast.success('Registration created successfully')
            setDialogOpen(false)
            setEditingRegistration(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create registration')
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/registrations/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] })
            toast.success('Registration updated successfully')
            setDialogOpen(false)
            setEditingRegistration(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update registration')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/registrations/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] })
            setOpenDeleteDialog(false)
            setRegistrationToDelete(null)
            toast.success('Registration deleted successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to delete registration')
        }
    })

    const replaceMutation = useMutation({
        mutationFn: ({ id, data }) => api.post(`/registrations/${id}/replace`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['registrations'] })
            queryClient.invalidateQueries({ queryKey: ['registration-pre-registrations'] })
            toast.success('Registration replaced successfully')
            setReplaceDialogOpen(false)
            setReplacingRegistration(null)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to replace registration')
        }
    })

    const handleReplaceSubmit = (data) => {
        if (replacingRegistration) {
            replaceMutation.mutate({ id: replacingRegistration.id, data })
        }
    }

    const handleSubmit = (data) => {
        if (editingRegistration) {
            updateMutation.mutate({ id: editingRegistration.id, data })
        } else {
            createMutation.mutate(data)
        }
    }

    const handleEdit = (registration) => {
        setEditingRegistration(registration)
        setDialogOpen(true)
    }

    const handleDelete = (registration) => {
        setRegistrationToDelete(registration)
        setOpenDeleteDialog(true)
    }

    const handleReplace = (registration) => {
        setReplacingRegistration(registration)
        setReplaceDialogOpen(true)
    }

    const confirmDelete = () => {
        if (registrationToDelete) {
            deleteMutation.mutate(registrationToDelete.id)
        }
    }

    const openCreateDialog = () => {
        setEditingRegistration(null)
        setDialogOpen(true)
    }


    const handleView = (id) => {
        // navigate(`/pilgrims/pre-registration/${preRegistration.id}`)
        navigate(`/pre-registrations/view/${id}`)
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending || replaceMutation.isPending

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title={`Registrations (${meta?.total || 0})`}
                        description="Manage pilgrim registrations for packages"
                    />
                    <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Registration
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : registrations?.length > 0 ? (
                        <RegistrationTable
                            registrations={registrations}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onView={handleView}
                            onReplace={handleReplace}
                        />
                    ) : (
                        <EmptyComponent
                            icon={<FileText />}
                            title="No registrations found"
                            description="Create your first registration to get started"
                            action={
                                <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Registration
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

                <RegistrationForm
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    editingRegistration={editingRegistration}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    preRegistrations={preRegistrations}
                    packages={packages}
                    banks={banks}
                />

                <ReplaceForm
                    open={replaceDialogOpen}
                    onOpenChange={setReplaceDialogOpen}
                    replacingRegistration={replacingRegistration}
                    onSubmit={handleReplaceSubmit}
                    isSubmitting={replaceMutation.isPending}
                    preRegistrations={preRegistrations}
                />

                <AppDeleteAlert
                    open={openDeleteDialog}
                    setOpen={setOpenDeleteDialog}
                    deleteData={registrationToDelete}
                    isPending={deleteMutation.isPending}
                    mutate={deleteMutation.mutate}
                    title="Delete Registration"
                    description="Are you sure you want to delete this registration?"
                />
            </div>
        </DashboardLayout>
    )
}