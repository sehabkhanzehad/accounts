import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
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
import api from '@/lib/api'

const umrahSchema = z.object({
    group_leader_id: z.string().min(1, "Group leader is required"),
    pilgrim_type: z.enum(['existing', 'new']).optional(),
    pilgrim_id: z.string().optional(),
    new_pilgrim: z.object({
        first_name: z.string(),
        last_name: z.string().optional(),
        email: z.string().optional(),
        phone: z.string().optional(),
        gender: z.enum(['male', 'female', 'other']),
        is_married: z.boolean().optional(),
        nid: z.string().optional(),
        date_of_birth: z.string().optional(),
    }).optional(),
    package_id: z.string().min(1, "Package is required"),
    passport_type: z.enum(['existing', 'new', 'none']).optional(),
    passport_id: z.string().optional(),
    new_passport: z.object({
        passport_number: z.string().optional(),
        issue_date: z.string().optional(),
        expiry_date: z.string().optional(),
        passport_type: z.enum(['ordinary', 'official', 'diplomatic']).optional(),
        file: z.any().optional(),
        notes: z.string().optional(),
    }).optional(),
}).superRefine((data, ctx) => {
    const pilgrimType = data.pilgrim_type || 'existing'
    
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
        } else {
            if (!data.new_pilgrim.first_name || data.new_pilgrim.first_name.trim().length === 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "First name is required",
                    path: ["new_pilgrim", "first_name"]
                })
            }
            if (!data.new_pilgrim.gender) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Gender is required",
                    path: ["new_pilgrim", "gender"]
                })
            }
        }
    }

    // Passport validation
    const passportType = data.passport_type || 'none'
    if (passportType === 'existing') {
        if (!data.passport_id || data.passport_id.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select an existing passport",
                path: ["passport_id"]
            })
        }
    } else if (passportType === 'new') {
        if (!data.new_passport) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please fill in passport details",
                path: ["new_passport", "passport_number"]
            })
        } else {
            const hasAnyPassportField = Object.values(data.new_passport).some(val => val && String(val).trim().length > 0)
            
            if (hasAnyPassportField) {
                if (!data.new_passport.passport_number || data.new_passport.passport_number.trim().length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Passport number is required",
                        path: ["new_passport", "passport_number"]
                    })
                }
                if (!data.new_passport.issue_date || data.new_passport.issue_date.trim().length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Issue date is required",
                        path: ["new_passport", "issue_date"]
                    })
                }
                if (!data.new_passport.expiry_date || data.new_passport.expiry_date.trim().length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Expiry date is required",
                        path: ["new_passport", "expiry_date"]
                    })
                }
                if (!data.new_passport.passport_type || data.new_passport.passport_type.trim().length === 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: "Passport type is required",
                        path: ["new_passport", "passport_type"]
                    })
                }
            }
        }
    }
})

export function UmrahForm({ open, onOpenChange, editingUmrah, onSubmit, isSubmitting, packages, groupLeaders, pilgrims }) {
    const [pilgrimType, setPilgrimType] = useState('existing')
    const [passportType, setPassportType] = useState('none')
    const [availablePassports, setAvailablePassports] = useState([])
    const [loadingPassports, setLoadingPassports] = useState(false)

    const form = useForm({
        resolver: zodResolver(umrahSchema),
        defaultValues: {
            group_leader_id: '',
            pilgrim_type: 'existing',
            pilgrim_id: '',
            new_pilgrim: {
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                gender: 'male',
                is_married: false,
                nid: '',
                date_of_birth: '',
            },
            package_id: '',
            passport_type: 'none',
            passport_id: '',
            new_passport: {
                passport_number: '',
                issue_date: '',
                expiry_date: '',
                passport_type: 'ordinary',
                file: null,
                notes: '',
            },
        }
    })

    useEffect(() => {
        if (open) {
            setPilgrimType('existing')
            setPassportType('none')
            setAvailablePassports([])
            
            if (editingUmrah) {
                form.reset({
                    group_leader_id: editingUmrah.relationships?.groupLeader?.id?.toString() || '',
                    pilgrim_type: 'existing',
                    pilgrim_id: editingUmrah.relationships?.pilgrim?.id?.toString() || '',
                    package_id: editingUmrah.relationships?.package?.id?.toString() || '',
                })
            } else {
                form.reset({
                    group_leader_id: '',
                    pilgrim_type: 'existing',
                    pilgrim_id: '',
                    new_pilgrim: {
                        first_name: '',
                        last_name: '',
                        email: '',
                        phone: '',
                        gender: 'male',
                        is_married: false,
                        nid: '',
                        date_of_birth: '',
                    },
                    package_id: '',
                    passport_type: 'none',
                    passport_id: '',
                    new_passport: {
                        passport_number: '',
                        issue_date: '',
                        expiry_date: '',
                        passport_type: 'ordinary',
                        file: null,
                        notes: '',
                    },
                })
            }
        }
    }, [editingUmrah, form, open])

    // Fetch passports when existing pilgrim is selected
    const fetchPilgrimPassports = async (pilgrimId) => {
        if (!pilgrimId) {
            setAvailablePassports([])
            return
        }

        setLoadingPassports(true)
        try {
            const response = await api.get(`/umrah/passports?pilgrim_id=${pilgrimId}`)
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
        // Reset passport selection when pilgrim changes
        setPassportType('none')
        form.setValue('passport_type', 'none')
        form.setValue('passport_id', '')
    }

    const handlePilgrimTypeChange = (value) => {
        setPilgrimType(value)
        form.setValue('pilgrim_type', value)
        
        // Clear validation errors when switching pilgrim type
        if (value === 'existing') {
            form.clearErrors(['new_pilgrim', 'new_pilgrim.first_name', 'new_pilgrim.gender'])
        } else if (value === 'new') {
            form.clearErrors('pilgrim_id')
        }

        // Reset passport when changing pilgrim type
        setPassportType('none')
        setAvailablePassports([])
        form.setValue('passport_type', 'none')
        form.setValue('passport_id', '')
    }

    const handlePassportTypeChange = (value) => {
        setPassportType(value)
        form.setValue('passport_type', value)
        
        // Clear validation errors
        if (value === 'existing') {
            form.clearErrors(['new_passport'])
        } else if (value === 'new' || value === 'none') {
            form.clearErrors('passport_id')
        }
    }

    const handleFormSubmit = (data) => {
        const formData = new FormData()

        // Basic fields
        formData.append('group_leader_id', data.group_leader_id)
        formData.append('package_id', data.package_id)

        // Pilgrim data
        const pilgrimType = data.pilgrim_type || 'existing'
        if (pilgrimType === 'existing') {
            formData.append('pilgrim_id', data.pilgrim_id)
        } else {
            Object.keys(data.new_pilgrim).forEach(key => {
                if (data.new_pilgrim[key] !== undefined && data.new_pilgrim[key] !== '') {
                    formData.append(`new_pilgrim[${key}]`, data.new_pilgrim[key])
                }
            })
        }

        // Passport data
        const passportType = data.passport_type || 'none'
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

        onSubmit(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingUmrah ? 'Edit Umrah' : 'Create Umrah'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingUmrah ? 'Update the umrah information.' : 'Fill in the details to create a new umrah registration.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                        {Object.keys(form.formState.errors).length > 0 && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-800 font-medium">Please fix the following errors:</p>
                                <ul className="mt-2 text-red-700 text-sm">
                                    {Object.entries(form.formState.errors).map(([key, error]) => (
                                        <li key={key}>• {error.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="group_leader_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Group Leader</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                        <FormLabel>Package</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select package" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {packages?.map((pkg) => (
                                                    <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                                        {pkg.attributes.name} - ${pkg.attributes.price}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!editingUmrah && (
                            <FormField
                                control={form.control}
                                name="pilgrim_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilgrim Type</FormLabel>
                                        <Select onValueChange={handlePilgrimTypeChange} value={field.value}>
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
                        )}

                        {pilgrimType === 'existing' || editingUmrah ? (
                            <FormField
                                control={form.control}
                                name="pilgrim_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Pilgrim</FormLabel>
                                        <Select 
                                            onValueChange={handlePilgrimChange}
                                            value={field.value}
                                        >
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
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter first name" {...field} />
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
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter last name" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="Enter email address" {...field} />
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
                                                    <Input placeholder="Enter phone number" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.gender"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Gender *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                        name="new_pilgrim.is_married"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Married</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="new_pilgrim.nid"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>NID</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter NID number" {...field} />
                                                </FormControl>
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
                                </div>

                            </div>
                        )}

                        {/* Passport Section */}
                        {!editingUmrah && (
                            <div className="space-y-4 border-t pt-4">
                                <h3 className="text-lg font-semibold">Passport Information (Optional)</h3>
                                
                                <FormField
                                    control={form.control}
                                    name="passport_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport Type</FormLabel>
                                            <Select 
                                                onValueChange={handlePassportTypeChange} 
                                                value={field.value}
                                                disabled={pilgrimType === 'new'}
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
                                                <Select onValueChange={field.onChange} value={field.value}>
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
                                    <div className="space-y-4 p-4 border rounded-lg">
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
                                                        <Select onValueChange={field.onChange} value={field.value}>
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
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                                        <FormField
                                            control={form.control}
                                            name="new_passport.file"
                                            render={({ field: { value, onChange, ...field } }) => (
                                                <FormItem>
                                                    <FormLabel>Passport Scan/Photo</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="file" 
                                                            accept="image/jpeg,image/png,image/jpg"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0]
                                                                onChange(file)
                                                            }}
                                                            {...field}
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
                                                <FormItem>
                                                    <FormLabel>Notes</FormLabel>
                                                    <FormControl>
                                                        <Textarea 
                                                            placeholder="Additional notes about passport" 
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingUmrah ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}