import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { EmployeeTable } from './components/EmployeeTable'
import { EmployeeForm } from './components/EmployeeForm'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, Users } from 'lucide-react'

export default function Employees() {
    const { t } = useTranslation();
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [employeeToDelete, setEmployeeToDelete] = useState(null)

    const { data, isLoading } = useQuery({
        queryKey: ['employees', currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get('/sections/employees', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const employees = data?.data
    const meta = data?.meta

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/sections/employees', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            toast.success(t('app.sectionCreated', { section: t('app.sidebar.options.employees') }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToCreateSection', { section: t('app.sidebar.options.employees') }))
        }
    })

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/sections/employees/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            toast.success(t('app.sectionUpdated', { section: t('app.sidebar.options.employees') }))
            setDialogOpen(false)
            resetForm()
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToUpdateSection', { section: t('app.sidebar.options.employees') }))
        }
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/sections/${id}`),
        onSuccess: () => {
            setOpenDeleteDialog(false)
            setEmployeeToDelete(null)
            queryClient.invalidateQueries({ queryKey: ['employees'] })
            toast.success(t('app.sectionDeleted', { section: t('app.sidebar.options.employees') }))
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || t('app.failedToDeleteSection', { section: t('app.sidebar.options.employees') }))
        }
    })

    const handleSubmit = (formData, editingEmployee) => {
        if (editingEmployee) {
            updateMutation.mutate({
                id: editingEmployee.id,
                data: formData
            })
        } else {
            createMutation.mutate(formData)
        }
    }

    const handleEdit = (employee) => {
        setEditingEmployee(employee)
        setDialogOpen(true)
    }

    const handleDelete = (employee) => {
        setEmployeeToDelete(employee)
        setOpenDeleteDialog(true)
    }

    const handleViewTransactions = (employee) => {
        navigate(`/sections/employees/${employee.id}/transactions`)
    }

    const resetForm = () => {
        setEditingEmployee(null)
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
                    text: t('app.sidebar.options.employees'),
                },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading title={t('app.sidebar.options.employees')} description={t('app.manageSections', { section: t('app.sidebar.options.employees').toLowerCase() })} />
                    <Button variant="outline" icon={<Plus />} onClick={openCreateDialog}>
                        {t('app.addSection', { section: t('app.sidebar.options.employees') })}
                    </Button>
                </div>

                <div className="flex-1">
                    {employees?.length === 0 && !isLoading ? (
                        <EmptyComponent
                            title={t('app.noSectionsFound', { section: t('app.sidebar.options.employees').toLowerCase() })}
                            description={t('app.addSections', { section: t('app.sidebar.options.employees').toLowerCase(), purpose: t('app.employeePurpose') })}
                            actionLabel={t('app.addSection', { section: t('app.sidebar.options.employees') })}
                            onAction={openCreateDialog}
                            icon={<Users />}
                        />
                    ) : (
                        <>
                            {isLoading ? (
                                <TableSkeletons />
                            ) : (
                                <EmployeeTable
                                    employees={employees}
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

            {/* create/edit employee dialog */}
            <EmployeeForm
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                editingEmployee={editingEmployee}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
            />

            {/* delete employee alert */}
            <AppDeleteAlert
                open={openDeleteDialog}
                setOpen={setOpenDeleteDialog}
                deleteData={employeeToDelete}
                isPending={deleteMutation.isPending}
                mutate={deleteMutation.mutate}
                title={t('app.deleteSection', { section: t('app.sidebar.options.employees') })}
                description={t('app.confirmDeleteSection', { section: t('app.sidebar.options.employees'), name: employeeToDelete?.attributes?.name })}
            />
        </DashboardLayout>
    )
}