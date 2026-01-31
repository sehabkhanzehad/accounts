import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { useNavigate, useParams, useSearchParams, NavLink } from 'react-router-dom'
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
import { Plus, FileText, Users, UserCheck, UserX, CheckCircle, Users as UsersIcon } from 'lucide-react'

export default function PackagePilgrims() {
    const { t } = useI18n();
    const navigate = useNavigate()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const queryClient = useQueryClient()
    const [currentPage, setCurrentPage] = useState(1)
    const [rowsPerPage, setRowsPerPage] = useState(25)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [umrahToDelete, setUmrahToDelete] = useState(null)
    const [showCollectionModal, setShowCollectionModal] = useState(false)

    const groupLeaderId = searchParams.get('group_leader')

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
        queryKey: ['umrah-package-pilgrims', id, currentPage, rowsPerPage, groupLeaderId],
        queryFn: async () => {
            const response = await api.get(`/umrah-packages/${id}/pilgrims`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                    group_leader: groupLeaderId,
                }
            })
            return response.data
        }
    })

    // Determine if financial column should be shown
    const selectedGroupLeader = packageData?.relationships?.groupLeaders?.find(gl => gl.id.toString() === groupLeaderId)
    const showFinancialColumn = selectedGroupLeader ? selectedGroupLeader.attributes.trackPayment : false
    const showGroupLeaderColumn = !groupLeaderId

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
                {/* Full Width Header */}
                <div className="flex items-end justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Pilgrims in this Package</h2>
                        <p className="text-sm text-muted-foreground">Manage pilgrims registered for this Umrah package</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
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

                {/* Package Info - Full Width */}
                {packageInfo && (
                    <Card className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="bg-muted/50 rounded-lg px-2 sm:px-3 py-2 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3" />
                                        <span className="text-xs font-medium">Total</span>
                                    </div>
                                    <div className="text-sm font-bold">{String(packageInfo.statistics?.total_pilgrims || 0).padStart(2, '0')}</div>
                                </div>

                                <div className="bg-muted/50 rounded-lg px-2 sm:px-3 py-2 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3 text-blue-600" />
                                        <span className="text-xs text-blue-600 font-medium">Registered</span>
                                    </div>
                                    <div className="text-sm font-bold text-blue-700">{String(packageInfo.statistics?.registered || 0).padStart(2, '0')}</div>
                                </div>

                                <div className="bg-muted/50 rounded-lg px-2 sm:px-3 py-2 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3 text-red-600" />
                                        <span className="text-xs text-red-600 font-medium">Cancelled</span>
                                    </div>
                                    <div className="text-sm font-bold text-red-700">{String(packageInfo.statistics?.cancelled || 0).padStart(2, '0')}</div>
                                </div>

                                <div className="bg-muted/50 rounded-lg px-2 sm:px-3 py-2 text-center">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                        <Users className="h-3 w-3 text-green-600" />
                                        <span className="text-xs text-green-600 font-medium">Completed</span>
                                    </div>
                                    <div className="text-sm font-bold text-green-700">{String(packageInfo.statistics?.completed || 0).padStart(2, '0')}</div>
                                </div>
                            </div>

                            {/* Price and Status */}
                            <div className="text-right mt-3 md:mt-0">
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

                {/* Sidebar and Table */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden gap-4">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Filter by Group Leader</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 h-full overflow-y-auto">
                                <nav className="space-y-1">
                                    <NavLink
                                        to={`/umrah-packages/${id}/pilgrims`}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${!groupLeaderId
                                            ? 'bg-secondary text-secondary-foreground'
                                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
                                            }`}
                                    >
                                        <UsersIcon className="h-4 w-4" />
                                        All Pilgrims
                                    </NavLink>
                                    {packageData?.relationships?.groupLeaders?.map((gl) => (
                                        <NavLink
                                            key={gl.id}
                                            to={`/umrah-packages/${id}/pilgrims?group_leader=${gl.id}`}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${groupLeaderId === gl.id.toString()
                                                ? 'bg-secondary text-secondary-foreground'
                                                : 'text-muted-foreground hover:bg-secondary/50 hover:text-secondary-foreground'
                                                }`}
                                        >
                                            <UsersIcon className="h-4 w-4" />
                                            {gl.attributes.groupName}
                                        </NavLink>
                                    ))}
                                </nav>
                            </CardContent>
                        </Card>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto">
                        <Card className="h-full">
                            <CardContent className="p-4 h-full">
                                <div className="flex flex-col h-full gap-4">

                                    <div className="flex-1">
                                        {isLoading ? (
                                            <TableSkeletons />
                                    ) : pilgrims?.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <UmrahTable
                                                    umrahs={pilgrims}
                                                    onView={handleView}
                                                    onDelete={handleDelete}
                                                    showPackageColumn={false}
                                                    showGroupLeaderColumn={showGroupLeaderColumn}
                                                    showFinancialColumn={showFinancialColumn}
                                                />
                                            </div>
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
                            </CardContent>
                        </Card>
                    </main>
                </div>
            </div>
        </DashboardLayout>
    )
}