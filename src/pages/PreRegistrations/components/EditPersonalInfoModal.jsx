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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useI18n } from '@/contexts/I18nContext'

const personalInfoSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    first_name_bangla: z.string().min(1, "First name (Bangla) is required"),
    last_name: z.string().optional(),
    last_name_bangla: z.string().optional(),
    father_name: z.string().optional(),
    father_name_bangla: z.string().optional(),
    mother_name: z.string().optional(),
    mother_name_bangla: z.string().optional(),
    occupation: z.string().optional(),
    spouse_name: z.string().optional(),
})

export function EditPersonalInfoModal({ open, onOpenChange, pilgrimData, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()

    const form = useForm({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            first_name: '',
            first_name_bangla: '',
            last_name: '',
            last_name_bangla: '',
            father_name: '',
            father_name_bangla: '',
            mother_name: '',
            mother_name_bangla: '',
            occupation: '',
            spouse_name: '',
        }
    })

    React.useEffect(() => {
        if (open && pilgrimData) {
            form.reset({
                first_name: pilgrimData.firstName || '',
                first_name_bangla: pilgrimData.firstNameBangla || '',
                last_name: pilgrimData.lastName || '',
                last_name_bangla: pilgrimData.lastNameBangla || '',
                father_name: pilgrimData.fatherName || '',
                father_name_bangla: pilgrimData.fatherNameBangla || '',
                mother_name: pilgrimData.motherName || '',
                mother_name_bangla: pilgrimData.motherNameBangla || '',
                occupation: pilgrimData.occupation || '',
                spouse_name: pilgrimData.spouseName || '',
            })
        }
    }, [open, pilgrimData, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-2xl max-h-[90vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>
                        {t({ en: "Personal Information", bn: "ব্যক্তিগত তথ্য" })}
                    </DialogTitle>
                    <DialogDescription>
                        {t({ en: "Manage pilgrim's personal details", bn: "পিলগ্রিমের ব্যক্তিগত বিবরণ পরিচালনা করুন" })}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="first_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "First Name (English)", bn: "প্রথম নাম (ইংরেজি)" })} *</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter first name", bn: "প্রথম নাম লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="first_name_bangla"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "First Name (Bangla)", bn: "প্রথম নাম (বাংলা)" })} *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="প্রথম নাম বাংলায়" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Last Name (English)", bn: "শেষ নাম (ইংরেজি)" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter last name", bn: "শেষ নাম লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="last_name_bangla"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Last Name (Bangla)", bn: "শেষ নাম (বাংলা)" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="শেষ নাম বাংলায়" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="father_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Father Name (English)", bn: "পিতার নাম (ইংরেজি)" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter father name", bn: "পিতার নাম লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="father_name_bangla"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Father Name (Bangla)", bn: "পিতার নাম (বাংলা)" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="পিতার নাম বাংলায়" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mother_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Mother Name (English)", bn: "মাতার নাম (ইংরেজি)" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter mother name", bn: "মাতার নাম লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="mother_name_bangla"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Mother Name (Bangla)", bn: "মাতার নাম (বাংলা)" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder="মাতার নাম বাংলায়" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="occupation"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Occupation", bn: "পেশা" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter occupation", bn: "পেশা লিখুন" })} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="spouse_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Spouse Name", bn: "স্বামী/স্ত্রীর নাম" })}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t({ en: "Enter spouse name", bn: "স্বামী/স্ত্রীর নাম লিখুন" })} {...field} />
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