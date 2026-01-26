import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PassportModal } from './components/PassportModal'
import { EditPersonalInfoModal } from './components/EditPersonalInfoModal'
import { EditContactInfoModal } from './components/EditContactInfoModal'
import { EditAvatarModal } from './components/EditAvatarModal'
import { EditAddressModal } from './components/EditAddressModal'
import { EditRegistrationModal } from './components/EditRegistrationModal'
import { MarkAsRegisteredModal } from './components/MarkAsRegisteredModal'
import { toast } from 'sonner'
import { useI18n } from '@/contexts/I18nContext'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
    MapPin,
    IdCard,
    Clock,
    Image,
    Edit,
    Plus,
    Check,
    XCircle,
    RotateCw,
    EllipsisVertical,
    Eye,
    Printer,
    Receipt
} from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeading from '@/components/PageHeading'
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import AppPagination from '@/components/app/AppPagination'

// Generate consistent random color based on name
const getAvatarColor = (name) => {
    const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-yellow-500',
        'bg-lime-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-sky-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
    ]

    const str = name || 'default'
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
}

export default function ViewPreRegistration() {
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
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [showRegistrationModal, setShowRegistrationModal] = useState(false)
    const [showMarkAsRegisteredModal, setShowMarkAsRegisteredModal] = useState(false)

    // Transaction details modal
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState(null)

    // Timestamp for cache busting
    const [passportTimestamp, setPassportTimestamp] = useState(0)

    const handleOpenPassportDialog = () => {
        setPassportTimestamp(Date.now())
        setShowPassportDialog(true)
    }

    // Transaction pagination
    const [currentPage, setCurrentPage] = useState(1)
    const rowsPerPage = 10

    const { data: preRegistration, isLoading, error } = useQuery({
        queryKey: ['preRegistration', id],
        queryFn: async () => {
            const response = await api.get(`/pre-registrations/${id}`)
            return response.data.data
        },
    })

    const addPassportMutation = useMutation({
        mutationFn: (formData) => api.post(`/pre-registrations/${id}/passport`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
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
            const passportId = preRegistration?.relationships?.passport?.id
            return api.post(`/pre-registrations/passport/${passportId}?_method=PUT`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
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
        mutationFn: (data) => api.put(`/pre-registrations/${id}/pilgrim/personal-info`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
            setShowPersonalInfoModal(false)
            toast.success(t({ en: 'Personal information updated successfully', bn: 'ব্যক্তিগত তথ্য সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update personal information', bn: 'ব্যক্তিগত তথ্য আপডেট করতে ব্যর্থ' }))
        }
    })

    // Contact Info mutation
    const updateContactInfoMutation = useMutation({
        mutationFn: (data) => api.put(`/pre-registrations/${id}/pilgrim/contact-info`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
            setShowContactInfoModal(false)
            toast.success(t({ en: 'Contact & identification updated successfully', bn: 'যোগাযোগ এবং পরিচয় সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update contact & identification', bn: 'যোগাযোগ এবং পরিচয় আপডেট করতে ব্যর্থ' }))
        }
    })

    // Avatar mutation
    const updateAvatarMutation = useMutation({
        mutationFn: (formData) => api.post(`/pre-registrations/${id}/pilgrim/avatar`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
            setShowAvatarModal(false)
            toast.success(t({ en: 'Photo updated successfully', bn: 'ছবি সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update photo', bn: 'ছবি আপডেট করতে ব্যর্থ' }))
        }
    })

    // Address mutation
    const updateAddressMutation = useMutation({
        mutationFn: (data) => api.put(`/pre-registrations/${id}/pilgrim/addresses`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
            setShowAddressModal(false)
            toast.success(t({ en: 'Address updated successfully', bn: 'ঠিকানা সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update address', bn: 'ঠিকানা আপডেট করতে ব্যর্থ' }))
        }
    })

    // Pre-registration details mutation
    const updatePreRegDetailsMutation = useMutation({
        mutationFn: (data) => api.put(`/pre-registrations/${id}/pilgrim/update-pre-registration`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
            setShowRegistrationModal(false)
            toast.success(t({ en: 'Pre-registration details updated successfully', bn: 'প্রি-রেজিস্ট্রেশন বিস্তারিত সফলভাবে আপডেট করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to update pre-registration details', bn: 'প্রি-রেজিস্ট্রেশন বিস্তারিত আপডেট করতে ব্যর্থ' }))
        }
    })

    // Mark as registered mutation
    const markAsRegisteredMutation = useMutation({
        mutationFn: (data) => api.put(`/pre-registrations/${id}/mark-as-registered`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['preRegistration', id] })
            setShowMarkAsRegisteredModal(false)
            toast.success(t({ en: 'Marked as registered successfully', bn: 'সফলভাবে রেজিস্টার্ড হিসেবে চিহ্নিত করা হয়েছে' }))
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || t({ en: 'Failed to mark as registered', bn: 'রেজিস্টার্ড হিসেবে চিহ্নিত করতে ব্যর্থ' }))
        }
    })

    useEffect(() => {
        if (error) toast.error(t({ en: 'Failed to load pre-registration details', bn: 'প্রি-রেজিস্ট্রেশন বিস্তারিত লোড করতে ব্যর্থ' }))
    }, [error, t])

    // Fetch transactions for this pre-registration
    const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
        queryKey: ['pre-registration-transactions', id, currentPage, rowsPerPage],
        queryFn: async () => {
            const response = await api.get(`/pre-registrations/${id}/transactions`, {
                params: {
                    page: currentPage,
                    per_page: rowsPerPage,
                }
            })
            return response.data
        },
        enabled: !!id
    })

    const transactions = transactionsData?.data || []
    const transactionsMeta = transactionsData?.meta

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

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-100">
                    <div className="text-center">
                        <p className="text-destructive mb-4">
                            {t({ en: 'Failed to load pre-registration details', bn: 'প্রি-রেজিস্ট্রেশন বিস্তারিত লোড করতে ব্যর্থ' })}
                        </p>
                        <Button onClick={() => navigate('/pre-registrations')} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t({ en: 'Go Back', bn: 'ফিরে যান' })}
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!preRegistration) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-100">
                    <div className="text-center">
                        <p className="text-muted-foreground mb-4">
                            {t({ en: 'Pre-registration not found', bn: 'প্রি-রেজিস্ট্রেশন পাওয়া যায়নি' })}
                        </p>
                        <Button onClick={() => navigate('/pre-registrations')} variant="outline">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            {t({ en: 'Go Back', bn: 'ফিরে যান' })}
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    const pilgrim = preRegistration.relationships?.pilgrim
    const user = pilgrim?.relationships?.user?.attributes
    const pilgrimName = user ? `${user.firstName} ${user.lastName ?? ""}` : 'N/A'
    const avatarColor = getAvatarColor(pilgrimName)
    const passport = preRegistration.relationships?.passport

    // Address data for modals
    const presentAddress = pilgrim?.relationships?.user?.relationships?.presentAddress
    const permanentAddress = pilgrim?.relationships?.user?.relationships?.permanentAddress

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'active': return 'bg-green-100 text-green-800'
            case 'registered': return 'bg-blue-100 text-blue-800'
            case 'archived': return 'bg-gray-100 text-gray-800'
            case 'transferred': return 'bg-purple-100 text-purple-800'
            case 'cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getInitials = (firstName, lastName) => {
        const first = firstName ? firstName.charAt(0).toUpperCase() : ''
        const last = lastName ? lastName.charAt(0).toUpperCase() : ''
        return `${first}${last}` || 'P'
    }

    return (
        <DashboardLayout
            breadcrumbs={[
                { type: 'link', text: t({ en: 'Home', bn: 'হোম' }), href: '/' },
                { type: 'link', text: t({ en: 'Pre-Registrations', bn: 'প্রি-রেজিস্ট্রেশন' }), href: '/pre-registrations' },
                { type: 'page', text: t({ en: 'Pre-Registration Details', bn: 'প্রি-রেজিস্ট্রেশন বিস্তারিত' }) },
            ]}
        >
            <div className="space-y-6 pb-8">
                {/* Header with Status */}
                <div className="flex items-center justify-between">
                    <div>
                        <PageHeading title={t({ en: "Pre-Registration Details", bn: "প্রি-রেজিস্ট্রেশন বিস্তারিত" })} />
                        <p className="text-sm text-muted-foreground mt-1">
                            {t({ en: "ID", bn: "আইডি" })}: #{preRegistration.id}
                        </p>
                    </div>
                    <div className="text-right space-y-2">
                        {preRegistration.relationships?.groupLeader?.attributes?.groupName && (
                            <div className="flex items-center gap-2 text-sm">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">{preRegistration.relationships.groupLeader.attributes.groupName}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Card with Avatar */}
                <Card className="border-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            {t({ en: "Profile", bn: "প্রোফাইল" })}
                        </CardTitle>

                        {/* Status action menu */}
                        {passport || preRegistration?.attributes?.status === "pending" && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                        <EllipsisVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {/* Always available: View Passports (if any) */}
                                    {passport && (
                                        <DropdownMenuItem onClick={handleOpenPassportDialog} className="gap-2">
                                            <Image className="h-4 w-4" />
                                            <span className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'View Passport', bn: 'পাসপোর্ট দেখুন' })}</span>
                                        </DropdownMenuItem>
                                    )}
                                    {preRegistration?.attributes?.status === "pending" && (
                                        <DropdownMenuItem onClick={() => setShowMarkAsRegisteredModal(true)} className="gap-2">
                                            <Plus className="h-4 w-4" />
                                            <span className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'Mark as Registered', bn: 'রেজিস্টার্ড হিসেবে চিহ্নিত করুন' })}</span>
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </CardHeader>

                    <CardContent>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <div className="relative">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                    <AvatarImage src={user?.avatar} alt={pilgrimName} />
                                    <AvatarFallback className={`text-2xl font-bold ${avatarColor} text-white`}>
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
                                    <h2 className="text-2xl font-bold tracking-tight">{pilgrimName}</h2>
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
                                    <Badge className={`capitalize text-xs px-3 py-1 ${getStatusColor(preRegistration.attributes.status)}`}>
                                        {preRegistration.attributes.status}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for different sections */}
                <Tabs defaultValue="profile">
                    <TabsList>
                        <TabsTrigger value="profile">{t({ en: 'Profile', bn: 'প্রোফাইল' })}</TabsTrigger>
                        <TabsTrigger value="address">{t({ en: 'Address', bn: 'ঠিকানা' })}</TabsTrigger>
                        <TabsTrigger value="registration">{t({ en: 'Registration Details', bn: 'রেজিস্ট্রেশন বিস্তারিত' })}</TabsTrigger>
                        <TabsTrigger value="transactions">{t({ en: 'Transactions', bn: 'লেনদেন' })}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile">
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Personal & Family Information Combined */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <User className="h-4 w-4 text-primary" />
                                            {t({ en: "Personal Information", bn: "ব্যক্তিগত তথ্য" })}
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
                                            {user?.occupation && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Occupation", bn: "পেশা" })}</p>
                                                    <p className="text-sm font-medium">{user.occupation}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Family Details */}
                                    <div>
                                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                            {t({ en: "Family Details", bn: "পারিবারিক তথ্য" })}
                                        </h4>
                                        {!user?.fatherName && !user?.motherName && !user?.spouseName ? (
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
                                                {user?.spouseName && (
                                                    <div>
                                                        <p className="text-[10px] text-muted-foreground">{t({ en: "Spouse Name", bn: "স্বামী/স্ত্রীর নাম" })}</p>
                                                        <p className="text-sm font-medium">{user.spouseName}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Identification & Documents */}
                            <Card>
                                <CardHeader>
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
                                                    <p className="text-sm font-medium">{passport.attributes?.passportNumber}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Type", bn: "টাইপ" })}</p>
                                                    <p className="text-sm font-medium capitalize">
                                                        {passport.attributes?.passportType || 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Issue Date", bn: "ইস্যু ডেট" })}</p>
                                                    <p className="text-sm font-medium">
                                                        {passport.attributes?.issueDate ? new Date(passport.attributes.issueDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Expiry Date", bn: "এক্সপায়ারি ডেট" })}</p>
                                                    <p className={`text-sm font-medium ${passport.attributes?.expiryDate && new Date(passport.attributes.expiryDate) < new Date()
                                                        ? 'text-red-600 dark:text-red-400'
                                                        : ''
                                                        }`}>
                                                        {passport.attributes?.expiryDate ? new Date(passport.attributes.expiryDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        }) : 'N/A'}
                                                    </p>
                                                </div>
                                                {passport.attributes?.notes && (
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] text-muted-foreground">Notes</p>
                                                        <p className="text-sm font-medium">{passport.attributes.notes}</p>
                                                    </div>
                                                )}
                                                {passport.attributes?.filePath && (
                                                    <div className="col-span-2 pt-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleOpenPassportDialog}
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
                        </div>
                    </TabsContent>

                    <TabsContent value="address">
                        <Card className="w-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        {t({ en: "Address", bn: "ঠিকানা" })}
                                    </CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowAddressModal(true)}
                                        className="h-8 gap-1"
                                    >
                                        <Edit className="h-3.5 w-3.5" />
                                        {t({ en: "Edit", bn: "এডিট" })}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Present Address */}
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        {t({ en: "Present Address", bn: "বর্তমান ঠিকানা" })}
                                    </h4>
                                    {pilgrim?.relationships?.user?.relationships?.presentAddress?.attributes ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                            {pilgrim.relationships.user.relationships.presentAddress.attributes.house_no && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "House No.", bn: "বাড়ি নং" })}</p>
                                                    <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.house_no}</p>
                                                </div>
                                            )}
                                            {pilgrim.relationships.user.relationships.presentAddress.attributes.road_no && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Road No.", bn: "রোড নং" })}</p>
                                                    <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.road_no}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Village", bn: "গ্রাম" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.village || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Post Office", bn: "পোস্ট অফিস" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.post_office || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Police Station", bn: "থানা" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.police_station || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "District", bn: "জেলা" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.district || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Division", bn: "বিভাগ" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.division || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Postal Code", bn: "পোস্টাল কোড" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.postal_code || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            {pilgrim.relationships.user.relationships.presentAddress.attributes.country && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Country", bn: "দেশ" })}</p>
                                                    <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.presentAddress.attributes.country}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-3 text-muted-foreground">
                                            <p className="text-xs">{t({ en: "No present address available", bn: "কোন বর্তমান ঠিকানা নেই" })}</p>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Permanent Address */}
                                <div>
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                        {t({ en: "Permanent Address", bn: "স্থায়ী ঠিকানা" })}
                                    </h4>
                                    {pilgrim?.relationships?.user?.relationships?.permanentAddress?.attributes ? (
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                            {pilgrim.relationships.user.relationships.permanentAddress.attributes.house_no && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "House No.", bn: "বাড়ি নং" })}</p>
                                                    <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.house_no}</p>
                                                </div>
                                            )}
                                            {pilgrim.relationships.user.relationships.permanentAddress.attributes.road_no && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Road No.", bn: "রোড নং" })}</p>
                                                    <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.road_no}</p>
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Village", bn: "গ্রাম" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.village || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Post Office", bn: "পোস্ট অফিস" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.post_office || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Police Station", bn: "থানা" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.police_station || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "District", bn: "জেলা" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.district || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Division", bn: "বিভাগ" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.division || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground">{t({ en: "Postal Code", bn: "পোস্টাল কোড" })}</p>
                                                <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.postal_code || t({ en: "N/A", bn: "নেই" })}</p>
                                            </div>
                                            {pilgrim.relationships.user.relationships.permanentAddress.attributes.country && (
                                                <div>
                                                    <p className="text-[10px] text-muted-foreground">{t({ en: "Country", bn: "দেশ" })}</p>
                                                    <p className="text-sm font-medium">{pilgrim.relationships.user.relationships.permanentAddress.attributes.country}</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-3 text-muted-foreground">
                                            <p className="text-xs">{t({ en: "No permanent address available", bn: "কোন স্থায়ী ঠিকানা নেই" })}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="registration">
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Pre-registration Details */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            {t({ en: "Pre-registration Details", bn: "প্রি-রেজিস্ট্রেশন বিস্তারিত" })}
                                        </CardTitle>
                                        {preRegistration?.attributes?.status !== 'pending' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setShowRegistrationModal(true)}
                                                className="h-8 gap-1"
                                            >
                                                <Edit className="h-3.5 w-3.5" />
                                                {t({ en: "Edit", bn: "এডিট" })}
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {preRegistration?.attributes?.status === 'pending' ? (
                                        <div className="flex items-center justify-center h-32 text-muted-foreground">
                                            <div className="text-center">
                                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">
                                                    {t({ en: "Registration details will be available here", bn: "রেজিস্ট্রেশন বিস্তারিত এখানে উপলব্ধ হবে" })}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {t({ en: "Serial No", bn: "সিরিয়াল নং" })}
                                                </Label>
                                                <p className="text-sm font-medium">
                                                    {preRegistration?.attributes?.serialNo || '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {t({ en: "Tracking No", bn: "ট্র্যাকিং নং" })}
                                                </Label>
                                                <p className="text-sm font-medium">
                                                    {preRegistration?.attributes?.trackingNo || '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {t({ en: "Voucher No", bn: "ভাউচার নং" })}
                                                </Label>
                                                <p className="text-sm font-medium">
                                                    {preRegistration?.attributes?.bankVoucherNo || '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {t({ en: "Voucher Name", bn: "ভাউচার নাম" })}
                                                </Label>
                                                <p className="text-sm font-medium">
                                                    {preRegistration?.attributes?.voucherName || '-'}
                                                </p>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {t({ en: "Date", bn: "তারিখ" })}
                                                </Label>
                                                <p className="text-sm font-medium">
                                                    {preRegistration?.attributes?.date ? new Date(preRegistration.attributes.date).toLocaleDateString() : '-'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Registration Details - Placeholder for future */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Check className="h-4 w-4 text-primary" />
                                        {t({ en: "Registration Details", bn: "রেজিস্ট্রেশন বিস্তারিত" })}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                                        <div className="text-center">
                                            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">
                                                {t({ en: "Registration details will be available here", bn: "রেজিস্ট্রেশন বিস্তারিত এখানে উপলব্ধ হবে" })}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="transactions">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-primary" />
                                    {t({ en: "Transaction History", bn: "লেনদেন ইতিহাস" })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isTransactionsLoading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                ) : transactions.length > 0 ? (
                                    <>
                                        <div className="rounded-lg border bg-card overflow-hidden shadow-sm">
                                            <Table>
                                                <TableHeader className="bg-muted/50">
                                                    <TableRow className="hover:bg-transparent border-b">
                                                        <TableHead className="font-semibold">{t({ en: 'Date', bn: 'তারিখ' })}</TableHead>
                                                        <TableHead className="font-semibold">{t({ en: 'Title', bn: 'শিরোনাম' })}</TableHead>
                                                        <TableHead className="font-semibold">{t({ en: 'Type', bn: 'ধরন' })}</TableHead>
                                                        <TableHead className="font-semibold">{t({ en: 'Voucher', bn: 'ভাউচার' })}</TableHead>
                                                        <TableHead className="text-right font-semibold">{t({ en: 'Amount', bn: 'পরিমাণ' })}</TableHead>
                                                        <TableHead className="text-right font-semibold w-24">{t({ en: 'Actions', bn: 'ক্রিয়া' })}</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {transactions.map((transaction) => (
                                                        <TableRow key={transaction.id} className="hover:bg-muted/30 transition-colors">
                                                            <TableCell className="font-medium text-sm">
                                                                {new Date(transaction.attributes.date).toLocaleDateString('en-GB')}
                                                            </TableCell>
                                                            <TableCell className="font-medium text-sm">{transaction.attributes.title}</TableCell>
                                                            <TableCell>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`capitalize font-medium ${transaction.attributes.type === 'income'
                                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                                                        }`}
                                                                >
                                                                    {transaction.attributes.type === 'expense' ? t({ en: 'Refund', bn: 'রিফান্ড' }) : t({ en: 'Income', bn: 'আয়' })}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-sm text-muted-foreground">
                                                                {transaction.attributes.voucherNo || '-'}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                <span className={`font-semibold text-sm ${transaction.attributes.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {transaction.attributes.type === 'income' ? '+' : '-'}৳{parseFloat(transaction.attributes.amount).toFixed(2)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center justify-end gap-1.5">
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="h-8 px-3 rounded-sm"
                                                                        onClick={() => {
                                                                            setSelectedTransaction(transaction)
                                                                            setShowTransactionModal(true)
                                                                        }}
                                                                        title={t({ en: 'View Details', bn: 'বিস্তারিত দেখুন' })}
                                                                    >
                                                                        <Eye className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="secondary"
                                                                        size="sm"
                                                                        className="h-8 px-3 rounded-sm"
                                                                        onClick={() => toast.info('Print feature coming soon!')}
                                                                        title="Print Receipt"
                                                                    >
                                                                        <Printer className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {transactionsMeta && transactionsMeta.last_page > 1 && (
                                            <div className="flex justify-center mt-4">
                                                <AppPagination
                                                    currentPage={currentPage}
                                                    totalPages={transactionsMeta.last_page}
                                                    onPageChange={setCurrentPage}
                                                />
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            {t({ en: 'No transactions found', bn: 'কোন লেনদেন পাওয়া যায়নি' })}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>


                {/* Transaction Details Modal */}
                <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                        </DialogHeader>
                        {selectedTransaction && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Date</label>
                                        <p className="text-sm">{new Date(selectedTransaction.attributes.date || selectedTransaction.attributes.createdAt).toLocaleDateString('en-GB')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                                        <p className="text-sm capitalize">{selectedTransaction.attributes.type}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Title</label>
                                    <p className="text-sm">{selectedTransaction.attributes.title}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                                    <p className="text-sm">{selectedTransaction.attributes.description || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Voucher No</label>
                                    <p className="text-sm">{selectedTransaction.attributes.voucherNo || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Amount</label>
                                    <p className={`text-lg font-semibold ${selectedTransaction.attributes.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedTransaction.attributes.type === 'income' ? '+' : '-'}৳{parseFloat(selectedTransaction.attributes.amount).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Passport Image Dialog */}
                <Dialog open={showPassportDialog} onOpenChange={setShowPassportDialog}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                            <DialogTitle>Passport - {passport?.attributes?.passportNumber}</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center items-center p-4">
                            {passport?.attributes?.filePath ? (
                                <img
                                    src={`${passport.attributes.filePath}?t=${passportTimestamp}`}
                                    alt="Passport"
                                    className="max-w-full h-auto rounded-lg shadow-lg"
                                />
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                    <p>No passport image available</p>
                                </div>
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

                {/* Address Edit Modal */}
                <EditAddressModal
                    open={showAddressModal}
                    onOpenChange={setShowAddressModal}
                    addressData={{ presentAddress, permanentAddress }}
                    onSubmit={(data) => updateAddressMutation.mutate(data)}
                    isSubmitting={updateAddressMutation.isPending}
                />

                {/* Registration Details Edit Modal */}
                <EditRegistrationModal
                    open={showRegistrationModal}
                    onOpenChange={setShowRegistrationModal}
                    registrationData={preRegistration}
                    onSubmit={(data) => updatePreRegDetailsMutation.mutate(data)}
                    isSubmitting={updatePreRegDetailsMutation.isPending}
                />

                {/* Mark as Registered Modal */}
                <MarkAsRegisteredModal
                    open={showMarkAsRegisteredModal}
                    onOpenChange={setShowMarkAsRegisteredModal}
                    onSubmit={(data) => markAsRegisteredMutation.mutate(data)}
                    isSubmitting={markAsRegisteredMutation.isPending}
                />
            </div>
        </DashboardLayout>
    )
}