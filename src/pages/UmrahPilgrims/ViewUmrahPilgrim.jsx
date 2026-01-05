import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PassportModal } from './components/PassportModal'
import { EditPersonalInfoModal } from './components/EditPersonalInfoModal'
import { EditContactInfoModal } from './components/EditContactInfoModal'
import { EditAvatarModal } from './components/EditAvatarModal'
import { toast } from 'sonner'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    Calendar,
    CreditCard,
    FileText,
    Users,
    Package,
    MapPin,
    IdCard,
    Heart,
    Clock,
    Image,
    Edit,
    Plus,
    Check,
    XCircle,
    RotateCw,
    EllipsisVertical
} from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeading from '@/components/PageHeading'
import { Skeleton } from "@/components/ui/skeleton"

export default function ViewUmrahPilgrim() {
    const { id } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { t, language } = useI18n()
    const [showPassportDialog, setShowPassportDialog] = useState(false)
    const [showPassportModal, setShowPassportModal] = useState(false)
    const [editingPassport, setEditingPassport] = useState(null)
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false)
    const [showContactInfoModal, setShowContactInfoModal] = useState(false)
    const [showAvatarModal, setShowAvatarModal] = useState(false)

    // Status action dialogs
    const [showConfirmCancel, setShowConfirmCancel] = useState(false)
    const [showConfirmComplete, setShowConfirmComplete] = useState(false)
    const [showConfirmRestore, setShowConfirmRestore] = useState(false)

    const { data: umrah, isLoading, error } = useQuery({
        queryKey: ['umrah', id],
        queryFn: async () => {
            const response = await api.get(`/umrahs/${id}`)
            return response.data.data
        }
    })

    const addPassportMutation = useMutation({
        mutationFn: (formData) => api.post(`/umrahs/${id}/passport`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowPassportModal(false)
            setEditingPassport(null)
            toast.success(t({ en: 'Passport added successfully', bn: 'পাসপোর্ট সফলভাবে অ্যাড করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to add passport', bn: 'পাসপোর্ট অ্যাড করতে ব্যর্থ' }))
        }
    })

    const updatePassportMutation = useMutation({
        mutationFn: (formData) => {
            const passportId = umrah?.relationships?.passport?.id
            return api.post(`/umrahs/passport/${passportId}?_method=PUT`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowPassportModal(false)
            setEditingPassport(null)
            toast.success(t({ en: 'Passport updated successfully', bn: 'পাসপোর্ট সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update passport', bn: 'পাসপোর্ট আপডেট করতে ব্যর্থ' }))
        }
    })

    const handlePassportSubmit = (formData) => {
        if (editingPassport) {
            updatePassportMutation.mutate(formData)
        } else {
            addPassportMutation.mutate(formData)
        }
    }

    const handleAddPassport = () => {
        setEditingPassport(null)
        setShowPassportModal(true)
    }

    const handleEditPassport = () => {
        if (passport) {
            setEditingPassport(passport)
            setShowPassportModal(true)
        }
    }

    // Personal Info mutation
    const updatePersonalInfoMutation = useMutation({
        mutationFn: (data) => api.put(`/umrahs/${id}/pilgrim/personal-info`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowPersonalInfoModal(false)
            toast.success(t({ en: 'Personal information updated successfully', bn: 'ব্যক্তিগত তথ্য সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update personal information', bn: 'ব্যক্তিগত তথ্য আপডেট করতে ব্যর্থ' }))
        }
    })

    // Contact Info mutation
    const updateContactInfoMutation = useMutation({
        mutationFn: (data) => api.put(`/umrahs/${id}/pilgrim/contact-info`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowContactInfoModal(false)
            toast.success(t({ en: 'Contact & identification updated successfully', bn: 'যোগাযোগ এবং পরিচয় সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update contact & identification', bn: 'যোগাযোগ এবং পরিচয় আপডেট করতে ব্যর্থ' }))
        }
    })

    // Avatar mutation
    const updateAvatarMutation = useMutation({
        mutationFn: (formData) => api.post(`/umrahs/${id}/pilgrim/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowAvatarModal(false)
            toast.success(t({ en: 'Photo updated successfully', bn: 'ছবি সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update photo', bn: 'ছবি আপডেট করতে ব্যর্থ' }))
        }
    })

    // Status actions
    const markAsCanceledMutation = useMutation({
        mutationFn: () => api.post(`/umrahs/${id}/cancel`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowConfirmCancel(false)
            toast.success(t({ en: 'Umrah marked as canceled', bn: 'উমরাহ বাতিল করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to cancel umrah', bn: 'উমরাহ বাতিল করতে ব্যর্থ' }))
        }
    })

    const markAsCompletedMutation = useMutation({
        mutationFn: () => api.post(`/umrahs/${id}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowConfirmComplete(false)
            toast.success(t({ en: 'Umrah marked as completed', bn: 'উমরাহ সম্পন্ন হিসেবে চিহ্নিত হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to mark as completed', bn: 'সমাপ্ত হিসেবে চিহ্নিত করতে ব্যর্থ' }))
        }
    })

    const restoreMutation = useMutation({
        mutationFn: () => api.post(`/umrahs/${id}/restore`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah', id] })
            setShowConfirmRestore(false)
            toast.success(t({ en: 'Umrah restored to active status', bn: 'উমরাহ পুনরায় সক্রিয় করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to restore umrah', bn: 'উমরাহ পুনরুদ্ধার করতে ব্যর্থ' }))
        }
    })

    useEffect(() => {
        if (error) {
            navigate('/umrah')
        }
    }, [error, navigate])

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="space-y-6 pb-8">
                    {/* Header Skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <Skeleton className="h-6 w-40 mb-2" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                        <div className="space-y-2 text-right">
                            <Skeleton className="h-5 w-20 rounded" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>

                    {/* Profile Card Skeleton */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Skeleton className="h-24 w-24 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-32" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </div>
                        <div className="shrink-0 space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>

                    {/* Main Content Grid Skeleton */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <Skeleton className="h-80 w-full" />
                        <Skeleton className="h-80 w-full" />
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!umrah) return null

    const user = umrah.relationships?.pilgrim?.relationships?.user?.attributes
    const groupLeader = umrah.relationships?.groupLeader?.attributes
    const packageData = umrah.relationships?.package?.attributes
    const passport = umrah.relationships?.passport?.attributes

    const statusColors = {
        registered: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    }

    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : ''
        const last = lastName ? lastName.charAt(0).toUpperCase() : ''
        return `${first}${last}` || 'U'
    }

    return (
        <DashboardLayout
            breadcrumbs={[
                { type: 'link', text: t('app.home'), href: '/' },
                { type: 'link', text: t({ en: 'Umrah Pilgrims', bn: 'উমরাহ পিলগ্রিম' }), href: '/umrah' },
                { type: 'page', text: t({ en: 'Pilgrim Details', bn: ' পিলগ্রিম বিস্তারিত' }) },
            ]}
        >
            <div className="space-y-6 pb-8">
                {/* Header with Back Button and Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate('/umrah')}
                            className="shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <PageHeading title={t({ en: "Pilgrim Details", bn: "পিলগ্রিম বিস্তারিত" })} />
                            <p className="text-sm text-muted-foreground mt-1">
                                {t({ en: "ID", bn: "আইডি" })}: #{umrah.id}
                            </p>
                        </div>
                    </div>
                    <div className="text-right space-y-2">
                        <Badge className={`capitalize text-xs px-3 py-1 ${statusColors[umrah.attributes.status] || 'bg-gray-100 text-gray-800'}`}>
                            {umrah.attributes.status}
                        </Badge>
                        {groupLeader?.groupName && (
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">{groupLeader.groupName}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Card with Avatar */}
                <Card className="border-2 relative">
                    {/* Status action menu (top-right of card) - Hide if completed and no passport */}
                    {!(umrah.attributes.status === 'completed' && !passport) && (
                        <div className="absolute top-4 right-4 z-10">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-1">
                                        <EllipsisVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    {/* When registered: Complete + Cancel */}
                                    {umrah.attributes.status === 'registered' && (
                                        <>
                                            <DropdownMenuItem onClick={() => setShowConfirmComplete(true)} disabled={markAsCompletedMutation.isPending} className="gap-2">
                                                <Check className="h-4 w-4 text-green-600" />
                                                <span className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Mark as Completed', bn: 'সম্পন্ন হিসেবে চিহ্নিত করুন' })}</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setShowConfirmCancel(true)} className="text-destructive gap-2" disabled={markAsCanceledMutation.isPending}>
                                                <XCircle className="h-4 w-4" />
                                                <span className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Cancel Umrah', bn: 'উমরাহ বাতিল করুন' })}</span>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    {/* When cancelled: Restore */}
                                    {umrah.attributes.status === 'cancelled' && (
                                        <DropdownMenuItem onClick={() => setShowConfirmRestore(true)} disabled={restoreMutation.isPending} className="gap-2">
                                            <RotateCw className="h-4 w-4" />
                                            <span className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Restore Umrah', bn: 'উমরাহ পুনরুদ্ধার করুন' })}</span>
                                        </DropdownMenuItem>
                                    )}

                                    {/* Always available: View Passports (if any) */}
                                    {passport && (
                                        <DropdownMenuItem onClick={() => setShowPassportDialog(true)} className="gap-2">
                                            <Image className="h-4 w-4" />
                                            <span className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'View Passport', bn: 'পাসপোর্ট দেখুন' })}</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}

                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarImage src={user?.avatar} alt={user?.fullName} />
                                    <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-primary/20 to-primary/5">
                                        {getInitials(user?.firstName, user?.lastName)}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    onClick={() => setShowAvatarModal(true)}
                                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-md"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">{user?.fullName || 'N/A'}</h2>
                                    {user?.fullNameBangla && (
                                        <p className="text-lg text-muted-foreground">{user.fullNameBangla}</p>
                                    )}
                                </div>
                                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                                    {user?.phone && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Phone className="h-3 w-3" />
                                            {user.phone}
                                        </Badge>
                                    )}
                                    {user?.email && (
                                        <Badge variant="secondary" className="gap-1">
                                            <Mail className="h-3 w-3" />
                                            {user.email}
                                        </Badge>
                                    )}
                                    {user?.gender && (
                                        <Badge variant="outline" className="capitalize">
                                            {user.gender}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            {packageData && (
                                <div className="text-center sm:text-right space-y-2 shrink-0">
                                    <div>
                                        <p className="text-xs text-muted-foreground mb-1">Package</p>
                                        <p className="text-lg font-semibold">{packageData.name}</p>
                                    </div>
                                    {packageData.price && (
                                        <div>
                                            <p className="text-xs text-muted-foreground mb-1">Price</p>
                                            <p className="text-xl font-bold text-green-600 dark:text-green-400">৳{parseFloat(packageData.price).toLocaleString()}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Grid */}
                <div className="grid gap-4 lg:grid-cols-2">
                    {/* Personal & Family Information Combined */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <User className="h-4 w-4 text-primary" />
                                    {t({ en: "Personal Information", bn: "পার্সোনাল তথ্য" })}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPersonalInfoModal(true)}
                                    className="h-8 gap-1"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    {t({ en: "Edit", bn: "এডিট" })}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Personal Details */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    {t({ en: "Personal Details", bn: "ব্যক্তিগত তথ্য" })}
                                </h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">{t({ en: "First Name", bn: "প্রথম নাম" })}</p>
                                        <p className="text-sm font-medium">{user?.firstName || t({ en: "N/A", bn: "নেই" })}</p>
                                        {user?.firstNameBangla && (
                                            <p className="text-xs text-muted-foreground">{user.firstNameBangla}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">{t({ en: "Last Name", bn: "শেষ নাম" })}</p>
                                        <p className="text-sm font-medium">{user?.lastName || t({ en: "N/A", bn: "নেই" })}</p>
                                        {user?.lastNameBangla && (
                                            <p className="text-xs text-muted-foreground">{user.lastNameBangla}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">{t({ en: "Date of Birth", bn: "জন্ম তারিখ" })}</p>
                                        <p className="text-sm font-medium">
                                            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            }) : t({ en: "N/A", bn: "নেই" })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">{t({ en: "Marital Status", bn: "বৈবাহিক অবস্থা" })}</p>
                                        <p className="text-sm font-medium">{user?.isMarried ? t({ en: "Married", bn: "বিবাহিত" }) : t({ en: "Single", bn: "অবিবাহিত" })}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Family Details */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    {t({ en: "Family Details", bn: "পারিবারিক তথ্য" })}
                                </h4>
                                {!user?.fatherName && !user?.motherName ? (
                                    <div className="text-center py-3 text-muted-foreground">
                                        <p className="text-xs">{t({ en: "No family information available", bn: "কোন পারিবারিক তথ্য নেই" })}</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {user?.fatherName && (
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Father's Name", bn: "পিতার নাম" })}</p>
                                                <p className="text-sm font-medium">{user.fatherName}</p>
                                                {user?.fatherNameBangla && (
                                                    <p className="text-xs text-muted-foreground">{user.fatherNameBangla}</p>
                                                )}
                                            </div>
                                        )}
                                        {user?.motherName && (
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Mother's Name", bn: "মায়ের নাম" })}</p>
                                                <p className="text-sm font-medium">{user.motherName}</p>
                                                {user?.motherNameBangla && (
                                                    <p className="text-xs text-muted-foreground">{user.motherNameBangla}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Identification & Passport Combined */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <IdCard className="h-4 w-4 text-primary" />
                                    {t({ en: "Identification & Documents", bn: "আইডেন্টিটিফিকেশন ও ডকুমেন্টস" })}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowContactInfoModal(true)}
                                    className="h-8 gap-1"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                    {t({ en: "Edit", bn: "এডিট" })}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* ID Documents */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                    {t({ en: "Identity", bn: "আইডেন্টিটি" })}
                                </h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">National ID (NID)</p>
                                        <p className="text-sm font-medium">{user?.nid || 'N/A'}</p>
                                    </div>
                                    {user?.birthCertificateNumber && (
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Birth Certificate</p>
                                            <p className="text-sm font-medium">{user.birthCertificateNumber}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Passport Information */}
                            {passport ? (
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                            {t({ en: "Passport Details", bn: "পাসপোর্টের বিস্তারিত" })}
                                        </h4>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleEditPassport}
                                            className="h-7 gap-1"
                                        >
                                            <Edit className="h-3 w-3" />
                                            {t({ en: "Edit", bn: "এডিট" })}
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">{t({ en: "Passport Number", bn: "পাসপোর্ট নম্বর" })}</p>
                                            <p className="text-sm font-medium">{passport.passportNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">{t({ en: "Type", bn: "টাইপ" })}</p>
                                            <p className="text-sm font-medium capitalize">
                                                {passport.passportType || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">{t({ en: "Issue Date", bn: "ইস্যু ডেট" })}</p>
                                            <p className="text-sm font-medium">
                                                {passport.issueDate ? new Date(passport.issueDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">{t({ en: "Expiry Date", bn: "এক্সপায়ারি ডেট" })}</p>
                                            <p className={`text-sm font-medium ${passport.expiryDate && new Date(passport.expiryDate) < new Date()
                                                ? 'text-red-600 dark:text-red-400'
                                                : ''
                                                }`}>
                                                {passport.expiryDate ? new Date(passport.expiryDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                        {passport.notes && (
                                            <div className="col-span-2">
                                                <p className="text-[10px] text-muted-foreground">Notes</p>
                                                <p className="text-sm font-medium">{passport.notes}</p>
                                            </div>
                                        )}
                                        {passport.filePath && (
                                            <div className="col-span-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowPassportDialog(true)}
                                                    className="w-full"
                                                >
                                                    <Image className="h-4 w-4" /> View Passport
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        {t({ en: "Passport Details", bn: "পাসপোর্টের বিস্তারিত" })}
                                    </h4>
                                    <div className="text-center py-4 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                        <p className="text-xs mb-3">{t({ en: "No passport information", bn: "কোন পাসপোর্ট তথ্য নেই" })}</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAddPassport}
                                            className="gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            {t({ en: "Add Passport", bn: "পাসপোর্ট যোগ করুন" })}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Registration Timeline */}
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" />
                                {t({ en: "Registration Timeline", bn: "রেজিস্ট্রেশন টাইমলাইন" })}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Registered On", bn: "রেজিস্ট্রেশন তারিখ" })}</p>
                                    <p className="text-sm font-medium">
                                        {new Date(umrah.attributes.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                {umrah.attributes.updatedAt !== umrah.attributes.createdAt && (
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">{t({ en: "Last Updated", bn: "শেষ আপডেট" })}</p>
                                        <p className="text-sm font-medium">
                                            {new Date(umrah.attributes.updatedAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Passport Image Dialog */}
            <Dialog open={showPassportDialog} onOpenChange={setShowPassportDialog}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>Passport - {passport?.passportNumber}</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center items-center p-4">
                        {passport?.filePath ? (
                            <img
                                src={`${passport.filePath}?t=${Date.now()}`}
                                alt="Passport"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                                onError={(e) => {
                                    e.target.src = ''
                                    e.target.alt = 'Failed to load passport image'
                                    e.target.className = 'text-muted-foreground'
                                }}
                            />
                        ) : (
                            <p className="text-muted-foreground">No passport image available</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Passport Management Modal */}
            <PassportModal
                open={showPassportModal}
                onOpenChange={setShowPassportModal}
                editingPassport={editingPassport}
                onSubmit={handlePassportSubmit}
                isSubmitting={addPassportMutation.isPending || updatePassportMutation.isPending}
            />

            {/* Confirm Cancel Dialog */}
            <Dialog open={showConfirmCancel} onOpenChange={setShowConfirmCancel}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Confirm Cancel', bn: 'বাতিল নিশ্চিতকরণ' })}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className={`text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>{t({ en: 'Are you sure you want to cancel this Umrah?', bn: 'আপনি কি নিশ্চিত যে আপনি এই উমরাহ বাতিল করতে চান?' })}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmCancel(false)} disabled={markAsCanceledMutation.isPending} className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Cancel', bn: 'বাতিল' })}</Button>
                        <Button variant="destructive" onClick={() => markAsCanceledMutation.mutate()} disabled={markAsCanceledMutation.isPending} className={language === 'bn' ? 'font-bengali' : ''}>
                            {markAsCanceledMutation.isPending ? t({ en: 'Cancelling...', bn: 'বাতিল হচ্ছে...' }) : t({ en: 'Yes, Cancel', bn: 'হ্যাঁ, বাতিল করুন' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Complete Dialog */}
            <Dialog open={showConfirmComplete} onOpenChange={setShowConfirmComplete}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Confirm Complete', bn: 'সম্পন্ন নিশ্চিতকরণ' })}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className={`text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>{t({ en: 'Mark this Umrah as completed?', bn: 'আপনি কি এই উমরাহ সম্পন্ন হিসেবে চিহ্নিত করতে চান?' })}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmComplete(false)} disabled={markAsCompletedMutation.isPending} className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Cancel', bn: 'বাতিল' })}</Button>
                        <Button variant="secondary" onClick={() => markAsCompletedMutation.mutate()} disabled={markAsCompletedMutation.isPending} className={language === 'bn' ? 'font-bengali' : ''}>
                            {markAsCompletedMutation.isPending ? t({ en: 'Completing...', bn: 'সম্পন্ন হচ্ছে...' }) : t({ en: 'Yes, Complete', bn: 'হ্যাঁ, সম্পন্ন করুন' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Restore Dialog */}
            <Dialog open={showConfirmRestore} onOpenChange={setShowConfirmRestore}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Confirm Restore', bn: 'পুনরুদ্ধার নিশ্চিতকরণ' })}</DialogTitle>
                    </DialogHeader>
                    <div className="py-2">
                        <p className={`text-sm ${language === 'bn' ? 'font-bengali' : ''}`}>{t({ en: 'Restore this Umrah to active status?', bn: 'আপনি কি এই উমরাহ পুনরায় সক্রিয় করতে চান?' })}</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmRestore(false)} disabled={restoreMutation.isPending} className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Cancel', bn: 'বাতিল' })}</Button>
                        <Button variant="default" onClick={() => restoreMutation.mutate()} disabled={restoreMutation.isPending} className={language === 'bn' ? 'font-bengali' : ''}>
                            {restoreMutation.isPending ? t({ en: 'Restoring...', bn: 'পুনরুদ্ধার হচ্ছে...' }) : t({ en: 'Yes, Restore', bn: 'হ্যাঁ, পুনরুদ্ধার করুন' })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Personal Info Edit Modal */}
            <EditPersonalInfoModal
                open={showPersonalInfoModal}
                onOpenChange={setShowPersonalInfoModal}
                pilgrimData={user}
                onSubmit={(data) => updatePersonalInfoMutation.mutate(data)}
                isSubmitting={updatePersonalInfoMutation.isPending}
            />

            {/* Contact Info Edit Modal */}
            <EditContactInfoModal
                open={showContactInfoModal}
                onOpenChange={setShowContactInfoModal}
                pilgrimData={user}
                onSubmit={(data) => updateContactInfoMutation.mutate(data)}
                isSubmitting={updateContactInfoMutation.isPending}
            />

            {/* Avatar Edit Modal */}
            <EditAvatarModal
                open={showAvatarModal}
                onOpenChange={setShowAvatarModal}
                currentAvatar={user?.avatar}
                onSubmit={(formData) => updateAvatarMutation.mutate(formData)}
                isSubmitting={updateAvatarMutation.isPending}
            />
        </DashboardLayout>
    )
}
