import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '@/contexts/I18nContext'
import { useNavigate, useParams, useSearchParams, NavLink } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from '@/lib/api'
import { UmrahTable } from '../UmrahPilgrims/components/UmrahTable'
import { CollectionModal } from './components/CollectionModal'
import AppPagination from '@/components/app/AppPagination'
import { EmptyComponent } from '@/components/app/EmptyComponent'
import TableSkeletons from '@/components/skeletons/TableSkeletons'
import AppDeleteAlert from '@/components/app/AppDeleteAlert'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Plus, FileText, Users, UserCheck, UserX, CheckCircle, Users as UsersIcon, Printer, Search, X, Loader2, CreditCard } from 'lucide-react'
import { IDCardPrintModal } from '@/components/id-card/IDCardPrintModal'

const PrintableTable = ({ pilgrims, selectedColumns, packageInfo, selectedGroupLeader, showFinancialColumn, showGroupLeaderColumn }) => {
    return (
        <div id="printable-table" style={{ display: 'none', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif', fontSize: '11px', lineHeight: '1.3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#111' }}>{packageInfo?.name}</div>
                    <div style={{ fontSize: '11px', color: '#333', marginTop: '2px' }}>
                        {packageInfo?.duration_days} days | ৳{parseFloat(packageInfo?.price || 0).toLocaleString()}
                    </div>
                    {packageInfo?.start_date && packageInfo?.end_date && (
                        <div style={{ fontSize: '11px', color: '#333' }}>
                            {new Date(packageInfo.start_date).toLocaleDateString()} - {new Date(packageInfo.end_date).toLocaleDateString()}
                        </div>
                    )}
                </div>
                {selectedGroupLeader && (
                    <div style={{ textAlign: 'right', minWidth: '180px' }}>
                        <div style={{ fontSize: '11px', color: '#333' }}>
                            <div><strong>Group:</strong> {selectedGroupLeader.attributes.groupName}</div>
                            {selectedGroupLeader.relationships?.user?.attributes?.name || selectedGroupLeader.relationships?.user?.attributes?.firstName ? (
                                <div><strong>Leader:</strong> {selectedGroupLeader.relationships.user.attributes.name || `${selectedGroupLeader.relationships.user.attributes.firstName} ${selectedGroupLeader.relationships.user.attributes.lastName}`}</div>
                            ) : null}
                            <div><strong>Payment Track:</strong> {selectedGroupLeader.attributes.trackPayment ? 'Yes' : 'No'}</div>
                        </div>
                    </div>
                )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px', color: '#000000' }}>
                <thead>
                    <tr>
                        {selectedColumns.includes('pilgrim') && <th style={{ padding: '6px 8px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Pilgrim</th>}
                        {selectedColumns.includes('nid') && <th style={{ padding: '6px 8px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>NID & DOB</th>}
                        {selectedColumns.includes('passport') && <th style={{ padding: '6px 8px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Passport</th>}
                        {showGroupLeaderColumn && selectedColumns.includes('groupLeader') && <th style={{ padding: '6px 8px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Group Leader</th>}
                        {showFinancialColumn && selectedColumns.includes('financial') && <th style={{ padding: '6px 8px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Financial Info</th>}
                        {selectedColumns.includes('address') && <th style={{ padding: '6px 8px', border: '1px solid #ddd', backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>Address</th>}
                    </tr>
                </thead>
                <tbody>
                    {pilgrims?.map((umrah) => {
                        const user = umrah.relationships?.pilgrim?.relationships?.user?.attributes
                        const groupLeader = umrah.relationships?.groupLeader?.attributes
                        const passport = umrah.relationships?.passport?.attributes
                        return (
                            <tr key={umrah.id}>
                                {selectedColumns.includes('pilgrim') && (
                                    <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                                        {user?.firstName} {user?.lastName}
                                        {user?.gender && ` (${user.gender === 'male' ? 'M' : user.gender === 'female' ? 'F' : 'O'})`}
                                        <br />{user?.phone}
                                    </td>
                                )}
                                {selectedColumns.includes('nid') && (
                                    <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                                        NID: {user?.nid || 'N/A'}<br />
                                        DOB: {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'N/A'}
                                    </td>
                                )}
                                {selectedColumns.includes('passport') && (
                                    <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                                        {passport?.passportNumber || 'N/A'}
                                        {passport?.expiryDate ? <><br />Exp: {new Date(passport.expiryDate).toLocaleDateString()}</> : null}
                                    </td>
                                )}
                                {showGroupLeaderColumn && selectedColumns.includes('groupLeader') && (
                                    <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>{groupLeader?.groupName}</td>
                                )}
                                {showFinancialColumn && selectedColumns.includes('financial') && (
                                    <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                                        Paid: ৳{parseFloat(umrah.attributes.totalPaid || 0).toLocaleString()}<br />
                                        Discount: ৳{parseFloat(umrah.attributes.discount || 0).toLocaleString()}
                                    </td>
                                )}
                                {selectedColumns.includes('address') && (
                                    <td style={{ padding: '6px 8px', border: '1px solid #ddd' }}>
                                        {umrah.relationships?.pilgrim?.relationships?.user?.relationships?.presentAddress?.attributes?.district || 'N/A'}
                                    </td>
                                )}
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            <div style={{ marginTop: '10px', textAlign: 'center', fontSize: '10px', color: '#666' }}>
                Report generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
        </div>
    )
}

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
    const [showPrintModal, setShowPrintModal] = useState(false)
    const [showIDCardModal, setShowIDCardModal] = useState(false)
    const [selectedColumns, setSelectedColumns] = useState(['pilgrim', 'nid', 'passport', 'groupLeader', 'financial', 'address'])
    const [search, setSearch] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')

    const groupLeaderId = searchParams.get('group_leader')

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search)
            setCurrentPage(1)
        }, 500)
        return () => clearTimeout(timer)
    }, [search])

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
        queryKey: ['umrah-package-pilgrims', id, currentPage, rowsPerPage, groupLeaderId, debouncedSearch],
        queryFn: async () => {
            const response = await api.get(`/umrah-packages/${id}/pilgrims`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                    group_leader: groupLeaderId,
                    search: debouncedSearch,
                }
            })
            return response.data
        }
    })

    const pilgrims = pilgrimsData?.data
    const meta = pilgrimsData?.meta
    const packageInfo = packageData?.attributes

    const isSearching = search !== debouncedSearch || isPilgrimsLoading

    // Determine if financial column should be shown
    const selectedGroupLeader = packageData?.relationships?.groupLeaders?.find(gl => gl.id.toString() === groupLeaderId)
    const showFinancialColumn = selectedGroupLeader ? selectedGroupLeader.attributes.trackPayment : false
    const showGroupLeaderColumn = !groupLeaderId

    // Set default selected columns based on context when print modal opens
    useEffect(() => {
        if (showPrintModal) {
            if (groupLeaderId) {
                // Group leader page: show financial if trackPayment is true, no group leader column
                const baseColumns = ['pilgrim', 'nid', 'passport', 'address']
                if (showFinancialColumn) {
                    baseColumns.splice(3, 0, 'financial') // insert before address
                }
                setSelectedColumns(baseColumns)
            } else {
                // All pilgrims page: show group leader column, no financial
                setSelectedColumns(['pilgrim', 'nid', 'passport', 'groupLeader', 'address'])
            }
        }
    }, [showPrintModal, groupLeaderId, showFinancialColumn])

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

    const handlePrint = () => {
        const element = document.getElementById('printable-table')
        if (!element) {
            console.error('Printable table not found')
            return
        }

        // Clone the printable node so we don't disturb the SPA layout
        const clone = element.cloneNode(true)
        clone.id = 'printable-table-clone'
        clone.style.display = 'block'
        clone.style.position = 'static'

        // Minimal CSS for clean printing
        const css = `html, body { margin: 0; padding: 12px; background: #fff; color: #000; font-family: Arial, sans-serif; font-size: 11px; line-height: 1.3; }
        table { width: 100%; border-collapse: collapse; table-layout: auto; font-size: 10px; }
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        th, td { padding: 6px 8px; border: 1px solid #ddd; color: #000; }
        .print-header { text-align: center; margin-bottom: 8px; }
        .print-footer { text-align: center; margin-top: 10px; font-size: 10px; color: #666; }
        @media print { body { -webkit-print-color-adjust: exact; } }
        `

        // Create a hidden iframe to isolate print document
        const iframe = document.createElement('iframe')
        iframe.style.position = 'fixed'
        iframe.style.right = '0'
        iframe.style.bottom = '0'
        iframe.style.width = '0'
        iframe.style.height = '0'
        iframe.style.border = '0'
        iframe.setAttribute('aria-hidden', 'true')
        document.body.appendChild(iframe)

        const doc = iframe.contentWindow.document
        doc.open()
        doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Print</title><style>${css}</style></head><body>${clone.outerHTML}</body></html>`)
        doc.close()

        const doPrintAndCleanup = () => {
            try {
                iframe.contentWindow.focus()
                // Use print in a timeout to ensure rendering is ready
                iframe.contentWindow.print()
            } catch (err) {
                console.error('Print failed:', err)
            } finally {
                setTimeout(() => {
                    if (document.body.contains(iframe)) document.body.removeChild(iframe)
                }, 500)
            }
        }

        // Wait for images to load (if any) and a short render delay
        const imgs = iframe.contentDocument.images
        if (imgs && imgs.length) {
            let loaded = 0
            for (let i = 0; i < imgs.length; i++) {
                imgs[i].onload = imgs[i].onerror = () => {
                    loaded++
                    if (loaded === imgs.length) doPrintAndCleanup()
                }
            }
            // Fallback timeout
            setTimeout(doPrintAndCleanup, 2000)
        } else {
            setTimeout(doPrintAndCleanup, 250)
        }
    }



    const isLoading = isPackageLoading || isPilgrimsLoading

    const columnOptions = [
        { key: 'pilgrim', label: t({ en: 'Pilgrim', bn: 'পিলগ্রিম' }) },
        { key: 'nid', label: t({ en: 'NID & DOB', bn: 'এনআইডি ও জন্ম তারিখ' }) },
        { key: 'passport', label: t({ en: 'Passport', bn: 'পাসপোর্ট' }) },
        ...(showGroupLeaderColumn ? [{ key: 'groupLeader', label: t({ en: 'Group Leader', bn: 'গ্রুপ লিডার' }) }] : []),
        ...(showFinancialColumn ? [{ key: 'financial', label: t({ en: 'Financial Info', bn: 'আর্থিক তথ্য' }) }] : []),
        { key: 'address', label: t({ en: 'Address', bn: 'ঠিকানা' }) },
    ]

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
                        <Button variant="secondary" onClick={() => setShowIDCardModal(true)} className="gap-2">
                            <CreditCard className="h-4 w-4" />
                            {t({ en: "ID Cards", bn: "আইডি কার্ড" })}
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
                                    {packageInfo.status ? 'Active' : 'Inzactive'}
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

                                    <div className="flex items-center justify-between mb-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder={t({ en: "Search pilgrims...", bn: "পিলগ্রিম খুঁজুন..." })}
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="pl-10 pr-10 max-w-lg"
                                            />
                                            {search && !isSearching && (
                                                <button
                                                    onClick={() => setSearch('')}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sheet open={showPrintModal} onOpenChange={setShowPrintModal}>
                                                <SheetTrigger asChild>
                                                    <Button variant="outline" className="gap-2">
                                                        <Printer className="h-4 w-4" />
                                                        {t({ en: "Print", bn: "প্রিন্ট" })}
                                                    </Button>
                                                </SheetTrigger>

                                                <SheetContent side="right" className="w-100 sm:w-112.5 flex flex-col p-0">
                                                    <SheetHeader className="px-5 py-4 border-b border-border/50 shrink-0">
                                                        <SheetTitle className="text-lg">{t({ en: "Select Columns for Print", bn: "প্রিন্টের জন্য কলাম নির্বাচন করুন" })}</SheetTitle>
                                                        <SheetDescription className="text-sm text-muted-foreground">
                                                            {t({ en: "Choose which columns to include in your printout", bn: "প্রিন্টে কোন কলামগুলো অন্তর্ভুক্ত হবে তা নির্বাচন করুন" })}
                                                        </SheetDescription>
                                                    </SheetHeader>

                                                    <div className="flex-1 px-5 py-5">
                                                        <div className="space-y-4">
                                                            <Label className="text-sm font-medium text-foreground">Select columns to include:</Label>
                                                            {columnOptions.map((col) => (
                                                                <div key={col.key} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={col.key}
                                                                        checked={selectedColumns.includes(col.key)}
                                                                        onCheckedChange={(checked) => {
                                                                            if (checked) {
                                                                                setSelectedColumns([...selectedColumns, col.key])
                                                                            } else {
                                                                                setSelectedColumns(selectedColumns.filter(c => c !== col.key))
                                                                            }
                                                                        }}
                                                                    />
                                                                    <label htmlFor={col.key} className="text-sm font-medium cursor-pointer">
                                                                        {col.label}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="px-5 py-4 border-t border-border/50 shrink-0 bg-background">
                                                        <div className="flex gap-3">
                                                            <Button onClick={() => { setShowPrintModal(false); handlePrint(); }} className="flex-1 gap-2">
                                                                <Printer className="h-4 w-4" />
                                                                {t({ en: "Print", bn: "প্রিন্ট" })}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </SheetContent>
                                            </Sheet>
                                        </div>
                                    </div>

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

                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </div>

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

                <IDCardPrintModal
                    open={showIDCardModal}
                    onOpenChange={setShowIDCardModal}
                    pilgrims={pilgrims || []}
                    packageInfo={packageInfo}
                    companyInfo={{
                        name: 'M/S Raj Travel',
                        phone: '+880 1234-567890',
                        email: 'info@rajtravels.com',
                        address: 'Dhaka, Bangladesh',
                    }}
                />

                <PrintableTable
                    pilgrims={pilgrims}
                    selectedColumns={selectedColumns}
                    packageInfo={packageInfo}
                    selectedGroupLeader={selectedGroupLeader}
                    showFinancialColumn={showFinancialColumn}
                    showGroupLeaderColumn={showGroupLeaderColumn}
                />
            </div>
        </DashboardLayout>
    )
}