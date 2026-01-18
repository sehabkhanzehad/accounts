import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import api from '@/lib/api'
import { PreRegistrationTable } from './components/PreRegistrationTable'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText, Search, Filter, ArrowUpDown } from 'lucide-react'

export default function PreRegistrations() {
    const { t } = useTranslation();
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [preRegistrationToDelete, setPreRegistrationToDelete] = useState(null)
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

    const { data, isLoading } = useQuery({
        queryKey: ['pre-registrations', currentPage, rowsPerPage, debouncedSearch],
        queryFn: async () => {
            const response = await api.get('/pre-registrations', {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                    search: debouncedSearch,
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

    const handleDelete = (preRegistration) => {
        setPreRegistrationToDelete(preRegistration)
        setOpenDeleteDialog(true)
    }

    const handleView = (preRegistration) => {

        // navigate(`/pilgrims/pre-registration/${preRegistration.id}`)
        navigate(`/pre-registrations/view/${preRegistration.id}`)
    }

    const openCreateDialog = () => {
        navigate('/pre-registrations/create')
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center justify-between">
                    <PageHeading
                        title={t('app.pre-registrations.title') + ` (${meta?.total || 0})`}
                        description={t('app.pre-registrations.description')}
                    />
                    <Button variant="outline" onClick={openCreateDialog} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t('app.pre-registrations.add_new')}
                    </Button>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by serial no, tracking no, full name, bangla name, phone, nid"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 max-w-lg"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" onClick={() => toast.info("Coming soon")} className="gap-2">
                            <ArrowUpDown className="h-4 w-4" />
                            Sort
                        </Button>
                    </div>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : preRegistrations?.length > 0 ? (
                        <PreRegistrationTable
                            preRegistrations={preRegistrations}
                            onDelete={handleDelete}
                            onView={handleView}
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