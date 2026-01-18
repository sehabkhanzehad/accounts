import { useState, useEffect, useRef } from 'react'
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useI18n } from '@/contexts/I18nContext'
import { toast } from "sonner"
import api from '@/lib/api'
import { ChevronsUpDown } from 'lucide-react'


const collectionSchema = z.object({
    umrah_id: z.string().min(1, "Pilgrim selection is required"),
    voucher_no: z.string().min(1, "Voucher number is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
    date: z.string().min(1, "Date is required"),
})

export function CollectionModal({ open, onOpenChange, packageId }) {
    const { t, language } = useI18n()
    const queryClient = useQueryClient()
    const [selectedPilgrim, setSelectedPilgrim] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const [voucherNo, setVoucherNo] = useState('H')
    const dropdownRef = useRef(null)

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

    const form = useForm({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            umrah_id: '',
            voucher_no: 'H',
            title: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
        }
    })

    // Fetch pilgrims for collection
    const { data: pilgrims, isLoading: isPilgrimsLoading } = useQuery({
        queryKey: ['package-pilgrims-for-collection', packageId],
        queryFn: async () => {
            if (!packageId) return []
            const response = await api.get(`/umrah-packages/${packageId}/pilgrims-for-collection`)
            return response.data.data
        },
        enabled: open && !!packageId
    })

    // Filter pilgrims based on search query
    const filteredPilgrims = pilgrims?.filter((pilgrim) => {
        if (!searchQuery) return true
        const user = pilgrim.relationships?.pilgrim?.relationships?.user?.attributes
        const groupLeader = pilgrim.relationships?.groupLeader?.attributes
        const searchLower = searchQuery.toLowerCase()

        return (
            user?.fullName?.toLowerCase().includes(searchLower) ||
            user?.phone?.toLowerCase().includes(searchLower) ||
            user?.firstName?.toLowerCase().includes(searchLower) ||
            user?.lastName?.toLowerCase().includes(searchLower) ||
            groupLeader?.groupName?.toLowerCase().includes(searchLower)
        )
    })

    // Collection mutation
    const collectionMutation = useMutation({
        mutationFn: (data) => api.post(`/umrah-packages/${packageId}/pilgrims/collection`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['umrah-package-pilgrims'] })
            queryClient.invalidateQueries({ queryKey: ['umrah-package'] })
            toast.success('Collection recorded successfully')
            handleClose()
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to record collection')
        }
    })

    const handleClose = () => {
        onOpenChange(false)
        setSelectedPilgrim(null)
        setSearchQuery('')
        setIsSelectOpen(false)
        setVoucherNo('H')
        form.reset()
    }

    const onSubmit = (data) => {
        collectionMutation.mutate(data)
    }

    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'N/A'
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`sm:max-w-xl max-h-[80vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''} p-0`}>
                <div className="p-4">
                    <DialogHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <DialogTitle className="text-xl">
                                    {t({ en: "Collection", bn: "কালেকশন" })}
                                </DialogTitle>
                                <DialogDescription className="text-base">
                                    {t({ en: "Collection from pilgrim", bn: "পিলগ্রিম থেকে পেমেন্ট কালেকশন" })}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Pilgrim Selection */}
                        <FormField
                            control={form.control}
                            name="umrah_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        {t({ en: "Select Pilgrim", bn: "পিলগ্রিম নির্বাচন করুন" })} *
                                    </FormLabel>
                                    <div className="relative">
                                        <div
                                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                                        >
                                            {selectedPilgrim ? (
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={selectedPilgrim.relationships?.pilgrim?.relationships?.user?.attributes?.avatar} />
                                                        <AvatarFallback className="text-xs">
                                                            {getInitials(
                                                                selectedPilgrim.relationships?.pilgrim?.relationships?.user?.attributes?.firstName,
                                                                selectedPilgrim.relationships?.pilgrim?.relationships?.user?.attributes?.lastName
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">
                                                            {selectedPilgrim.relationships?.pilgrim?.relationships?.user?.attributes?.fullName || 'N/A'}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {selectedPilgrim.relationships?.pilgrim?.relationships?.user?.attributes?.phone}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    {t({ en: "Select a pilgrim", bn: "একটি পিলগ্রিম নির্বাচন করুন" })}
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
                                                            placeholder={t({ en: "Search pilgrims...", bn: "পিলগ্রিম খুঁজুন..." })}
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            className="h-8"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>

                                                {/* Pilgrims List */}
                                                <div className="max-h-60 overflow-y-auto">
                                                    {isPilgrimsLoading ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            {t({ en: "Loading pilgrims...", bn: "পিলগ্রিম লোড হচ্ছে..." })}
                                                        </div>
                                                    ) : filteredPilgrims?.length === 0 ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                                            {searchQuery
                                                                ? t({ en: "No pilgrims found", bn: "কোন পিলগ্রিম পাওয়া যায়নি" })
                                                                : t({ en: "No pilgrims available", bn: "কোন পিলগ্রিম উপলব্ধ নেই" })
                                                            }
                                                        </div>
                                                    ) : (
                                                        filteredPilgrims?.map((pilgrim) => {
                                                            const user = pilgrim.relationships?.pilgrim?.relationships?.user?.attributes
                                                            const groupLeader = pilgrim.relationships?.groupLeader?.attributes
                                                            const isSelected = field.value === pilgrim.id.toString()

                                                            return (
                                                                <div
                                                                    key={pilgrim.id}
                                                                    className={`flex items-center gap-3 p-3 hover:bg-accent cursor-pointer border-b last:border-b-0 ${
                                                                        isSelected ? 'bg-accent' : ''
                                                                    }`}
                                                                    onClick={() => {
                                                                        setSelectedPilgrim(pilgrim)
                                                                        field.onChange(pilgrim.id.toString())
                                                                        setIsSelectOpen(false)
                                                                        setSearchQuery('')
                                                                    }}
                                                                >
                                                                    
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarImage src={user?.avatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {getInitials(user?.firstName, user?.lastName)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-sm truncate">
                                                                            {user?.fullName || 'N/A'}
                                                                        </div>
                                                                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                                            <span>{user?.phone}</span>
                                                                            {groupLeader?.groupName && (
                                                                                <>
                                                                                    <span>•</span>
                                                                                    <Badge variant="secondary" className="text-xs px-1 py-0">
                                                                                        {groupLeader.groupName}
                                                                                    </Badge>
                                                                                </>
                                                                            )}
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

                        {/* Voucher & Date */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="voucher_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Voucher No", bn: "ভাউচার নং" })} *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t({ en: "Enter voucher number", bn: "ভাউচার নম্বর লিখুন" })}
                                                value={voucherNo}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    let newValue;
                                                    if (value.startsWith('H')) {
                                                        newValue = value;
                                                    } else {
                                                        newValue = 'H' + value;
                                                    }
                                                    setVoucherNo(newValue);
                                                    form.setValue('voucher_no', newValue);
                                                }}
                                            />
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
                                        <FormLabel>{t({ en: "Date", bn: "তারিখ" })} *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Title & Amount */}
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

                        {/* Additional Information */}
                        <div className="space-y-4">
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
                        </div>

                        <div className="flex justify-end gap-3 pt-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={collectionMutation.isPending}
                                className="flex items-center gap-2"
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
                                    t({ en: "Record Collection", bn: "কালেকশন রেকর্ড করুন" })
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
                </div>
            </DialogContent>
        </Dialog>
    )
}