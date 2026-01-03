import { useEffect } from 'react'
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { useI18n } from '@/contexts/I18nContext'

const withdrawSchema = z.object({
    bank_id: z.string().min(1, "Bank is required"),
    voucher_no: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
    date: z.string().min(1, "Date is required"),
})

export function WithdrawForm({ open, onOpenChange, onSubmit, isSubmitting, allBanks }) {
    const { t, language } = useI18n()
    const form = useForm({
        resolver: zodResolver(withdrawSchema),
        defaultValues: {
            bank_id: '',
            voucher_no: '',
            title: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0], // today's date
        }
    })

    useEffect(() => {
        if (open) {
            form.reset({
                bank_id: '',
                voucher_no: '',
                title: '',
                description: '',
                amount: '',
                date: new Date().toISOString().split('T')[0],
            })
        }
    }, [open, form])

    const handleSubmit = (data) => {
        onSubmit(data)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={`max-w-md ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>{t('app.withdraw')}</DialogTitle>
                    <DialogDescription>
                        {t({ en: "Select a bank and enter withdrawal details.", bn: "একটি ব্যাংক নির্বাচন করুন এবং উত্তোলনের বিস্তারিত লিখুন।" })}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="bank_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('app.selectBank')} *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder={allBanks?.length > 0 ? t('app.selectBank') : t('app.noBanksAvailable')} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allBanks?.map((bank) => (
                                                <SelectItem key={bank.id} value={bank.id.toString()}>
                                                    {bank.attributes.name}
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
                            name="voucher_no"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('app.voucherNo')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t({ en: "Enter voucher number", bn: "ভাউচার নাম্বার লিখুন" })} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('app.title')} *</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t({ en: "Enter title", bn: "শিরোনাম লিখুন" })} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('app.description')}</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder={t({ en: "Enter description", bn: "ডেসক্রিপশন লিখুন" })} {...field} />
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
                                    <FormLabel>{t('app.amount')} *</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" placeholder={t({ en: "Enter amount", bn: "এমাউন্ট লিখুন" })} {...field} />
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
                                    <FormLabel>{t('app.date')} *</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                {t('app.cancel')}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('app.submitting') : t('app.withdraw')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}