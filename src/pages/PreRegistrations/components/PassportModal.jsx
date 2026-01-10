import React, { useState } from 'react'
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
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { useI18n } from '@/contexts/I18nContext'

const passportSchema = z.object({
    passport_number: z.string().min(1, "Passport number is required"),
    issue_date: z.string().min(1, "Issue date is required"),
    expiry_date: z.string().min(1, "Expiry date is required"),
    passport_type: z.enum(['ordinary', 'official', 'diplomatic'], {
        required_error: "Passport type is required",
    }),
    file: z.any().optional(),
    notes: z.string().optional(),
})

export function PassportModal({ open, onOpenChange, editingPassport, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()
    const [fileAction, setFileAction] = useState(null) // 'keep', 'delete', or 'upload'

    const form = useForm({
        resolver: zodResolver(passportSchema),
        defaultValues: {
            passport_number: '',
            issue_date: '',
            expiry_date: '',
            passport_type: 'ordinary',
            file: null,
            notes: '',
        }
    })

    React.useEffect(() => {
        if (open) {
            if (editingPassport) {
                // Convert ISO date format to YYYY-MM-DD for date inputs
                const issueDate = editingPassport.attributes?.issueDate
                    ? editingPassport.attributes.issueDate.split('T')[0]
                    : ''
                const expiryDate = editingPassport.attributes?.expiryDate
                    ? editingPassport.attributes.expiryDate.split('T')[0]
                    : ''

                form.reset({
                    passport_number: editingPassport.attributes?.passportNumber || '',
                    issue_date: issueDate,
                    expiry_date: expiryDate,
                    passport_type: editingPassport.attributes?.passportType || 'ordinary',
                    file: editingPassport.attributes?.filePath ? `${editingPassport.attributes.filePath}?t=${Date.now()}` : null,
                    notes: editingPassport.attributes?.notes || '',
                })
                setFileAction('keep') // Default to keep existing file
            } else {
                form.reset({
                    passport_number: '',
                    issue_date: '',
                    expiry_date: '',
                    passport_type: 'ordinary',
                    file: null,
                    notes: '',
                })
                setFileAction(null)
            }
        }
    }, [editingPassport, form, open])

    const handleFormSubmit = (data) => {
        const formData = new FormData()

        formData.append('passport_number', data.passport_number)
        formData.append('issue_date', data.issue_date)
        formData.append('expiry_date', data.expiry_date)
        formData.append('passport_type', data.passport_type)

        // Handle file based on fileAction state
        if (fileAction === 'delete') {
            // Send null to delete existing file
            formData.append('file', '')
        } else if (fileAction === 'upload' && data.file instanceof File) {
            // Send actual file to upload new
            formData.append('file', data.file)
        }
        // If fileAction === 'keep', don't send file key at all

        if (data.notes) {
            formData.append('notes', data.notes)
        }

        onSubmit(formData)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`sm:max-w-xl max-h-[90vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader>
                    <DialogTitle>
                        {editingPassport
                            ? t({ en: "Edit Passport", bn: "পাসপোর্ট এডিট করুন" })
                            : t({ en: "Add Passport", bn: "পাসপোর্ট যোগ করুন" })
                        }
                    </DialogTitle>
                    <DialogDescription>
                        {editingPassport
                            ? t({ en: "Update passport information", bn: "পাসপোর্ট তথ্য আপডেট করুন" })
                            : t({ en: "Add new passport for this pilgrim", bn: "এই পিলগ্রিমের জন্য নতুন পাসপোর্ট যোগ করুন" })
                        }
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="passport_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Passport Number", bn: "পাসপোর্ট নম্বর" })} *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={t({ en: "Enter passport number", bn: "পাসপোর্ট নম্বর লিখুন" })}
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
                                        <FormLabel>{t({ en: "Passport Type", bn: "পাসপোর্ট টাইপ" })} *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={t({ en: "Select type", bn: "টাইপ নির্বাচন করুন" })} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="ordinary">
                                                    {t({ en: "Ordinary", bn: "সাধারণ" })}
                                                </SelectItem>
                                                <SelectItem value="official">
                                                    {t({ en: "Official", bn: "অফিসিয়াল" })}
                                                </SelectItem>
                                                <SelectItem value="diplomatic">
                                                    {t({ en: "Diplomatic", bn: "কূটনৈতিক" })}
                                                </SelectItem>
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
                                        <FormLabel>{t({ en: "Issue Date", bn: "ইস্যু তারিখ" })} *</FormLabel>
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
                                        <FormLabel>{t({ en: "Expiry Date", bn: "মেয়াদ শেষ তারিখ" })} *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Left side - Passport Image Upload */}
                            <FormField
                                control={form.control}
                                name="file"
                                render={({ field: { value, onChange, ...field } }) => (
                                    <FormItem>
                                        <FormLabel>{t({ en: "Passport Scan/Photo", bn: "পাসপোর্ট স্ক্যান/ছবি" })}</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={value instanceof File ? URL.createObjectURL(value) : value}
                                                onChange={(file) => {
                                                    onChange(file)
                                                    setFileAction('upload')
                                                }}
                                                onRemove={() => {
                                                    onChange(null)
                                                    setFileAction('delete')
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Right side - Notes */}
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>{t({ en: "Notes", bn: "নোট" })}</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder={t({ en: "Additional notes", bn: "অতিরিক্ত নোট" })}
                                                className="resize-none flex-1"
                                                {...field}
                                            />
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
                                    ? t({ en: "Saving...", bn: "সংরক্ষণ হচ্ছে..." })
                                    : editingPassport
                                        ? t({ en: "Update", bn: "আপডেট" })
                                        : t({ en: "Add", bn: "যোগ করুন" })
                                }
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}