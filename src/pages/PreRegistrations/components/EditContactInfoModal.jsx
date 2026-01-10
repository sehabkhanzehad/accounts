import React from 'react'
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
import { useI18n } from '@/contexts/I18nContext'

const contactInfoSchema = z.object({
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']),
    is_married: z.boolean(),
    nid: z.string().optional(),
    birth_certificate_number: z.string().optional(),
    date_of_birth: z.string().optional(),
})

export function EditContactInfoModal({ open, onOpenChange, pilgrimData, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()

    const form = useForm({
        resolver: zodResolver(contactInfoSchema),
        defaultValues: {
            email: '',
            phone: '',
            gender: 'male',
            is_married: false,
            nid: '',
            birth_certificate_number: '',
            date_of_birth: '',
        }
    })

    React.useEffect(() => {
        if (open && pilgrimData) {
            const dateOfBirth = pilgrimData.dateOfBirth
                ? pilgrimData.dateOfBirth.split('T')[0]
                : ''

            form.reset({
                email: pilgrimData.email || '',
                phone: pilgrimData.phone || '',
                gender: pilgrimData.gender || 'male',
                is_married: pilgrimData.isMarried || false,
                nid: pilgrimData.nid || '',
                birth_certificate_number: pilgrimData.birthCertificateNumber || '',
                date_of_birth: dateOfBirth,
            })
        }
    }, [open, pilgrimData, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-2xl max-h-[90vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>
                        {t({ en: "Contact & Identification", bn: "যোগাযোগ এবং পরিচয়" })}
                    </DialogTitle>
                    <DialogDescription>
                        {t({ en: "Manage contact and identification details", bn: "যোগাযোগ এবং পরিচয়ের বিবরণ পরিচালনা করুন" })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Email", bn: "ইমেইল" })}</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder={t({ en: "Enter email", bn: "ইমেইল লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Phone", bn: "ফোন" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter phone", bn: "ফোন লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Gender", bn: "লিঙ্গ" })} *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className={"w-full"}>
                                                    <SelectValue placeholder={t({ en: "Select gender", bn: "লিঙ্গ নির্বাচন করুন" })} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="male">{t({ en: "Male", bn: "পুরুষ" })}</SelectItem>
                                                <SelectItem value="female">{t({ en: "Female", bn: "মহিলা" })}</SelectItem>
                                                <SelectItem value="other">{t({ en: "Other", bn: "অন্যান্য" })}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="is_married"
                                render={({ field }) => (
                                    <FormItem className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel>{t({ en: "Married", bn: "বিবাহিত" })}</FormLabel>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "NID", bn: "এনআইডি" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter NID", bn: "এনআইডি লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="birth_certificate_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Birth Certificate", bn: "জন্ম সনদ" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter birth certificate", bn: "জন্ম সনদ লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date_of_birth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Date of Birth", bn: "জন্ম তারিখ" })}</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                {t({ en: "Cancel", bn: "বাতিল" })}
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting
                                    ? t({ en: "Updating...", bn: "আপডেট হচ্ছে..." })
                                    : t({ en: "Update", bn: "আপডেট" })
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}