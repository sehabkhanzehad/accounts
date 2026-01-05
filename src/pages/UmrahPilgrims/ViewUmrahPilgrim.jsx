import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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
    Image
} from 'lucide-react'
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeading from '@/components/PageHeading'
import { Skeleton } from "@/components/ui/skeleton"

export default function ViewUmrahPilgrim() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [showPassportDialog, setShowPassportDialog] = useState(false)

    const { data: umrah, isLoading, error } = useQuery({
        queryKey: ['umrah', id],
        queryFn: async () => {
            const response = await api.get(`/umrahs/${id}`)
            return response.data.data
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
                <div className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded" />
                        <Skeleton className="h-8 w-64" />
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Skeleton className="h-96 lg:col-span-3" />
                        <Skeleton className="h-80" />
                        <Skeleton className="h-80" />
                        <Skeleton className="h-80" />
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
        <DashboardLayout>
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
                            <PageHeading title="Umrah Details" />
                            <p className="text-sm text-muted-foreground mt-1">
                                ID: #{umrah.id}
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
                <Card className="border-2">
                    <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                                <AvatarImage src={user?.avatar} alt={user?.fullName} />
                                <AvatarFallback className="text-2xl font-bold bg-linear-to-br from-primary/20 to-primary/5">
                                    {getInitials(user?.firstName, user?.lastName)}
                                </AvatarFallback>
                            </Avatar>
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
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" />
                                Personal & Family Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Personal Details */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Personal Details</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">First Name</p>
                                        <p className="text-sm font-medium">{user?.firstName || 'N/A'}</p>
                                        {user?.firstNameBangla && (
                                            <p className="text-xs text-muted-foreground">{user.firstNameBangla}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Last Name</p>
                                        <p className="text-sm font-medium">{user?.lastName || 'N/A'}</p>
                                        {user?.lastNameBangla && (
                                            <p className="text-xs text-muted-foreground">{user.lastNameBangla}</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Date of Birth</p>
                                        <p className="text-sm font-medium">
                                            {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground">Marital Status</p>
                                        <p className="text-sm font-medium">{user?.isMarried ? 'Married' : 'Single'}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Family Details */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Family Details</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {user?.fatherName && (
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Father's Name</p>
                                            <p className="text-sm font-medium">{user.fatherName}</p>
                                            {user?.fatherNameBangla && (
                                                <p className="text-xs text-muted-foreground">{user.fatherNameBangla}</p>
                                            )}
                                        </div>
                                    )}
                                    {user?.motherName && (
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Mother's Name</p>
                                            <p className="text-sm font-medium">{user.motherName}</p>
                                            {user?.motherNameBangla && (
                                                <p className="text-xs text-muted-foreground">{user.motherNameBangla}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Identification & Passport Combined */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <IdCard className="h-4 w-4 text-primary" />
                                Identification & Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* ID Documents */}
                            <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Identity Documents</h4>
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
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Passport Details</h4>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Passport Number</p>
                                            <p className="text-sm font-medium">{passport.passportNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Type</p>
                                            <p className="text-sm font-medium capitalize">
                                                {passport.passportType || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Issue Date</p>
                                            <p className="text-sm font-medium">
                                                {passport.issueDate ? new Date(passport.issueDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                }) : 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-muted-foreground">Expiry Date</p>
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
                                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Passport Details</h4>
                                    <div className="text-center py-4 text-muted-foreground">
                                        <FileText className="h-8 w-8 mx-auto mb-1 opacity-50" />
                                        <p className="text-xs">No passport information</p>
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
                                Registration Timeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div>
                                    <p className="text-[10px] text-muted-foreground">Registered On</p>
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
                                        <p className="text-[10px] text-muted-foreground">Last Updated</p>
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
                                src={passport.filePath}
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
        </DashboardLayout>
    )
}
