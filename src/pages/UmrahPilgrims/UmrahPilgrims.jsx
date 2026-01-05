import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import api from '@/lib/api'
import { UmrahTable } from './components/UmrahTable'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText } from 'lucide-react'

export default function UmrahPilgrims() {
    const { t } = useI18n();
    const navigate = useNavigate()
    const queryClient = useQueryClient()
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

    const handleView = (umrah) => {
        navigate(`/umrah/view/${umrah.id}`)
    }

    const handleDelete = (umrah) => {
        setUmrahToDelete(umrah)
        setOpenDeleteDialog(true)
    }

    const openCreatePage = () => {
        navigate('/umrah/create')
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-end justify-between">
                    <PageHeading
                        title={t({ en: "Umrah Pilgrims", bn: "উমরাহ পিলগ্রিম" })}
                        description={t({ en: "Manage your Umrah pilgrims here.", bn: "উমরাহ পিলগ্রিম ম্যানেজ করুন।" })}
                    />
                    <Button variant="outline" onClick={openCreatePage} className="gap-2">
                        <Plus className="h-4 w-4" />
                        {t({ en: "Add Pilgrim", bn: "অ্যাড পিলগ্রিম" })}
                    </Button>
                </div>

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : umrahs?.length > 0 ? (
                        <UmrahTable
                            umrahs={umrahs}
                            onView={handleView}
                            onDelete={handleDelete}
                        />
                    ) : (
                        <EmptyComponent
                            icon={<FileText />}
                            title={t({ en: "No Pilgrims Found.", bn: "কোন পিলগ্রিম পাওয়া যায়নি।" })}
                            description={t({ en: "Create your first pilgrim.", bn: "আপনার প্রথম পিলগ্রিম তৈরি করুন।" })}
                            action={
                                <Button variant="outline" onClick={openCreatePage} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    {t({ en: "Add Pilgrim", bn: "অ্যাড পিলগ্রিম" })}
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