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
import { ArrowLeft } from 'lucide-react'

const umrahSchema = z.object({
    group_leader_id: z.string().min(1, "Group leader is required"),
    pilgrim_type: z.enum(['existing', 'new']),
    pilgrim_id: z.string().optional(),
    new_pilgrim: z.object({
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

export default function CreateUmrah() {
    const navigate = useNavigate()
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
                    // Always include boolean fields
                    if (key === 'is_married') {
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

            toast.success('Umrah created successfully')
            navigate('/umrah')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create umrah')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
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
                        title="Create Umrah"
                        description="Register a pilgrim for Umrah"
                    />
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Select group leader and package</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="group_leader_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Group Leader *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select group leader" />
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
                                                <FormLabel>Package *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select package" />
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
                                <CardTitle>Pilgrim Information</CardTitle>
                                <CardDescription>Select existing pilgrim or create new</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="pilgrim_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pilgrim Type *</FormLabel>
                                            <Select onValueChange={handlePilgrimTypeChange} value={field.value || ""}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select pilgrim type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="existing">Existing Pilgrim</SelectItem>
                                                    <SelectItem value="new">New Pilgrim</SelectItem>
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
                                                <FormLabel>Pilgrim *</FormLabel>
                                                <Select onValueChange={handlePilgrimChange} value={field.value || ""}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select pilgrim" />
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
                                                Personal Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.first_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>First Name (English) *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter first name" {...field} />
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
                                                            <FormLabel>First Name (Bangla) *</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="প্রথম নাম বাংলায়" {...field} />
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
                                                            <FormLabel>Last Name (English)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter last name" {...field} />
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
                                                            <FormLabel>Last Name (Bangla)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="শেষ নাম বাংলায়" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Parent Information */}
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                                                Parent Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.father_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Father Name (English)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter father name" {...field} />
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
                                                            <FormLabel>Father Name (Bangla)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="পিতার নাম বাংলায়" {...field} />
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
                                                            <FormLabel>Mother Name (English)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter mother name" {...field} />
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
                                                            <FormLabel>Mother Name (Bangla)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="মাতার নাম বাংলায়" {...field} />
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
                                                Contact Information
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Email</FormLabel>
                                                            <FormControl>
                                                                <Input type="email" placeholder="example@email.com" {...field} />
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
                                                            <FormLabel>Phone</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="+880 1XXX-XXXXXX" {...field} />
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
                                                Personal Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.gender"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Gender *</FormLabel>
                                                            <Select onValueChange={field.onChange} value={field.value || ""}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select gender" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="male">Male</SelectItem>
                                                                    <SelectItem value="female">Female</SelectItem>
                                                                    <SelectItem value="other">Other</SelectItem>
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
                                                            <FormLabel>Date of Birth</FormLabel>
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
                                                            <FormLabel>Marital Status</FormLabel>
                                                            <Select
                                                                onValueChange={(value) => field.onChange(value === 'true')}
                                                                value={field.value ? 'true' : 'false'}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder="Select status" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="false">Single</SelectItem>
                                                                    <SelectItem value="true">Married</SelectItem>
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
                                                Identification Documents
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.nid"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>NID Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter NID number" {...field} />
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
                                                            <FormLabel>Birth Certificate Number</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter birth certificate number" {...field} />
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
                                <CardTitle>Passport Information (Optional)</CardTitle>
                                <CardDescription>
                                    {pilgrimType === 'existing'
                                        ? 'Select existing passport, add new passport, or skip'
                                        : 'Add new passport or skip'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="passport_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport Option</FormLabel>
                                            <Select
                                                onValueChange={handlePassportTypeChange}
                                                value={field.value || ""}
                                            >
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select passport option" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">No Passport</SelectItem>
                                                    {pilgrimType === 'existing' && (
                                                        <SelectItem value="existing">Existing Passport</SelectItem>
                                                    )}
                                                    <SelectItem value="new">New Passport</SelectItem>
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
                                                                    ? "Loading passports..."
                                                                    : availablePassports.length === 0
                                                                        ? "No passports available"
                                                                        : "Select passport"
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
                                        <h4 className="font-semibold text-foreground">New Passport Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="new_passport.passport_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Passport Number *</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Enter passport number" {...field} />
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
                                                        <FormLabel>Passport Type *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value || ""}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select type" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="ordinary">Ordinary</SelectItem>
                                                                <SelectItem value="official">Official</SelectItem>
                                                                <SelectItem value="diplomatic">Diplomatic</SelectItem>
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
                                                        <FormLabel>Issue Date *</FormLabel>
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
                                                        <FormLabel>Expiry Date *</FormLabel>
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
                                                        <FormLabel>Passport Scan/Photo</FormLabel>
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
                                                        <FormLabel>Notes</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="Additional notes"
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
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Umrah'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    )
}
