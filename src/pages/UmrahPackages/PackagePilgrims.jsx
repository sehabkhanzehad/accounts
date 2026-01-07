import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import api from '@/lib/api'
import { UmrahTable } from '../UmrahPilgrims/components/UmrahTable'
import { CollectionModal } from './components/CollectionModal'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText, Users, UserCheck, UserX, CheckCircle } from 'lucide-react'

export default function PackagePilgrims() {
    const { t } = useI18n();
    const navigate = useNavigate()
    const { id } = useParams()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(10)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [umrahToDelete, setUmrahToDelete] = useState(null)
    const [showCollectionModal, setShowCollectionModal] = useState(false)

    // Fetch package details
    const { data: packageData, isLoading: isPackageLoading } = useQuery({
        queryKey: ['umrah-package', id],
        queryFn: async () => {
            const response = await api.get(`/umrah-packages/${id}`)
            return response.data.data
        }
    })

    // Fetch pilgrims for this package
    const { data: pilgrimsData, isLoading: isPilgrimsLoading } = useQuery({
        queryKey: ['umrah-package-pilgrims', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/umrah-packages/${id}/pilgrims`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        }
    })

    const pilgrims = pilgrimsData?.data
    const meta = pilgrimsData?.meta
    const packageInfo = packageData?.attributes

    const deleteMutation = useMutation({
        mutationFn: (pilgrimId) => api.delete(`/umrahs/${pilgrimId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah-package-pilgrims'] })
            queryClient.invalidateQueries({ queryKey: ['umrah-package'] })
            setOpenDeleteDialog(false)
            setUmrahToDelete(null)
            toast.success('Pilgrim removed from package successfully')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to remove pilgrim')
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

    const isLoading = isPackageLoading || isPilgrimsLoading

    return (
        <DashboardLayout
            breadcrumbs={[
                { type: 'link', text: t('app.home'), href: '/' },
                { type: 'link', text: 'Umrah Packages', href: '/umrah-packages' },
                { type: 'page', text: packageInfo?.name || 'Package Pilgrims' },
            ]}
        >
            <div className="flex flex-col h-full gap-4">
             
                {/* Pilgrims Table */}
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Pilgrims in this Package</h2>
                        <p className="text-sm text-muted-foreground">Manage pilgrims registered for this Umrah package</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="default" onClick={() => setShowCollectionModal(true)} className="gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {t({ en: "Collect", bn: "কালেক্ট" })}
                        </Button>
                        <Button variant="outline" onClick={openCreatePage} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t({ en: "Add Pilgrim", bn: "অ্যাড পিলগ্রিম" })}
                        </Button>
                    </div>
                </div>
             
                {/* Package Info */}
                {packageInfo && (
                    <Card className="p-4">
                        <div className="flex items-center gap-8">
                            <div className="flex-1">
                                <h1 className="text-lg font-semibold">{packageInfo.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                    {packageInfo.start_date && packageInfo.end_date && (
                                        <span>
                                            {new Date(packageInfo.start_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })} - {new Date(packageInfo.end_date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="flex items-center gap-3">
                                <div className="bg-muted/50 rounded-lg px-3 py-2 w-20 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3" />
                                        <span className="text-xs font-medium">Total</span>
                                    </div>
                                    <div className="text-sm font-bold">{String(packageInfo.statistics?.total_pilgrims || 0).padStart(2, '0')}</div>
                                </div>

                                <div className="bg-muted/50 rounded-lg px-3 py-2 w-20 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3 text-blue-600" />
                                        <span className="text-xs text-blue-600 font-medium">Registered</span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-700">{String(packageInfo.statistics?.registered || 0).padStart(2, '0')}</div>
                                </div>

                                <div className="bg-muted/50 rounded-lg px-3 py-2 w-20 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3 text-red-600" />
                                        <span className="text-xs text-red-600 font-medium">Cancelled</span>
                                    </div>
                                    <div className="text-sm font-bold text-red-700">{String(packageInfo.statistics?.cancelled || 0).padStart(2, '0')}</div>
                                </div>

                                <div className="bg-muted/50 rounded-lg px-3 py-2 w-20 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">Completed</span>
                                    </div>
                                    <div className="text-sm font-bold text-green-700">{String(packageInfo.statistics?.completed || 0).padStart(2, '0')}</div>
                                </div>
                            </div>

                            {/* Price and Status */}
                            <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                    ৳{parseFloat(packageInfo.price).toLocaleString()}
                                </div>
                                <Badge variant={packageInfo.status ? "default" : "destructive"} className="text-xs mt-1">
                                    {packageInfo.status ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="flex-1">
                    {isLoading ? (
                        <TableSkeletons />
                    ) : pilgrims?.length > 0 ? (
                        <UmrahTable
                            umrahs={pilgrims}
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
                    title="Remove Pilgrim"
                    description="Are you sure you want to remove this pilgrim from the package?"
                />

                <CollectionModal
                    open={showCollectionModal}
                    onOpenChange={setShowCollectionModal}
                    packageId={id}
                />
            </div>
        </DashboardLayout>
    )
}