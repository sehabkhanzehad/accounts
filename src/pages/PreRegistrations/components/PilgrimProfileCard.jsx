import { useState } from 'react'
import { User, Phone, Mail, EllipsisVertical, Image, Plus, Edit } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from '@/contexts/I18nContext'

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
    const first = firstName?.charAt(0)?.toUpperCase() || ''
    const last = lastName?.charAt(0)?.toUpperCase() || ''
    return first + last || 'U'
}

export function PilgrimProfileCard({
    preRegistration,
    user,
    pilgrimName,
    passport,
    onShowAvatarModal,
    onShowPassportDialog,
    onShowMarkAsRegisteredModal
}) {
    const { t, language } = useI18n()
    const avatarColor = getAvatarColor(pilgrimName)

    return (
        <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    {t({ en: "Profile", bn: "প্রোফাইল" })}
                </CardTitle>

                {/* Status action menu */}
                {passport?.attributes?.filePath || preRegistration?.attributes?.status === "pending" && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <EllipsisVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Always available: View Passports (if any) */}
                            {passport && (
                                <DropdownMenuItem onClick={onShowPassportDialog} className="gap-2">
                                    <Image className="h-4 w-4" />
                                    <span className={language === 'bn' ? 'font-bengali' : ''}>{t({ en: 'View Passport', bn: 'পাসপোর্ট দেখুন' })}</span>
                                </DropdownMenuItem>
                            )}
                            {preRegistration?.attributes?.status === "pending" && (
                                <DropdownMenuItem onClick={onShowMarkAsRegisteredModal} className="gap-2">
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
                            onClick={onShowAvatarModal}
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
    )
}