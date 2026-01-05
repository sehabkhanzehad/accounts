import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from 'sonner'
import api from '@/lib/api'
import PageHeading from '@/components/PageHeading'
import DashboardLayout from '@/Layouts/DashboardLayout'
import { useI18n } from '@/contexts/I18nContext'
import { ArrowLeft } from 'lucide-react'

const umrahSchema = z.object({
    group_leader_id: z.string().min(1, "Group leader is required"),
    pilgrim_type: z.enum(['existing', 'new']),
    pilgrim_id: z.string().optional(),
    new_pilgrim: z.object({
        avatar: z.any().optional(),
        first_name: z.string().min(1, "First name is required"),
        first_name_bangla: z.string().min(1, "First name (Bangla) is required"),
        last_name: z.string().optional(),
        last_name_bangla: z.string().optional(),
        mother_name: z.string().optional(),
        mother_name_bangla: z.string().optional(),
        father_name: z.string().optional(),
        father_name_bangla: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        gender: z.enum(['male', 'female', 'other'], {
            required_error: "Gender is required",
            invalid_type_error: "Please select a gender",
        }),
        is_married: z.boolean(),
        nid: z.string().optional(),
        birth_certificate_number: z.string().optional(),
        date_of_birth: z.string().optional(),
    }).optional(),
    package_id: z.string().min(1, "Package is required"),
    passport_type: z.enum(['existing', 'new', 'none']),
    passport_id: z.string().optional(),
    new_passport: z.object({
        passport_number: z.string().optional(),
        issue_date: z.string().optional(),
        expiry_date: z.string().optional(),
        passport_type: z.string().optional(),
        file: z.any().optional(),
        notes: z.string().optional(),
    }).optional(),
}).superRefine((data, ctx) => {
    const pilgrimType = data.pilgrim_type

    if (pilgrimType === 'existing') {
        if (!data.pilgrim_id || data.pilgrim_id.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select an existing pilgrim",
                path: ["pilgrim_id"]
            })
        }
    } else if (pilgrimType === 'new') {
        if (!data.new_pilgrim) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please fill in new pilgrim details",
                path: ["new_pilgrim", "first_name"]
            })
        }
    }

    // Passport validation
    const passportType = data.passport_type
    if (passportType === 'existing') {
        if (!data.passport_id || data.passport_id.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select an existing passport",
                path: ["passport_id"]
            })
        }
    } else if (passportType === 'new') {
        if (!data.new_passport?.passport_number || data.new_passport.passport_number.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passport number is required",
                path: ["new_passport", "passport_number"]
            })
        }
        if (!data.new_passport?.issue_date || data.new_passport.issue_date.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Issue date is required",
                path: ["new_passport", "issue_date"]
            })
        }
        if (!data.new_passport?.expiry_date || data.new_passport.expiry_date.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Expiry date is required",
                path: ["new_passport", "expiry_date"]
            })
        }
        if (!data.new_passport?.passport_type || data.new_passport.passport_type.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passport type is required",
                path: ["new_passport", "passport_type"]
            })
        }
        // Validate passport type enum value
        if (data.new_passport?.passport_type && !['ordinary', 'official', 'diplomatic'].includes(data.new_passport.passport_type)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select a valid passport type",
                path: ["new_passport", "passport_type"]
            })
        }
    }
    // If passport_type is 'none', no validation needed
})

export default function CreateUmrahPilgrim() {
    const navigate = useNavigate()
    const { t, language } = useI18n()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pilgrimType, setPilgrimType] = useState('new')
    const [passportType, setPassportType] = useState('new')
    const [availablePassports, setAvailablePassports] = useState([])
    const [loadingPassports, setLoadingPassports] = useState(false)

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

    const form = useForm({
        resolver: zodResolver(umrahSchema),
        defaultValues: {
            group_leader_id: '',
            pilgrim_type: 'new',
            pilgrim_id: '',
            new_pilgrim: {
                avatar: null,
                first_name: '',
                first_name_bangla: '',
                last_name: '',
                last_name_bangla: '',
                mother_name: '',
                mother_name_bangla: '',
                father_name: '',
                father_name_bangla: '',
                email: '',
                phone: '',
                gender: '',
                is_married: false,
                nid: '',
                birth_certificate_number: '',
                date_of_birth: '',
            },
            package_id: '',
            passport_type: 'new',
            passport_id: '',
            new_passport: {
                passport_number: '',
                issue_date: '',
                expiry_date: '',
                passport_type: '',
                file: null,
                notes: '',
            },
        }
    })

    const fetchPilgrimPassports = async (pilgrimId) => {
        if (!pilgrimId) {
            setAvailablePassports([])
            return
        }

        setLoadingPassports(true)
        try {
            const response = await api.get(`/umrahs/passports?pilgrim_id=${pilgrimId}`)
            setAvailablePassports(response.data.data || [])
        } catch (error) {
            console.error('Error fetching passports:', error)
            setAvailablePassports([])
        } finally {
            setLoadingPassports(false)
        }
    }

    const handlePilgrimChange = (pilgrimId) => {
        form.setValue('pilgrim_id', pilgrimId)
        fetchPilgrimPassports(pilgrimId)
        setPassportType('none')
        form.setValue('passport_type', 'none')
        form.setValue('passport_id', '')
    }

    const handlePilgrimTypeChange = (value) => {
        setPilgrimType(value)
        form.setValue('pilgrim_type', value)

        if (value === 'existing') {
            form.clearErrors(['new_pilgrim'])
        } else if (value === 'new') {
            form.clearErrors('pilgrim_id')
        }

        setPassportType('none')
        setAvailablePassports([])
        form.setValue('passport_type', 'none')
        form.setValue('passport_id', '')
    }

    const handlePassportTypeChange = (value) => {
        setPassportType(value)
        form.setValue('passport_type', value)

        if (value === 'existing') {
            form.clearErrors(['new_passport'])
        } else if (value === 'new' || value === 'none') {
            form.clearErrors('passport_id')
        }
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            const formData = new FormData()

            formData.append('group_leader_id', data.group_leader_id)
            formData.append('package_id', data.package_id)

            const pilgrimType = data.pilgrim_type
            if (pilgrimType === 'existing') {
                formData.append('pilgrim_id', data.pilgrim_id)
            } else {
                Object.keys(data.new_pilgrim).forEach(key => {
                    const value = data.new_pilgrim[key]
                    // Handle file uploads separately
                    if (key === 'avatar') {
                        if (value instanceof File) {
                            formData.append(`new_pilgrim[${key}]`, value)
                        }
                    }
                    // Always include boolean fields
                    else if (key === 'is_married') {
                        formData.append(`new_pilgrim[${key}]`, value ? '1' : '0')
                    } else if (value !== undefined && value !== '') {
                        formData.append(`new_pilgrim[${key}]`, value)
                    }
                })
            }

            const passportType = data.passport_type
            if (passportType === 'existing' && data.passport_id) {
                formData.append('passport_id', data.passport_id)
            } else if (passportType === 'new' && data.new_passport) {
                const hasAnyPassportField = Object.entries(data.new_passport).some(([key, val]) => {
                    if (key === 'file') return false
                    return val && String(val).trim().length > 0
                })

                if (hasAnyPassportField) {
                    Object.keys(data.new_passport).forEach(key => {
                        if (key === 'file') {
                            if (data.new_passport.file) {
                                formData.append('new_passport[file]', data.new_passport.file)
                            }
                        } else if (data.new_passport[key] !== undefined && data.new_passport[key] !== '') {
                            formData.append(`new_passport[${key}]`, data.new_passport[key])
                        }
                    })
                }
            }

            await api.post('/umrahs', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            toast.success(t({ en: 'Umrah created successfully', bn: 'উমরাহ সফলভাবে তৈরি হয়েছে' }))
            navigate('/umrah')
        } catch (error) {
            toast.error(error.response?.data?.message || t({ en: 'Failed to create umrah', bn: 'উমরাহ তৈরি করতে ব্যর্থ' }))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout
            breadcrumbs={[
                { type: 'link', text: t('app.home'), href: '/' },
                { type: 'link', text: t({ en: 'Umrah Pilgrims', bn: 'উমরাহ পিলগ্রিম' }), href: '/umrah' },
                { type: 'page', text: t({ en: 'Add Umrah Pilgrim', bn: 'অ্যাড উমরাহ পিলগ্রিম' }) },
            ]}
        >
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/umrah')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <PageHeading
                        title={t({ en: 'Add Umrah Pilgrim', bn: 'অ্যাড উমরাহ পিলগ্রিম' })}
                        description={t({ en: 'Add a pilgrim for Umrah', bn: 'একজন পিলগ্রিমকে উমরাহর জন্য অ্যাড করুন' })}
                    />
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t({ en: 'Basic Information', bn: 'বেসিক ইনফরমেশন' })}</CardTitle>
                                <CardDescription>{t({ en: 'Select group leader and package', bn: 'গ্রুপ লিডার এবং প্যাকেজ নির্বাচন করুন' })}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="group_leader_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Group Leader *', bn: 'গ্রুপ লিডার *' })}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder={t({ en: 'Select group leader', bn: 'গ্রুপ লিডার নির্বাচন করুন' })} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {groupLeaders?.map((leader) => (
                                                            <SelectItem key={leader.id} value={leader.id.toString()}>
                                                                {leader.attributes.groupName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="package_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Package *', bn: 'প্যাকেজ *' })}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder={t({ en: 'Select package', bn: 'প্যাকেজ নির্বাচন করুন' })} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {packages?.map((pkg) => (
                                                            <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                                                {pkg.attributes.name} - ৳{pkg.attributes.price}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pilgrim Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t({ en: 'Pilgrim Information', bn: 'পিলগ্রিম তথ্য' })}</CardTitle>
                                <CardDescription>{t({ en: 'Select existing pilgrim or create new', bn: 'এক্সিস্টিং পিলগ্রিম সিলেক্ট অথবা নতুন তৈরি করুন' })}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="pilgrim_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Pilgrim Type *', bn: 'পিলগ্রিম টাইপ *' })}</FormLabel>
                                            <Select onValueChange={handlePilgrimTypeChange} value={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={t({ en: 'Select pilgrim type', bn: 'পিলগ্রিম টাইপ নির্বাচন করুন' })} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="existing">{t({ en: 'Existing Pilgrim', bn: 'এক্সিস্টিং পিলগ্রিম' })}</SelectItem>
                                                    <SelectItem value="new">{t({ en: 'New Pilgrim', bn: 'নতুন পিলগ্রিম' })}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {pilgrimType === 'existing' ? (
                                    <FormField
                                        control={form.control}
                                        name="pilgrim_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Pilgrim *', bn: 'পিলগ্রিম *' })}</FormLabel>
                                                <Select onValueChange={handlePilgrimChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder={t({ en: 'Select pilgrim', bn: 'পিলগ্রিম নির্বাচন করুন' })} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {pilgrims?.map((pilgrim) => (
                                                            <SelectItem key={pilgrim.id} value={pilgrim.id.toString()}>
                                                                {pilgrim.attributes.firstName} {pilgrim.attributes.lastName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <div className="space-y-6">
                                        {/* Personal Information - English & Bangla Names */}
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                                                {t({ en: 'Personal Information', bn: 'ব্যক্তিগত তথ্য' })}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {/* Name fields - Take 2 columns */}
                                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.first_name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'First Name (English) *', bn: 'প্রথম নাম (ইংরেজি) *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter first name', bn: 'প্রথম নাম লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.first_name_bangla"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'First Name (Bangla) *', bn: 'প্রথম নাম (বাংলা) *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter first name (Bangla)', bn: 'প্রথম নাম বাংলায় লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.last_name"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Last Name (English)', bn: 'শেষ নাম (ইংরেজি)' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter last name', bn: 'শেষ নাম লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.last_name_bangla"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Last Name (Bangla)', bn: 'শেষ নাম (বাংলা)' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter last name (Bangla)', bn: 'শেষ নাম বাংলায় লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                {/* Avatar Upload - Takes 1 column */}
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.avatar"
                                                    render={({ field: { value, onChange, ...field } }) => (
                                                        <FormItem className="flex flex-col items-center justify-center h-full">
                                                            <div className="flex flex-col">
                                                                <FormLabel className="mb-2">{t({ en: 'Photo', bn: 'ছবি' })}</FormLabel>
                                                                <FormControl>
                                                                    <ImageUpload
                                                                        value={value instanceof File ? URL.createObjectURL(value) : value}
                                                                        onChange={(file) => onChange(file)}
                                                                        onRemove={() => onChange(null)}
                                                                    />
                                                                </FormControl>
                                                            </div>
                                                            <FormMessage className="text-center" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Parent Information */}
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                                                {t({ en: 'Parent Information', bn: 'অভিভাবক তথ্য' })}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.father_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Father Name (English)', bn: 'পিতার নাম (ইংরেজি)' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter father name', bn: 'পিতার নাম লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.father_name_bangla"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Father Name (Bangla)', bn: 'পিতার নাম (বাংলা)' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter father name (Bangla)', bn: 'পিতার নাম বাংলায় লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.mother_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Mother Name (English)', bn: 'মাতার নাম (ইংরেজি)' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter mother name', bn: 'মাতার নাম লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.mother_name_bangla"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Mother Name (Bangla)', bn: 'মাতার নাম (বাংলা)' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter mother name (Bangla)', bn: 'মাতার নাম বাংলায় লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                                                {t({ en: 'Contact Information', bn: 'যোগাযোগ তথ্য' })}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Email', bn: 'ইমেইল' })}</FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder={t({ en: 'example@email.com', bn: 'example@email.com' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Phone', bn: 'ফোন' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: '+880 1XXX-XXXXXX', bn: '+880 1XXX-XXXXXX' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Personal Details */}
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                                                {t({ en: 'Personal Details', bn: 'ব্যক্তিগত তথ্য' })}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.gender"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Gender *', bn: 'লিঙ্গ *' })}</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder={t({ en: 'Select gender', bn: 'লিঙ্গ নির্বাচন করুন' })} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="male">{t({ en: 'Male', bn: 'পুরুষ' })}</SelectItem>
                                                                    <SelectItem value="female">{t({ en: 'Female', bn: 'মহিলা' })}</SelectItem>
                                                                    <SelectItem value="other">{t({ en: 'Other', bn: 'অন্যান্য' })}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.date_of_birth"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Date of Birth', bn: 'জন্ম তারিখ' })}</FormLabel>
                                                            <FormControl>
                                                                <Input type="date" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.is_married"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Marital Status', bn: 'বৈবাহিক অবস্থা' })}</FormLabel>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(value === 'true')}
                                                                value={field.value ? 'true' : 'false'}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder={t({ en: 'Select status', bn: 'অবস্থা নির্বাচন করুন' })} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="false">{t({ en: 'Single', bn: 'অবিবাহিত' })}</SelectItem>
                                                                    <SelectItem value="true">{t({ en: 'Married', bn: 'বিবাহিত' })}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Identification Documents */}
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                                                {t({ en: 'Identification', bn: 'পরিচয়' })}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.nid"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'NID Number', bn: 'এনআইডি নম্বর' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter NID number', bn: 'এনআইডি নম্বর লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.birth_certificate_number"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Birth Certificate Number', bn: 'জন্ম সনদ নম্বর' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter birth certificate number', bn: 'জন্ম সনদ নম্বর লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Passport Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t({ en: 'Passport Information (Optional)', bn: 'পাসপোর্ট তথ্য (অপশনাল)' })}</CardTitle>
                                <CardDescription>
                                    {pilgrimType === 'existing'
                                        ? t({ en: 'Select existing passport, add new passport, or skip', bn: 'এক্সিস্টিং পাসপোর্ট সিলেক্ট, নতুন পাসপোর্ট যোগ করুন অথবা স্কিপ করুন' })
                                        : t({ en: 'Add new passport or skip', bn: 'নতুন পাসপোর্ট যোগ করুন অথবা স্কিপ করুন' })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="passport_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Passport Option', bn: 'পাসপোর্ট অপশন' })}</FormLabel>
                                            <Select
                                                onValueChange={handlePassportTypeChange}
                                                value={field.value || ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder={t({ en: 'Select passport option', bn: 'পাসপোর্ট অপশন নির্বাচন করুন' })} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">{t({ en: 'No Passport', bn: 'নো পাসপোর্ট' })}</SelectItem>
                                                    {pilgrimType === 'existing' && (
                                                        <SelectItem value="existing">{t({ en: 'Existing Passport', bn: 'এক্সিস্টিং পাসপোর্ট' })}</SelectItem>
                                                    )}
                                                    <SelectItem value="new">{t({ en: 'New Passport', bn: 'নতুন পাসপোর্ট' })}</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {passportType === 'existing' && pilgrimType === 'existing' && (
                                    <FormField
                                        control={form.control}
                                        name="passport_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Select Passport</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder={
                                                                loadingPassports
                                                                    ? t({ en: 'Loading passports...', bn: 'পাসপোর্ট লোড হচ্ছে...' })
                                                                    : availablePassports.length === 0
                                                                        ? t({ en: 'No passports available', bn: 'কোন পাসপোর্ট নেই' })
                                                                        : t({ en: 'Select passport', bn: 'পাসপোর্ট নির্বাচন করুন' })
                                                            } />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availablePassports?.map((passport) => (
                                                            <SelectItem key={passport.id} value={passport.id.toString()}>
                                                                {passport.attributes.passportNumber} - Exp: {passport.attributes.expiryDate}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {passportType === 'new' && (
                                    <div className="space-y-4 border rounded-lg p-4">
                                        <h4 className="font-semibold text-foreground">{t({ en: 'New Passport Details', bn: 'নতুন পাসপোর্টের বিবরণ' })}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="new_passport.passport_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Passport Number *', bn: 'পাসপোর্ট নম্বর *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder={t({ en: 'Enter passport number', bn: 'পাসপোর্ট নম্বর লিখুন' })} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="new_passport.passport_type"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Passport Type *', bn: 'পাসপোর্ট টাইপ *' })}</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder={t({ en: 'Select type', bn: 'টাইপ নির্বাচন করুন' })} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="ordinary">{t({ en: 'Ordinary', bn: 'সাধারণ' })}</SelectItem>
                                                                <SelectItem value="official">{t({ en: 'Official', bn: 'সরকারি' })}</SelectItem>
                                                                <SelectItem value="diplomatic">{t({ en: 'Diplomatic', bn: 'কূটনৈতিক' })}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="new_passport.issue_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Issue Date *', bn: 'ইস্যু তারিখ *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="new_passport.expiry_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Expiry Date *', bn: 'মেয়াদ শেষের তারিখ *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input type="date" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="new_passport.file"
                                                render={({ field: { value, onChange, ...field } }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Passport Scan/Photo', bn: 'পাসপোর্ট স্ক্যান/ছবি' })}</FormLabel>
                                                        <FormControl>
                                                            <ImageUpload
                                                                value={value instanceof File ? URL.createObjectURL(value) : value}
                                                                onChange={(file) => onChange(file)}
                                                                onRemove={() => onChange(null)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="new_passport.notes"
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>{t({ en: 'Notes', bn: 'নোটস' })}</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder={t({ en: 'Additional notes', bn: 'অতিরিক্ত নোট' })}
                                                                className="resize-none flex-1"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex gap-4 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/umrah')}
                                disabled={isSubmitting}
                            >
                                {t({ en: 'Cancel', bn: 'বাতিল' })}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t({ en: 'Creating...', bn: 'তৈরি করা হচ্ছে...' }) : t({ en: 'Create Umrah', bn: 'উমরাহ তৈরি করুন' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    )
}
