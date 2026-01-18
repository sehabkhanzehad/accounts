import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useI18n } from '@/contexts/I18nContext'
import { toast } from "sonner"
import api from '@/lib/api'
import { ChevronsUpDown } from 'lucide-react'

const collectionSchema = z.object({
    section_id: z.string().min(1, 'Section is required'),
    type: z.enum(['income', 'expense']),
    voucher_no: z.string().min(1, 'Voucher number is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    amount: z.union([z.string(), z.number()]).refine((val) => {
        const num = typeof val === 'string' ? parseFloat(val) : val
        return !isNaN(num) && num > 0
    }, 'Amount must be a valid positive number'),
    date: z.string().min(1, 'Date is required'),
    pre_registration_id: z.string().optional(),
})

export default function GroupLeaderCollectionModal({ open, onOpenChange }) {
    const { t, language } = useI18n()
    const queryClient = useQueryClient()
    const [selectedSectionId, setSelectedSectionId] = useState('')
    const [selectedSection, setSelectedSection] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [selectedPreRegistration, setSelectedPreRegistration] = useState(null)
    const [preRegSearchTerm, setPreRegSearchTerm] = useState('')
    const [isPreRegSelectOpen, setIsPreRegSelectOpen] = useState(false)
    const dropdownRef = useRef(null)
    const preRegDropdownRef = useRef(null)

    const form = useForm({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            section_id: '',
            type: 'income',
            voucher_no: '',
            title: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            pre_registration_id: '',
        }
    })

    const { data: sections = [] } = useQuery({
        queryKey: ['group-leader-sections'],
        queryFn: async () => {
            const response = await api.get('/group-leaders/sections')
            return response.data.data
        },
        enabled: open
    })

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false)
            }
            if (preRegDropdownRef.current && !preRegDropdownRef.current.contains(event.target)) {
                setIsPreRegSelectOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const filteredSections = useMemo(() => {
        if (!searchTerm) return sections
        return sections.filter((section) => {
            const user = section.relationships?.groupLeader?.relationships?.user?.attributes
            const groupLeaderName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : ''
            const phone = user?.phone || ''
            const sectionName = section.attributes?.name || ''
            
            const searchLower = searchTerm.toLowerCase()
            return groupLeaderName.toLowerCase().includes(searchLower) ||
                   phone.toLowerCase().includes(searchLower) ||
                   sectionName.toLowerCase().includes(searchLower)
        })
    }, [sections, searchTerm])

    // Get display info for selected section
    const getSectionDisplay = (section) => {
        if (!section) return { name: '', phone: '', avatar: '' }
        const user = section.relationships?.groupLeader?.relationships?.user?.attributes
        return {
            name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : 'Unknown',
            phone: user?.phone || 'N/A',
            avatar: user?.avatar || ''
        }
    }

    // Get display info for selected pre-registration
    const getPreRegDisplay = (preReg) => {
        if (!preReg) return { name: '', serialNo: '', avatar: '' }
        const user = preReg.relationships?.pilgrim?.relationships?.user?.attributes
        return {
            name: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : 'Unknown',
            serialNo: preReg.attributes?.serialNo || '',
            avatar: user?.avatar || ''
        }
    }

    const { data: preRegistrations = [] } = useQuery({
        queryKey: ['group-leader-pre-registrations'],
        queryFn: async () => {
            const response = await api.get('/group-leaders/pre-registrations')
            return response.data.data
        },
        enabled: open
    })

    const filteredPreRegistrations = useMemo(() => {
        // First filter by selected group leader
        let filtered = preRegistrations
        if (selectedSection?.relationships?.groupLeader?.id) {
            filtered = preRegistrations.filter((preReg) => 
                preReg.relationships?.groupLeader?.id === selectedSection.relationships.groupLeader.id
            )
        }
        
        // Then filter by search term
        if (!preRegSearchTerm) return filtered
        return filtered.filter((preReg) => {
            const user = preReg.relationships?.pilgrim?.relationships?.user?.attributes
            const pilgrimName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : ''
            const phone = user?.phone || ''
            const serialNo = preReg.attributes?.serialNo || ''
            
            const searchLower = preRegSearchTerm.toLowerCase()
            return pilgrimName.toLowerCase().includes(searchLower) ||
                   phone.toLowerCase().includes(searchLower) ||
                   serialNo.toLowerCase().includes(searchLower)
        })
    }, [preRegistrations, preRegSearchTerm, selectedSection?.relationships?.groupLeader?.id])

    const collectionMutation = useMutation({
        mutationFn: (data) => api.post('/group-leaders/collection', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['management-group-leaders'] })
            toast.success('Collection recorded successfully')
            handleClose()
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to record collection')
        }
    })

    useEffect(() => {
        // Reset pre_registration_id when section changes
        if (selectedSection?.relationships?.groupLeader?.attributes?.pilgrimRequired) {
            // Keep it as is, but check if selected pre-reg belongs to new group leader
            if (selectedPreRegistration && 
                selectedPreRegistration.relationships?.groupLeader?.id !== selectedSection.relationships.groupLeader.id) {
                form.setValue('pre_registration_id', '')
                setSelectedPreRegistration(null)
            }
        } else {
            form.setValue('pre_registration_id', '')
            setSelectedPreRegistration(null)
        }
        
        // Clear any validation errors for pre_registration_id
        form.clearErrors('pre_registration_id')
    }, [selectedSection, form, selectedPreRegistration])

    useEffect(() => {
        // Reset voucher number when type changes to update prefix
        form.setValue('voucher_no', '')
    }, [form.watch('type'), form])

    const onSubmit = (data) => {
        // Custom validation for pre_registration_id when required
        if (selectedSection?.relationships?.groupLeader?.attributes?.pilgrimRequired && !data.pre_registration_id) {
            form.setError('pre_registration_id', {
                type: 'manual',
                message: 'Pre registration is required for this group leader'
            })
            return
        }

        // Add prefix to voucher number before sending to backend
        const prefix = data.type === 'income' ? 'H' : 'E'
        const processedData = {
            ...data,
            voucher_no: `${prefix}${data.voucher_no}`
        }

        collectionMutation.mutate(processedData)
    }

    const handleClose = () => {
        onOpenChange(false)
        setSelectedSectionId('')
        setSelectedSection(null)
        setSearchTerm('')
        setIsSelectOpen(false)
        setSelectedPreRegistration(null)
        setPreRegSearchTerm('')
        setIsPreRegSelectOpen(false)
        form.reset()
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`sm:max-w-xl max-h-[85vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>
                        {t({ en: "Collection", bn: "কালেকশন" })}
                    </DialogTitle>
                    <DialogDescription>
                        {t({ en: "Record collection for group leader", bn: "গ্রুপ লিডারের জন্য কালেকশন রেকর্ড করুন" })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="section_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Group Leader", bn: "গ্রুপ লিডার" })} *</FormLabel>
                                        <input type="hidden" {...field} />
                                        <div className="relative">
                                            <div
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                                onClick={() => setIsSelectOpen(!isSelectOpen)}
                                            >
                                                {selectedSection ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={getSectionDisplay(selectedSection).avatar} />
                                                            <AvatarFallback className="text-xs flex items-center justify-center">
                                                                {getSectionDisplay(selectedSection).name[0] || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm flex items-center gap-2">
                                                                {getSectionDisplay(selectedSection).name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {getSectionDisplay(selectedSection).phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        {t({ en: "Select group leader", bn: "গ্রুপ লিডার নির্বাচন করুন" })}
                                                    </span>
                                                )}
                                                <ChevronsUpDown className={`h-5 w-5 transition-transform ${isSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                            </div>

                                            {isSelectOpen && (
                                                <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
                                                    {/* Search Input */}
                                                    <div className="p-2 border-b">
                                                        <div className="relative">
                                                            <Input
                                                                placeholder={t({ en: "Search group leaders...", bn: "গ্রুপ লিডার খুঁজুন..." })}
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                className="h-8"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Group Leaders List */}
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredSections?.length === 0 ? (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                {searchTerm
                                                                    ? t({ en: "No group leaders found", bn: "কোন গ্রুপ লিডার পাওয়া যায়নি" })
                                                                    : t({ en: "No group leaders available", bn: "কোন গ্রুপ লিডার উপলব্ধ নেই" })
                                                                }
                                                            </div>
                                                        ) : (
                                                            filteredSections?.map((section) => {
                                                                const user = section.relationships?.groupLeader?.relationships?.user?.attributes
                                                                const groupLeaderName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : 'Unknown'
                                                                const phone = user?.phone || 'N/A'
                                                                const avatar = user?.avatar
                                                                const isSelected = field.value === section.id.toString()

                                                                return (
                                                                    <div
                                                                        key={section.id}
                                                                        className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 ${isSelected ? 'bg-accent' : ''}`}
                                                                        onClick={() => {
                                                                            setSelectedSection(section)
                                                                            setSelectedSectionId(section.id.toString())
                                                                            field.onChange(section.id.toString())
                                                                            setIsSelectOpen(false)
                                                                            setSearchTerm('')
                                                                        }}
                                                                    >
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage src={avatar} />
                                                                            <AvatarFallback className="text-xs">
                                                                                {user?.firstName?.[0] || user?.name?.[0] || '?'}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-sm truncate">
                                                                                {groupLeaderName}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground truncate">
                                                                                {phone}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="pre_registration_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {t({ en: "Pre Registration", bn: "প্রি রেজিস্ট্রেশন" })}
                                            {selectedSection?.relationships?.groupLeader?.attributes?.pilgrimRequired ? ' *' : ''}
                                        </FormLabel>
                                        <input type="hidden" {...field} />
                                        <div className="relative">
                                            <div
                                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                                onClick={() => setIsPreRegSelectOpen(!isPreRegSelectOpen)}
                                            >
                                                {selectedPreRegistration ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={getPreRegDisplay(selectedPreRegistration).avatar} />
                                                            <AvatarFallback className="text-xs flex items-center justify-center">
                                                                {getPreRegDisplay(selectedPreRegistration).name[0] || '?'}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm flex items-center gap-2">
                                                                {getPreRegDisplay(selectedPreRegistration).name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                NG-{getPreRegDisplay(selectedPreRegistration).serialNo}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        {t({ en: "Select pre registration", bn: "প্রি রেজিস্ট্রেশন নির্বাচন করুন" })}
                                                    </span>
                                                )}
                                                <ChevronsUpDown className={`h-5 w-5 transition-transform ${isPreRegSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                            </div>

                                            {isPreRegSelectOpen && (
                                                <div ref={preRegDropdownRef} className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
                                                    {/* Search Input */}
                                                    <div className="p-2 border-b">
                                                        <div className="relative">
                                                            <Input
                                                                placeholder={t({ en: "Search pre-registrations...", bn: "প্রি রেজিস্ট্রেশন খুঁজুন..." })}
                                                                value={preRegSearchTerm}
                                                                onChange={(e) => setPreRegSearchTerm(e.target.value)}
                                                                className="h-8"
                                                                autoFocus
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Pre-registrations List */}
                                                    <div className="max-h-60 overflow-y-auto">
                                                        {filteredPreRegistrations?.length === 0 ? (
                                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                                {preRegSearchTerm
                                                                    ? t({ en: "No pre-registrations found", bn: "কোন প্রি রেজিস্ট্রেশন পাওয়া যায়নি" })
                                                                    : t({ en: "No pre-registrations available", bn: "কোন প্রি রেজিস্ট্রেশন উপলব্ধ নেই" })
                                                                }
                                                            </div>
                                                        ) : (
                                                            filteredPreRegistrations?.map((preReg) => {
                                                                const user = preReg.relationships?.pilgrim?.relationships?.user?.attributes
                                                                const pilgrimName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name : 'Unknown'
                                                                const serialNo = preReg.attributes?.serialNo || 'N/A'
                                                                const avatar = user?.avatar
                                                                const isSelected = field.value === preReg.id.toString()

                                                                return (
                                                                    <div
                                                                        key={preReg.id}
                                                                        className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 ${isSelected ? 'bg-accent' : ''}`}
                                                                        onClick={() => {
                                                                            setSelectedPreRegistration(preReg)
                                                                            field.onChange(preReg.id.toString())
                                                                            setIsPreRegSelectOpen(false)
                                                                            setPreRegSearchTerm('')
                                                                        }}
                                                                    >
                                                                        <Avatar className="h-8 w-8">
                                                                            <AvatarImage src={avatar} />
                                                                            <AvatarFallback className="text-xs">
                                                                                {user?.firstName?.[0] || user?.name?.[0] || '?'}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-sm truncate">
                                                                                {pilgrimName}
                                                                            </div>
                                                                            <div className="text-xs text-muted-foreground truncate">
                                                                                NG-{serialNo}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t({ en: "Type", bn: "ধরন" })} *</FormLabel>
                                    <FormControl>
                                        <RadioGroup
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            className="flex gap-6"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="income" id="income" />
                                                <label htmlFor="income" className="text-sm font-medium">
                                                    {t({ en: "Income", bn: "আয়" })}
                                                </label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="expense" id="expense" />
                                                <label htmlFor="expense" className="text-sm font-medium">
                                                    {t({ en: "Expense", bn: "ব্যয়" })}
                                                </label>
                                            </div>
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="voucher_no"
                                render={({ field }) => {
                                    const type = form.watch('type')
                                    const prefix = type === 'income' ? 'H' : 'E'

                                    return (
                                        <FormItem>
                                            <FormLabel>{t({ en: "Voucher No", bn: "ভাউচার নং" })} *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={t({ en: "Enter voucher number", bn: "ভাউচার নম্বর লিখুন" })}
                                                    value={field.value ? `${prefix}${field.value}` : prefix}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        if (value.startsWith(prefix)) {
                                                            field.onChange(value.slice(1));
                                                        } else {
                                                            // If user tries to remove prefix, keep it
                                                            field.onChange(field.value || '');
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )
                                }}
                            />

                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Date", bn: "তারিখ" })} *</FormLabel>
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
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Title", bn: "শিরোনাম" })} *</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter collection title", bn: "কালেকশন শিরোনাম লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Amount", bn: "পরিমাণ" })} *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder={t({ en: "Enter amount", bn: "পরিমাণ লিখুন" })}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t({ en: "Description", bn: "বিবরণ" })}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder={t({ en: "Enter description (optional)", bn: "বিবরণ লিখুন (অপশনাল)" })}
                                            className="resize-none min-h-20"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={collectionMutation.isPending}
                            >
                                {t({ en: "Cancel", bn: "বাতিল" })}
                            </Button>
                            <Button
                                type="submit"
                                disabled={collectionMutation.isPending}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                            >
                                {collectionMutation.isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        {t({ en: "Recording...", bn: "রেকর্ড হচ্ছে..." })}
                                    </>
                                ) : (
                                    t({ en: "Collect", bn: "কালেক্ট" })
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}