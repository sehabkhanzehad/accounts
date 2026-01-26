import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useI18n } from '@/contexts/I18nContext'

const markAsRegisteredSchema = z.object({
    serial_no: z.string().min(1, "Serial number is required"),
    tracking_no: z.string().min(1, "Tracking number is required"),
    bank_voucher_no: z.string().min(1, "Bank voucher number is required"),
    voucher_name: z.string().min(1, "Voucher name is required"),
    date: z.string().min(1, "Date is required"),
})

export function MarkAsRegisteredModal({ open, onOpenChange, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()

    const form = useForm({
        resolver: zodResolver(markAsRegisteredSchema),
        defaultValues: {
            serial_no: '',
            tracking_no: '',
            bank_voucher_no: '',
            voucher_name: '',
            date: '',
        },
    })

    useEffect(() => {
        if (open) {
            form.reset({
                serial_no: '',
                tracking_no: '',
                bank_voucher_no: '',
                voucher_name: '',
                date: new Date().toISOString().split('T')[0], // Default to today
            })
        }
    }, [open, form])

    const handleSubmit = (data) => {
        onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className={language === 'bn' ? 'font-bengali' : ''}>
                        {t({ en: 'Mark as Registered', bn: 'রেজিস্টার্ড হিসেবে চিহ্নিত করুন' })}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="serial_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: 'Serial No', bn: 'সিরিয়াল নং' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t({ en: 'Enter serial number', bn: 'সিরিয়াল নম্বর লিখুন' })} className={language === 'bn' ? 'font-bengali' : ''} />
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
                                        <FormLabel>{t({ en: 'Tracking No', bn: 'ট্র্যাকিং নং' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t({ en: 'Enter tracking number', bn: 'ট্র্যাকিং নম্বর লিখুন' })} className={language === 'bn' ? 'font-bengali' : ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bank_voucher_no"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: 'Bank Voucher No', bn: 'ব্যাংক ভাউচার নং' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t({ en: 'Enter bank voucher number', bn: 'ব্যাংক ভাউচার নম্বর লিখুন' })} className={language === 'bn' ? 'font-bengali' : ''} />
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
                                        <FormLabel>{t({ en: 'Voucher Name', bn: 'ভাউচার নাম' })} *</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder={t({ en: 'Enter voucher name', bn: 'ভাউচার নাম লিখুন' })} className={language === 'bn' ? 'font-bengali' : ''} />
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
                                        <FormLabel>{t({ en: 'Date', bn: 'তারিখ' })} *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} className={language === 'bn' ? 'font-bengali' : ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                {t({ en: 'Cancel', bn: 'বাতিল' })}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t({ en: 'Marking...', bn: 'চিহ্নিত হচ্ছে...' }) : t({ en: 'Mark as Registered', bn: 'রেজিস্টার্ড হিসেবে চিহ্নিত করুন' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}