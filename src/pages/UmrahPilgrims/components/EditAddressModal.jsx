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
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useI18n } from '@/contexts/I18nContext'

const addressSchema = z.object({
    present_address: z.object({
        house_no: z.string().optional().nullable(),
        road_no: z.string().optional().nullable(),
        village: z.string().min(1, "Village is required"),
        post_office: z.string().min(1, "Post office is required"),
        police_station: z.string().min(1, "Police station is required"),
        district: z.string().min(1, "District is required"),
        division: z.string().min(1, "Division is required"),
        postal_code: z.string().min(1, "Postal code is required"),
        country: z.string().optional().nullable(),
    }),
    permanent_address: z.object({
        house_no: z.string().optional().nullable(),
        road_no: z.string().optional().nullable(),
        village: z.string().optional().nullable(),
        post_office: z.string().optional().nullable(),
        police_station: z.string().optional().nullable(),
        district: z.string().optional().nullable(),
        division: z.string().optional().nullable(),
        postal_code: z.string().optional().nullable(),
        country: z.string().optional().nullable(),
    }).optional(),
    same_as_present_address: z.boolean(),
}).superRefine((data, ctx) => {
    if (!data.same_as_present_address) {
        // Validate permanent address fields when not same as present
        const fields = ['village', 'post_office', 'police_station', 'district', 'division', 'postal_code']
        fields.forEach(field => {
            if (!data.permanent_address?.[field]) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `${field.replace('_', ' ')} is required`,
                    path: ['permanent_address', field]
                })
            }
        })
    }
})

export function EditAddressModal({ open, onOpenChange, addressData, onSubmit, isSubmitting }) {
    const { t, language } = useI18n()

    const form = useForm({
        resolver: zodResolver(addressSchema),
        mode: 'onChange',
        defaultValues: {
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
            same_as_present_address: false,
        }
    })

    const watchSameAsPresent = form.watch('same_as_present_address')

    useEffect(() => {
        // Only populate form when modal opens, not when addressData changes
        if (open && addressData) {
            const presentAddress = addressData.presentAddress?.attributes || {}
            const permanentAddress = addressData.permanentAddress?.attributes || {}

            form.reset({
                present_address: {
                    house_no: presentAddress.house_no || '',
                    road_no: presentAddress.road_no || '',
                    village: presentAddress.village || '',
                    post_office: presentAddress.post_office || '',
                    police_station: presentAddress.police_station || '',
                    district: presentAddress.district || '',
                    division: presentAddress.division || '',
                    postal_code: presentAddress.postal_code || '',
                    country: presentAddress.country || 'Bangladesh',
                },
                permanent_address: {
                    house_no: permanentAddress.house_no || '',
                    road_no: permanentAddress.road_no || '',
                    village: permanentAddress.village || '',
                    post_office: permanentAddress.police_station || '',
                    district: permanentAddress.district || '',
                    division: permanentAddress.division || '',
                    postal_code: permanentAddress.postal_code || '',
                    country: permanentAddress.country || 'Bangladesh',
                },
                same_as_present_address: false,
            })
        }
    }, [open, form])

    const handleSubmit = (data) => {
        onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className={language === 'bn' ? 'font-bengali' : ''}>
                        {t({ en: 'Edit Address', bn: 'ঠিকানা আপডেট করুন' })}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Present Address Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold border-b pb-2">
                                {t({ en: 'Present Address', bn: 'বর্তমান ঠিকানা' })}
                            </h3>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="present_address.house_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'House No.', bn: 'বাড়ি নং' })}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'House No.', bn: 'বাড়ি নং' })} {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.road_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Road No.', bn: 'রোড নং' })}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'Road No.', bn: 'রোড নং' })} {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.village"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Village', bn: 'গ্রাম' })} *</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'Village', bn: 'গ্রাম' })} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.post_office"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Post Office', bn: 'পোস্ট অফিস' })} *</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'Post Office', bn: 'পোস্ট অফিস' })} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.police_station"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Police Station', bn: 'থানা' })} *</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'Police Station', bn: 'থানা' })} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.district"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'District', bn: 'জেলা' })} *</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'District', bn: 'জেলা' })} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.division"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Division', bn: 'বিভাগ' })} *</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'Division', bn: 'বিভাগ' })} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.postal_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Postal Code', bn: 'পোস্টাল কোড' })} *</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'Postal Code', bn: 'পোস্টাল কোড' })} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="present_address.country"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>{t({ en: 'Country', bn: 'দেশ' })}</FormLabel>
                                            <FormControl>
                                                <Input placeholder={t({ en: 'Country', bn: 'দেশ' })} {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Same as Present Address Toggle */}
                        <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                            <FormField
                                control={form.control}
                                name="same_as_present_address"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <Label className={`cursor-pointer ${language === 'bn' ? 'font-bengali' : ''}`}>
                                            {t({ en: 'Permanent address is same as present address', bn: 'স্থায়ী ঠিকানা বর্তমান ঠিকানার মতোই' })}
                                        </Label>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Permanent Address Section */}
                        {!watchSameAsPresent && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold border-b pb-2">
                                    {t({ en: 'Permanent Address', bn: 'স্থায়ী ঠিকানা' })}
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="permanent_address.house_no"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'House No.', bn: 'বাড়ি নং' })}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'House No.', bn: 'বাড়ি নং' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.road_no"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Road No.', bn: 'রোড নং' })}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'Road No.', bn: 'রোড নং' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.village"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Village', bn: 'গ্রাম' })} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'Village', bn: 'গ্রাম' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.post_office"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Post Office', bn: 'পোস্ট অফিস' })} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'Post Office', bn: 'পোস্ট অফিস' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.police_station"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Police Station', bn: 'থানা' })} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'Police Station', bn: 'থানা' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.district"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'District', bn: 'জেলা' })} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'District', bn: 'জেলা' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.division"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Division', bn: 'বিভাগ' })} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'Division', bn: 'বিভাগ' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.postal_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Postal Code', bn: 'পোস্টাল কোড' })} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'Postal Code', bn: 'পোস্টাল কোড' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="permanent_address.country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t({ en: 'Country', bn: 'দেশ' })}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder={t({ en: 'Country', bn: 'দেশ' })} {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className={language === 'bn' ? 'font-bengali' : ''}
                            >
                                {t({ en: 'Cancel', bn: 'বাতিল' })}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className={language === 'bn' ? 'font-bengali' : ''}
                            >
                                {isSubmitting ? t({ en: 'Saving...', bn: 'সেভ হচ্ছে...' }) : t({ en: 'Save Changes', bn: 'পরিবর্তন সেভ করুন' })}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
