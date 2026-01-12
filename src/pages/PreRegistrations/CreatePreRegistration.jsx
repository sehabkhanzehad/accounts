import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '@/contexts/I18nContext'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from '@/lib/api'
import DashboardLayout from '@/Layouts/DashboardLayout'
import PageHeading from '@/components/PageHeading'
import { ImageUpload } from "@/components/ui/image-upload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Upload, ChevronDown } from 'lucide-react'

const preRegistrationSchema = z.object({
    group_leader_id: z.string().min(1, "Group leader is required"),
    status: z.enum(['active', 'pending']),
    serial_no: z.string().optional(),
    tracking_no: z.string().optional(),
    bank_voucher_no: z.string().optional(),
    voucher_name: z.string().optional(),
    date: z.string().optional(),
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
        occupation: z.string().optional(),
        spouse_name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        gender: z.enum(['male', 'female', 'other'], {
            required_error: "Gender is required",
            invalid_type_error: "Please select a gender",
        }),
        is_married: z.boolean(),
        nid: z.string().min(1, "NID is required"),
        birth_certificate_number: z.string().optional(),
        date_of_birth: z.string().min(1, "Date of birth is required"),
        present_address: z.object({
            house_no: z.string().optional(),
            road_no: z.string().optional(),
            village: z.string().min(1, "Village is required"),
            post_office: z.string().min(1, "Post office is required"),
            police_station: z.string().min(1, "Police station is required"),
            district: z.string().min(1, "District is required"),
            division: z.string().min(1, "Division is required"),
            postal_code: z.string().min(1, "Postal code is required"),
            country: z.string().optional(),
        }),
        permanent_address: z.object({
            house_no: z.string().optional(),
            road_no: z.string().optional(),
            village: z.string().optional(),
            post_office: z.string().optional(),
            police_station: z.string().optional(),
            district: z.string().optional(),
            division: z.string().optional(),
            postal_code: z.string().optional(),
            country: z.string().optional(),
        }).optional(),
    }).optional(),
    same_as_present_address: z.boolean(),
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
    // Status-based validation - required when status is 'active'
    console.log('Superrefine data:', data);
    if (data.status === 'active') {
        if (!data.serial_no || data.serial_no.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Serial No is required when status is active",
                path: ["serial_no"],
            });
        }
        if (!data.tracking_no || data.tracking_no.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Tracking No is required when status is active",
                path: ["tracking_no"],
            });
        }
        if (!data.bank_voucher_no || data.bank_voucher_no.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Bank Voucher No is required when status is active",
                path: ["bank_voucher_no"],
            });
        }
        if (!data.voucher_name || data.voucher_name.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Voucher Name is required when status is active",
                path: ["voucher_name"],
            });
        }
        if (!data.date || data.date.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Date is required when status is active",
                path: ["date"],
            });
        }
    }

    // Pilgrim validation
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

    // Validate passport type based on pilgrim type
    if (data.pilgrim_type === 'new' && data.passport_type === 'existing') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Existing passport option is not available for new pilgrims",
            path: ["passport_type"]
        })
    }

    // Address validation - when addresses are different, permanent address is required
    if (data.pilgrim_type === 'new' && !data.same_as_present_address) {
        const pa = data.new_pilgrim?.permanent_address

        // Validate each required field
        if (!pa?.village || pa.village.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Village is required",
                path: ["new_pilgrim", "permanent_address", "village"]
            })
        }
        if (!pa?.post_office || pa.post_office.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Post office is required",
                path: ["new_pilgrim", "permanent_address", "post_office"]
            })
        }
        if (!pa?.police_station || pa.police_station.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Police station is required",
                path: ["new_pilgrim", "permanent_address", "police_station"]
            })
        }
        if (!pa?.district || pa.district.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "District is required",
                path: ["new_pilgrim", "permanent_address", "district"]
            })
        }
        if (!pa?.division || pa.division.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Division is required",
                path: ["new_pilgrim", "permanent_address", "division"]
            })
        }
        if (!pa?.postal_code || pa.postal_code.trim() === '') {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Postal code is required",
                path: ["new_pilgrim", "permanent_address", "postal_code"]
            })
        }
    }
})

export default function CreatePreRegistration() {

    const navigate = useNavigate()
    const { t } = useI18n()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [pilgrimType, setPilgrimType] = useState('new')
    const [passportType, setPassportType] = useState('new')
    const [availablePassports, setAvailablePassports] = useState([])
    const [loadingPassports, setLoadingPassports] = useState(false)
    const queryClient = useQueryClient()

    const [selectedPilgrim, setSelectedPilgrim] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const dropdownRef = useRef(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const { data: groupLeaders } = useQuery({
        queryKey: ['pre-registrations-group-leaders'],
        queryFn: async () => {
            const response = await api.get('/pre-registrations/group-leaders')
            return response.data.data
        },
        enabled: true
    })

    const { data: pilgrims } = useQuery({
        queryKey: ['pre-registrations-pilgrims'],
        queryFn: async () => {
            const response = await api.get('/pre-registrations/pilgrims')
            return response.data.data
        }
    })

    // Filter pilgrims based on search query
    const filteredPilgrims = pilgrims?.filter((pilgrim) => {
        const fullName = pilgrim.attributes?.fullName || ''
        const pilgrimId = pilgrim.id?.toString() || ''
        const phone = pilgrim.attributes?.phone || ''
        return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pilgrimId.includes(searchQuery) ||
            phone.includes(searchQuery)
    })

    const getInitials = (firstName, lastName) => {
        const first = firstName?.charAt(0)?.toUpperCase() || ''
        const last = lastName?.charAt(0)?.toUpperCase() || ''
        return first + last || 'N/A'
    }

    const form = useForm({
        resolver: zodResolver(preRegistrationSchema),
        mode: 'onSubmit',
        defaultValues: {
            group_leader_id: '',
            status: 'active',
            serial_no: '',
            tracking_no: '',
            bank_voucher_no: '',
            voucher_name: '',
            date: new Date().toISOString().split('T')[0],
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
                occupation: '',
                spouse_name: '',
                email: '',
                phone: '',
                gender: '',
                is_married: false,
                nid: '',
                birth_certificate_number: '',
                date_of_birth: '',
                present_address: {
                    house_no: '',
                    road_no: '',
                    village: '',
                    post_office: '',
                    police_station: '',
                    district: '',
                    division: '',
                    postal_code: '',
                    country: 'Bangladesh',
                },
                permanent_address: {
                    house_no: '',
                    road_no: '',
                    village: '',
                    post_office: '',
                    police_station: '',
                    district: '',
                    division: '',
                    postal_code: '',
                    country: 'Bangladesh',
                },
            },
            same_as_present_address: false,
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

    const watchedStatus = form.watch('status')
    const watchedPilgrimType = form.watch('pilgrim_type')
    const watchedPassportType = form.watch('passport_type')
    const watchedSameAsPresent = form.watch('same_as_present_address')

    const createMutation = useMutation({
        mutationFn: (data) => {
            const formData = new FormData()

            // Basic fields
            formData.append('group_leader_id', data.group_leader_id)
            formData.append('status', data.status)

            if (data.status === 'active') {
                formData.append('serial_no', data.serial_no)
                formData.append('tracking_no', data.tracking_no)
                formData.append('bank_voucher_no', data.bank_voucher_no)
                formData.append('voucher_name', data.voucher_name)
                formData.append('date', data.date)
            }

            // Pilgrim data
            formData.append('pilgrim_type', data.pilgrim_type)

            if (data.pilgrim_type === 'existing') {
                formData.append('pilgrim_id', data.pilgrim_id)
            } else {
                // New pilgrim data
                if (data.new_pilgrim.avatar) {
                    formData.append('new_pilgrim[avatar]', data.new_pilgrim.avatar)
                }
                formData.append('new_pilgrim[first_name]', data.new_pilgrim.first_name)
                formData.append('new_pilgrim[first_name_bangla]', data.new_pilgrim.first_name_bangla)
                if (data.new_pilgrim.last_name) formData.append('new_pilgrim[last_name]', data.new_pilgrim.last_name)
                if (data.new_pilgrim.last_name_bangla) formData.append('new_pilgrim[last_name_bangla]', data.new_pilgrim.last_name_bangla)
                if (data.new_pilgrim.mother_name) formData.append('new_pilgrim[mother_name]', data.new_pilgrim.mother_name)
                if (data.new_pilgrim.mother_name_bangla) formData.append('new_pilgrim[mother_name_bangla]', data.new_pilgrim.mother_name_bangla)
                if (data.new_pilgrim.father_name) formData.append('new_pilgrim[father_name]', data.new_pilgrim.father_name)
                if (data.new_pilgrim.father_name_bangla) formData.append('new_pilgrim[father_name_bangla]', data.new_pilgrim.father_name_bangla)
                if (data.new_pilgrim.occupation) formData.append('new_pilgrim[occupation]', data.new_pilgrim.occupation)
                if (data.new_pilgrim.spouse_name) formData.append('new_pilgrim[spouse_name]', data.new_pilgrim.spouse_name)
                if (data.new_pilgrim.email) formData.append('new_pilgrim[email]', data.new_pilgrim.email)
                if (data.new_pilgrim.phone) formData.append('new_pilgrim[phone]', data.new_pilgrim.phone)
                formData.append('new_pilgrim[gender]', data.new_pilgrim.gender)
                formData.append('new_pilgrim[is_married]', data.new_pilgrim.is_married ? '1' : '0')
                formData.append('new_pilgrim[nid]', data.new_pilgrim.nid)
                if (data.new_pilgrim.birth_certificate_number) formData.append('new_pilgrim[birth_certificate_number]', data.new_pilgrim.birth_certificate_number)
                if (data.new_pilgrim.date_of_birth) formData.append('new_pilgrim[date_of_birth]', data.new_pilgrim.date_of_birth)

                // Present address
                if (data.new_pilgrim.present_address.house_no) formData.append('new_pilgrim[present_address][house_no]', data.new_pilgrim.present_address.house_no)
                if (data.new_pilgrim.present_address.road_no) formData.append('new_pilgrim[present_address][road_no]', data.new_pilgrim.present_address.road_no)
                formData.append('new_pilgrim[present_address][village]', data.new_pilgrim.present_address.village)
                formData.append('new_pilgrim[present_address][post_office]', data.new_pilgrim.present_address.post_office)
                formData.append('new_pilgrim[present_address][police_station]', data.new_pilgrim.present_address.police_station)
                formData.append('new_pilgrim[present_address][district]', data.new_pilgrim.present_address.district)
                formData.append('new_pilgrim[present_address][division]', data.new_pilgrim.present_address.division)
                formData.append('new_pilgrim[present_address][postal_code]', data.new_pilgrim.present_address.postal_code)
                if (data.new_pilgrim.present_address.country) formData.append('new_pilgrim[present_address][country]', data.new_pilgrim.present_address.country)

                // Permanent address
                formData.append('same_as_present_address', data.same_as_present_address ? '1' : '0')
                if (!data.same_as_present_address) {
                    if (data.new_pilgrim.permanent_address.house_no) formData.append('new_pilgrim[permanent_address][house_no]', data.new_pilgrim.permanent_address.house_no)
                    if (data.new_pilgrim.permanent_address.road_no) formData.append('new_pilgrim[permanent_address][road_no]', data.new_pilgrim.permanent_address.road_no)
                    formData.append('new_pilgrim[permanent_address][village]', data.new_pilgrim.permanent_address.village)
                    formData.append('new_pilgrim[permanent_address][post_office]', data.new_pilgrim.permanent_address.post_office)
                    formData.append('new_pilgrim[permanent_address][police_station]', data.new_pilgrim.permanent_address.police_station)
                    formData.append('new_pilgrim[permanent_address][district]', data.new_pilgrim.permanent_address.district)
                    formData.append('new_pilgrim[permanent_address][division]', data.new_pilgrim.permanent_address.division)
                    formData.append('new_pilgrim[permanent_address][postal_code]', data.new_pilgrim.permanent_address.postal_code)
                    if (data.new_pilgrim.permanent_address.country) formData.append('new_pilgrim[permanent_address][country]', data.new_pilgrim.permanent_address.country)
                }
            }

            // Passport data
            formData.append('passport_type', data.passport_type)

            if (data.passport_type === 'existing') {
                formData.append('passport_id', data.passport_id)
            } else if (data.passport_type === 'new') {
                formData.append('new_passport[passport_number]', data.new_passport.passport_number)
                formData.append('new_passport[issue_date]', data.new_passport.issue_date)
                formData.append('new_passport[expiry_date]', data.new_passport.expiry_date)
                formData.append('new_passport[passport_type]', data.new_passport.passport_type)
                if (data.new_passport.file) {
                    formData.append('new_passport[file]', data.new_passport.file)
                }
                if (data.new_passport.notes) formData.append('new_passport[notes]', data.new_passport.notes)
            }

            return api.post('/pre-registrations', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pre-registrations'] })
            toast.success("Pre-registration created successfully")
            navigate('/pre-registrations')
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || "Failed to create pre-registration")
        }
    })

    const fetchPilgrimPassports = async (pilgrimId) => {
        if (!pilgrimId) return
        setLoadingPassports(true)
        try {
            const response = await api.get(`/pre-registrations/passports?pilgrim_id=${pilgrimId}`)
            setAvailablePassports(response.data.data)
        } catch (error) {
            console.error('Error fetching passports:', error)
            setAvailablePassports([])
        } finally {
            setLoadingPassports(false)
        }
    }

    const handlePilgrimChange = (pilgrimId) => {
        form.setValue('pilgrim_id', pilgrimId)
        const pilgrim = pilgrims?.find(p => p.id.toString() === pilgrimId)
        setSelectedPilgrim(pilgrim || null)
        if (pilgrimId) {
            fetchPilgrimPassports(pilgrimId)
        } else {
            setAvailablePassports([])
        }
    }

    const handlePilgrimTypeChange = (value) => {
        setPilgrimType(value)
        form.setValue('pilgrim_type', value)
        if (value === 'existing') {
            form.setValue('pilgrim_id', '')
            setSelectedPilgrim(null)
            setAvailablePassports([])
        } else if (value === 'new') {
            // When switching to new pilgrim, if passport_type is 'existing', switch to 'new'
            const currentPassportType = form.getValues('passport_type')
            if (currentPassportType === 'existing') {
                form.setValue('passport_type', 'new')
                setPassportType('new')
            }
        }
    }

    const handlePassportTypeChange = (value) => {
        setPassportType(value)
        form.setValue('passport_type', value)
    }

    const onSubmit = async (data) => {
        setIsSubmitting(true)
        try {
            await createMutation.mutateAsync(data)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => navigate('/pre-registrations')}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <PageHeading
                        title={t({ en: 'Create Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন তৈরি করুন' })}
                        description={t({ en: 'Create a new pre-registration for Hajj pilgrimage', bn: 'হজ্জ পিলগ্রিমেজের জন্য নতুন প্রি-রেজিস্ট্রেশন তৈরি করুন' })}
                    />
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t({ en: 'Basic Information', bn: 'মৌলিক তথ্য' })}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="group_leader_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Group Leader *', bn: 'গ্রুপ লিডার *' })}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel>{t({ en: 'Status *', bn: 'স্ট্যাটাস *' })}</FormLabel>
                                                <FormControl>
                                                    <RadioGroup
                                                        onValueChange={field.onChange}
                                                        value={field.value}
                                                        className="flex gap-6"
                                                    >
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="active" id="active" />
                                                            <Label htmlFor="active">{t({ en: 'Active', bn: 'একটিভ' })}</Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="pending" id="pending" />
                                                            <Label htmlFor="pending">{t({ en: 'Pending', bn: 'পেন্ডিং' })}</Label>
                                                        </div>
                                                    </RadioGroup>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {watchedStatus === 'active' && (
                                    <>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="serial_no"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Serial No *', bn: 'সিরিয়াল নং *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder={t({ en: 'Enter serial number', bn: 'সিরিয়াল নং লিখুন' })} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="tracking_no"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Tracking No *', bn: 'ট্র্যাকিং নং *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder={t({ en: 'Enter tracking number', bn: 'ট্র্যাকিং নং লিখুন' })} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Date *', bn: 'তারিখ *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="date" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="bank_voucher_no"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Bank Voucher No *', bn: 'ব্যাংক ভাউচার নং *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder={t({ en: 'Enter voucher number', bn: 'ভাউচার নং লিখুন' })} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="voucher_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Voucher Name *', bn: 'ভাউচার নাম *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder={t({ en: 'Enter voucher name', bn: 'ভাউচার নাম লিখুন' })} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </>
                                )}
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
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={handlePilgrimTypeChange}
                                                    value={field.value}
                                                    className="flex gap-6"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="new" id="new" />
                                                        <Label htmlFor="new">{t({ en: 'New Pilgrim', bn: 'নতুন পিলগ্রিম' })}</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="existing" id="existing" />
                                                        <Label htmlFor="existing">{t({ en: 'Existing Pilgrim', bn: 'এক্সিস্টিং পিলগ্রিম' })}</Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {watchedPilgrimType === 'existing' && (
                                    <FormField
                                        control={form.control}
                                        name="pilgrim_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Pilgrim *', bn: 'পিলগ্রিম *' })}</FormLabel>
                                                <div className="relative" ref={dropdownRef}>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        className="w-full justify-between"
                                                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                                                    >
                                                        {selectedPilgrim ? (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="w-8 h-8">
                                                                    <AvatarImage src={selectedPilgrim.attributes?.avatar} alt={selectedPilgrim.attributes?.fullName} />
                                                                    <AvatarFallback>
                                                                        {getInitials(selectedPilgrim.attributes?.firstName, selectedPilgrim.attributes?.lastName)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="text-left">
                                                                    <div className="font-medium">{selectedPilgrim.attributes?.fullName}</div>
                                                                    <div className="text-sm text-muted-foreground">{selectedPilgrim.attributes?.phone}</div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            t({ en: 'Select pilgrim', bn: 'পিলগ্রিম নির্বাচন করুন' })
                                                        )}
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Button>
                                                    {isSelectOpen && (
                                                        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
                                                            <div className="p-2">
                                                                <Input
                                                                    placeholder={t({ en: 'Search pilgrims...', bn: 'পিলগ্রিম অনুসন্ধান...' })}
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                    className="w-full"
                                                                />
                                                            </div>
                                                            <div className="max-h-60 overflow-y-auto">
                                                                {filteredPilgrims?.length > 0 ? (
                                                                    filteredPilgrims.map((pilgrim) => (
                                                                        <div
                                                                            key={pilgrim.id}
                                                                            className="flex items-center gap-2 p-2 hover:bg-accent cursor-pointer"
                                                                            onClick={() => {
                                                                                setSelectedPilgrim(pilgrim)
                                                                                field.onChange(pilgrim.id.toString())
                                                                                handlePilgrimChange(pilgrim.id.toString())
                                                                                setIsSelectOpen(false)
                                                                                setSearchQuery('')
                                                                            }}
                                                                        >
                                                                            <Avatar className="w-8 h-8">
                                                                                <AvatarImage src={pilgrim.attributes?.avatar} alt={pilgrim.attributes?.fullName} />
                                                                                <AvatarFallback>
                                                                                    {getInitials(pilgrim.attributes?.firstName, pilgrim.attributes?.lastName)}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                            <div className="flex-1">
                                                                                <div className="font-medium">{pilgrim.attributes?.fullName}</div>
                                                                                <div className="text-sm text-muted-foreground">{pilgrim.attributes?.phone}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="p-2 text-center text-muted-foreground">
                                                                        {t({ en: 'No pilgrims found', bn: 'কোন পিলগ্রিম পাওয়া যায়নি' })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {watchedPilgrimType === 'new' && (
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
                                                                <FormLabel>{t({ en: 'First Name *', bn: 'প্রথম নাম *' })}</FormLabel>
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
                                                                    <Input placeholder={t({ en: 'প্রথম নাম', bn: 'প্রথম নাম' })} {...field} />
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
                                                                <FormLabel>{t({ en: 'Last Name', bn: 'শেষ নাম' })}</FormLabel>
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
                                                                    <Input placeholder={t({ en: 'শেষ নাম', bn: 'শেষ নাম' })} {...field} />
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
                                                                <Input placeholder={t({ en: 'পিতার নাম', bn: 'পিতার নাম' })} {...field} />
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
                                                                <Input placeholder={t({ en: 'মাতার নাম', bn: 'মাতার নাম' })} {...field} />
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
                                                            <Select onValueChange={field.onChange} value={field.value}>
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
                                                    name="new_pilgrim.is_married"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Marital Status *', bn: 'বৈবাহিক অবস্থা *' })}</FormLabel>
                                                            <Select onValueChange={(value) => field.onChange(value === 'true')} value={field.value ? 'true' : 'false'}>
                                                                <FormControl>
                                                                    <SelectTrigger className="w-full">
                                                                        <SelectValue placeholder={t({ en: 'Select status', bn: 'অবস্থা নির্বাচন করুন' })} />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="false">{t({ en: 'Unmarried', bn: 'অবিবাহিত' })}</SelectItem>
                                                                    <SelectItem value="true">{t({ en: 'Married', bn: 'বিবাহিত' })}</SelectItem>
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
                                                            <FormLabel>{t({ en: 'Date of Birth', bn: 'জন্ম তারিখ' })} <span className="text-red-500">*</span></FormLabel>
                                                            <FormControl>
                                                                <Input {...field} type="date" />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.occupation"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Occupation', bn: 'পেশা' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter occupation', bn: 'পেশা লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.spouse_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Spouse Name', bn: 'স্বামী/স্ত্রীর নাম' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter spouse name', bn: 'স্বামী/স্ত্রীর নাম লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Identification */}
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
                                                            <FormLabel>{t({ en: 'NID Number *', bn: 'এনআইডি নম্বর *' })}</FormLabel>
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

                                        {/* Present Address */}
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">6</span>
                                                {t({ en: 'Present Address', bn: 'বর্তমান ঠিকানা' })}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.house_no"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'House No', bn: 'বাড়ি নং' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'e.g. 123/A', bn: 'যেমনঃ ১২৩/ক' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.road_no"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Road No', bn: 'রোড নং' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'e.g. 5', bn: 'যেমনঃ ৫' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.village"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Village *', bn: 'গ্রাম *' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter village name', bn: 'গ্রামের নাম লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.post_office"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Post Office *', bn: 'পোস্ট অফিস *' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter post office', bn: 'পোস্ট অফিস লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.police_station"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Police Station *', bn: 'থানা *' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter police station', bn: 'থানা লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.district"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'District *', bn: 'জেলা *' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter district', bn: 'জেলা লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.division"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Division *', bn: 'বিভাগ *' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter division', bn: 'বিভাগ লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.postal_code"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Postal Code *', bn: 'পোস্টাল কোড *' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Enter postal code', bn: 'পোস্টাল কোড লিখুন' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="new_pilgrim.present_address.country"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>{t({ en: 'Country', bn: 'দেশ' })}</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder={t({ en: 'Bangladesh', bn: 'বাংলাদেশ' })} {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>

                                        {/* Same as Present Address Checkbox */}
                                        <FormField
                                            control={form.control}
                                            name="same_as_present_address"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>{t({ en: 'Same as present address', bn: 'বর্তমান ঠিকানার মতো' })}</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        {/* Permanent Address - Only show if not same as present */}
                                        {!watchedSameAsPresent && (
                                            <div className="border rounded-lg p-4 bg-muted/50">
                                                <h4 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                                                    <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">7</span>
                                                    {t({ en: 'Permanent Address', bn: 'স্থায়ী ঠিকানা' })}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.house_no"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'House No', bn: 'বাড়ি নং' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'e.g. 123/A', bn: 'যেমনঃ ১২৩/ক' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.road_no"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Road No', bn: 'রোড নং' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'e.g. 5', bn: 'যেমনঃ ৫' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.village"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Village *', bn: 'গ্রাম *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter village name', bn: 'গ্রামের নাম লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.post_office"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Post Office *', bn: 'পোস্ট অফিস *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter post office', bn: 'পোস্ট অফিস লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.police_station"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Police Station *', bn: 'থানা *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter police station', bn: 'থানা লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.district"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'District *', bn: 'জেলা *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter district', bn: 'জেলা লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.division"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Division *', bn: 'বিভাগ *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter division', bn: 'বিভাগ লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.postal_code"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Postal Code *', bn: 'পোস্টাল কোড *' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Enter postal code', bn: 'পোস্টাল কোড লিখুন' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="new_pilgrim.permanent_address.country"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>{t({ en: 'Country', bn: 'দেশ' })}</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder={t({ en: 'Bangladesh', bn: 'বাংলাদেশ' })} {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Passport Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t({ en: 'Passport Information', bn: 'পাসপোর্ট তথ্য' })}</CardTitle>
                                <CardDescription>
                                    {watchedPilgrimType === 'existing'
                                        ? t({ en: 'Select existing passport or create new', bn: 'এক্সিস্টিং পাসপোর্ট সিলেক্ট অথবা নতুন তৈরি করুন' })
                                        : t({ en: 'Create new passport or select none', bn: 'নতুন পাসপোর্ট তৈরি করুন অথবা কোনটিই নয় সিলেক্ট করুন' })
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="passport_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Passport Type *', bn: 'পাসপোর্ট টাইপ *' })}</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={handlePassportTypeChange}
                                                    value={field.value}
                                                    className="flex gap-6"
                                                >
                                                    {watchedPilgrimType === 'existing' && (
                                                        <div className="flex items-center space-x-2">
                                                            <RadioGroupItem value="existing" id="passport-existing" />
                                                            <Label htmlFor="passport-existing">{t({ en: 'Existing Passport', bn: 'এক্সিস্টিং পাসপোর্ট' })}</Label>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="new" id="passport-new" />
                                                        <Label htmlFor="passport-new">{t({ en: 'New Passport', bn: 'নতুন পাসপোর্ট' })}</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="none" id="passport-none" />
                                                        <Label htmlFor="passport-none">{t({ en: 'No Passport', bn: 'কোন পাসপোর্ট নেই' })}</Label>
                                                    </div>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {watchedPassportType === 'existing' && (
                                    <FormField
                                        control={form.control}
                                        name="passport_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Select Passport *', bn: 'পাসপোর্ট নির্বাচন করুন *' })}</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={loadingPassports}>
                                                    <FormControl>
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder={loadingPassports ? t({ en: 'Loading...', bn: 'লোড হচ্ছে...' }) : t({ en: 'Select passport', bn: 'পাসপোর্ট নির্বাচন করুন' })} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availablePassports?.map((passport) => (
                                                            <SelectItem key={passport.id} value={passport.id.toString()}>
                                                                {passport.attributes.passportNumber}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}

                                {watchedPassportType === 'new' && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="new_passport.passport_number"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Passport Number *', bn: 'পাসপোর্ট নম্বর *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder={t({ en: 'Enter passport number', bn: 'পাসপোর্ট নম্বর লিখুন' })} />
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
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder={t({ en: 'Select passport type', bn: 'পাসপোর্ট টাইপ নির্বাচন করুন' })} />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="ordinary">{t({ en: 'Ordinary', bn: 'সাধারণ' })}</SelectItem>
                                                                <SelectItem value="official">{t({ en: 'Official', bn: 'অফিশিয়াল' })}</SelectItem>
                                                                <SelectItem value="diplomatic">{t({ en: 'Diplomatic', bn: 'কূটনৈতিক' })}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="new_passport.issue_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{t({ en: 'Issue Date *', bn: 'ইস্যু তারিখ *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="date" />
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
                                                        <FormLabel>{t({ en: 'Expiry Date *', bn: 'মেয়াদ উত্তীর্ণের তারিখ *' })}</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="date" />
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

                        <div className="flex justify-end gap-4">
                            <Button type="button" variant="outline" onClick={() => navigate('/pre-registrations')}>
                                {t({ en: 'Cancel', bn: 'বাতিল' })}
                            </Button>
                            <Button type="submit" disabled={isSubmitting || createMutation.isPending}>
                                {isSubmitting || createMutation.isPending ? t({ en: 'Creating...', bn: 'তৈরি হচ্ছে...' }) : t({ en: 'Create Pre-Registration', bn: 'প্রি-রেজিস্ট্রেশন তৈরি করুন' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    )
}