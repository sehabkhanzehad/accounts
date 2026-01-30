import { useEffect, useState, useRef } from 'react'
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
import api from '@/lib/api'
import { Label } from "@/components/ui/label"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronsUpDown } from 'lucide-react'
import { ImageUpload } from "@/components/ui/image-upload"
import { Textarea } from "@/components/ui/textarea"

export function ReplaceForm({ open, onOpenChange, replacingRegistration, onSubmit, isSubmitting, preRegistrations }) {
    const [selectedPreRegistration, setSelectedPreRegistration] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const dropdownRef = useRef(null)
    const [loadingPreRegDetails, setLoadingPreRegDetails] = useState(false)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false)
                setSearchQuery('')
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Create schema for replace
    const replaceSchema = z.object({
        pre_registration_id: z.string().min(1, "Pre-registration is required"),
        date: z.string().min(1, "Replacement date is required"),
        note: z.string().optional(),
        passport_number: z.string().min(1, "Passport number is required"),
        passport_type: z.enum(['ordinary', 'official', 'diplomatic'], {
            required_error: "Passport type is required",
        }),
        issue_date: z.string().min(1, "Issue date is required"),
        expiry_date: z.string().min(1, "Expiry date is required"),
        passport_file: z.any().optional(),
        passport_notes: z.string().optional(),
    })

    const form = useForm({
        resolver: zodResolver(replaceSchema),
        mode: 'onSubmit',
        defaultValues: {
            pre_registration_id: '',
            date: new Date().toISOString().split('T')[0],
            note: '',
            passport_number: '',
            passport_type: 'ordinary',
            issue_date: '',
            expiry_date: '',
            passport_file: null,
            passport_notes: '',
        }
    })

    // Filter pre-registrations based on search query
    const filteredPreRegistrations = preRegistrations?.filter((preReg) => {
        const user = preReg.relationships?.pilgrim?.relationships?.user?.attributes
        const pilgrimName = user ? `${user.firstName} ${user.lastName ?? ""}`.toLowerCase() : ''
        const serial = preReg.attributes?.serialNo?.toLowerCase() || preReg.attributes?.serial?.toLowerCase() || ''
        const query = searchQuery.toLowerCase()
        return pilgrimName.includes(query) || serial.includes(query)
    })

    // Build compatible pre-registration object from different shapes
    const buildPreRegistration = (reg) => {
        const pilgrim = reg.relationships?.pilgrim
        const user = pilgrim?.relationships?.user?.attributes
        const passport = reg.relationships?.passport

        return {
            id: reg.id,
            serial: reg.attributes?.serialNo || reg.serial,
            pilgrim: {
                id: pilgrim?.id,
                user: {
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    phone: user?.phone,
                },
                nid: pilgrim?.nid || pilgrim?.attributes?.nid,
                dateOfBirth: pilgrim?.dateOfBirth || pilgrim?.attributes?.dateOfBirth,
                address: pilgrim?.address || pilgrim?.attributes?.address,
            },
            passport: passport ? {
                passport_number: passport.attributes?.passportNumber || passport.passport_number,
                passport_type: passport.attributes?.passportType || passport.passport_type,
                issue_date: passport.attributes?.issueDate || passport.issue_date,
                expiry_date: passport.attributes?.expiryDate || passport.expiry_date,
                file_path: passport.attributes?.filePath || passport.file_path,
                notes: passport.attributes?.notes || passport.notes,
            } : null,
        }
    }

    // Set selectedPreRegistration when replacingRegistration changes
    useEffect(() => {
        if (replacingRegistration && open) {
            // Reset form
            form.reset({
                pre_registration_id: '',
                date: new Date().toISOString().split('T')[0],
                note: '',
                passport_number: '',
                passport_type: 'ordinary',
                issue_date: '',
                expiry_date: '',
                passport_file: null,
                passport_notes: '',
            })
            setSelectedPreRegistration(null)
        }
    }, [replacingRegistration, open, form])

    // Keep selectedPreRegistration in sync when the form field changes or when the preRegistrations list updates
    const preRegistrationFieldValue = form.watch('pre_registration_id')

    useEffect(() => {
        if (preRegistrationFieldValue && preRegistrations) {
            const found = preRegistrations.find(pr => pr.id == preRegistrationFieldValue)
            if (found) {
                const built = buildPreRegistration(found)
                setSelectedPreRegistration(built)
                // Fill passport fields if passport exists
                if (built.passport) {
                    form.setValue('passport_number', built.passport.passport_number || '')
                    form.setValue('passport_type', built.passport.passport_type || 'ordinary')
                    form.setValue('issue_date', built.passport.issue_date ? built.passport.issue_date.split('T')[0] : '')
                    form.setValue('expiry_date', built.passport.expiry_date ? built.passport.expiry_date.split('T')[0] : '')
                    form.setValue('passport_file', built.passport.file_path || null)
                    form.setValue('passport_notes', built.passport.notes || '')
                } else {
                    form.setValue('passport_number', '')
                    form.setValue('passport_type', 'ordinary')
                    form.setValue('issue_date', '')
                    form.setValue('expiry_date', '')
                    form.setValue('passport_file', null)
                    form.setValue('passport_notes', '')
                }
            }
        } else {
            setSelectedPreRegistration(null)
        }
    }, [preRegistrationFieldValue, preRegistrations, form])

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
    }

    // Normalize pre-registration user data for display (avatar, names, serial)
    const getPreRegDisplay = (preReg) => {
        if (!preReg) return { firstName: '', lastName: '', serialNo: '', avatar: '', initials: '' }

        const firstName = preReg.pilgrim?.user?.firstName || ''
        const lastName = preReg.pilgrim?.user?.lastName || ''
        const serialNo = preReg.serial || ''

        const avatar = preReg.pilgrim?.user?.avatar || ''
        const initials = getInitials(firstName, lastName)

        return { firstName, lastName, serialNo, avatar, initials }
    }

    const handleClose = () => {
        form.reset()
        setSelectedPreRegistration(null)
        setSearchQuery('')
        onOpenChange(false)
    }

    // Precompute selected pre-reg display to avoid inline IIFEs in JSX
    const selectedDisplay = getPreRegDisplay(selectedPreRegistration)
    const selectedHasName = Boolean(selectedDisplay.firstName || selectedDisplay.lastName)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl max-h-screen">
                <DialogHeader>
                    <DialogTitle>Replace Registration</DialogTitle>
                    <DialogDescription>
                        Select a new pre-registration to replace the current one.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => {
                        // Only send passport_file if it's a new File instance (not URL or null)
                        const submitData = { ...data }
                        if (!submitData.passport_file || !(submitData.passport_file instanceof File)) {
                            delete submitData.passport_file
                        }
                        // Ensure date is sent as date-only (YYYY-MM-DD)
                        if (submitData.date) {
                            submitData.date = submitData.date.split('T')[0]
                        }
                        onSubmit(submitData)
                    })} className="space-y-6">
                        {/* Pre-registration */}
                        <FormField
                            control={form.control}
                            name="pre_registration_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pre-registration *</FormLabel>
                                    <FormControl>
                                        <div className="relative" ref={dropdownRef}>
                                            <button
                                                type="button"
                                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                                                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {selectedPreRegistration ? (
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={selectedDisplay.avatar} />
                                                            <AvatarFallback className="text-xs">{selectedDisplay.initials}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="text-left">
                                                            {selectedHasName && (
                                                                <div className="font-medium">
                                                                    {selectedDisplay.firstName} {selectedDisplay.lastName}
                                                                </div>
                                                            )}
                                                            <div className="text-xs text-muted-foreground">
                                                                NG-{selectedDisplay.serialNo}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Select pre-registration</span>
                                                )}
                                                <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                            </button>
                                            {isSelectOpen && (
                                                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
                                                    <div className="p-2">
                                                        <Input
                                                            placeholder="Search by name or serial..."
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredPreRegistrations?.map((preReg) => {
                                                            const built = buildPreRegistration(preReg)
                                                            const display = getPreRegDisplay(built)
                                                            const hasName = Boolean(display.firstName || display.lastName)
                                                            return (
                                                                <button
                                                                    key={preReg.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        field.onChange(preReg.id.toString())
                                                                        setIsSelectOpen(false)
                                                                        setSearchQuery('')
                                                                    }}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                                                                >
                                                                    <Avatar className="h-6 w-6">
                                                                        <AvatarImage src={display.avatar} />
                                                                        <AvatarFallback className="text-xs">{display.initials}</AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        {hasName && (
                                                                            <div className="font-medium">
                                                                                {display.firstName} {display.lastName}
                                                                            </div>
                                                                        )}
                                                                        <div className="text-xs text-muted-foreground">
                                                                            NG-{display.serialNo}
                                                                        </div>
                                                                    </div>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Date and Note in one row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Replacement Date *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Note</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Optional note for replacement" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Passport Information Section */}
                        <div className="border rounded-lg p-4 space-y-4 col-span-full">
                            <h3 className="text-lg font-semibold">Passport Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="passport_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport Number *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter passport number"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passport_type"
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

                                <FormField
                                    control={form.control}
                                    name="issue_date"
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
                                    name="expiry_date"
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

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="passport_file"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Passport File</FormLabel>
                                            <FormControl>
                                                <ImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    accept="image/*,.pdf"
                                                    maxSize={5 * 1024 * 1024} // 5MB
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="passport_notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter any additional notes about the passport..."
                                                    className="min-h-25"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Replacing...' : 'Replace Registration'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}