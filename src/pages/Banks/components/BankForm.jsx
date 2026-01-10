import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const bankSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    branch: z.string().min(1, "Branch is required"),
    account_number: z.string().min(1, "Account number is required"),
    account_holder_name: z.string().min(1, "Account holder name is required"),
    address: z.string().min(1, "Address is required"),
    account_type: z.string().min(1, "Account type is required"),
    routing_number: z.string().optional(),
    swift_code: z.string().optional(),
    opening_date: z.string().optional(),
    phone: z.string().optional(),
    telephone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
})

export function BankForm({ open, onOpenChange, editingBank, onSubmit, isSubmitting }) {
    const { i18n } = useTranslation()
    const language = i18n.language
    const form = useForm({
        resolver: zodResolver(bankSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            branch: '',
            account_number: '',
            account_holder_name: '',
            address: '',
            account_type: '',
            routing_number: '',
            swift_code: '',
            opening_date: '',
            phone: '',
            telephone: '',
            email: '',
            website: '',
        }
    })

    useEffect(() => {
        if (editingBank) {
            form.reset({
                code: editingBank.attributes.code,
                name: editingBank.attributes.name,
                description: editingBank.attributes.description || '',
                branch: editingBank.relationships?.bank?.attributes?.branch || '',
                account_number: editingBank.relationships?.bank?.attributes?.accountNumber || '',
                account_holder_name: editingBank.relationships?.bank?.attributes?.accountHolderName || '',
                address: editingBank.relationships?.bank?.attributes?.address || '',
                account_type: editingBank.relationships?.bank?.attributes?.accountType || '',
                routing_number: editingBank.relationships?.bank?.attributes?.routingNumber || '',
                swift_code: editingBank.relationships?.bank?.attributes?.swiftCode || '',
                opening_date: editingBank.relationships?.bank?.attributes?.openingDate || '',
                phone: editingBank.relationships?.bank?.attributes?.phone || '',
                telephone: editingBank.relationships?.bank?.attributes?.telephone || '',
                email: editingBank.relationships?.bank?.attributes?.email || '',
                website: editingBank.relationships?.bank?.attributes?.website || '',
            })
        } else {
            form.reset({
                code: '',
                name: '',
                description: '',
                branch: '',
                account_number: '',
                account_holder_name: '',
                address: '',
                account_type: '',
                routing_number: '',
                swift_code: '',
                opening_date: '',
                phone: '',
                telephone: '',
                email: '',
                website: '',
            })
        }
    }, [editingBank, open, form])

    const handleSubmit = (data) => {
        onSubmit(data)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        } else if (newOpen && editingBank) {
            // Populate form when opening for edit
            form.reset({
                code: editingBank.attributes.code,
                name: editingBank.attributes.name,
                description: editingBank.attributes.description || '',
                branch: editingBank.relationships?.bank?.attributes?.branch || '',
                account_number: editingBank.relationships?.bank?.attributes?.accountNumber || '',
                account_holder_name: editingBank.relationships?.bank?.attributes?.accountHolderName || '',
                address: editingBank.relationships?.bank?.attributes?.address || '',
                account_type: editingBank.relationships?.bank?.attributes?.accountType || '',
                routing_number: editingBank.relationships?.bank?.attributes?.routingNumber || '',
                swift_code: editingBank.relationships?.bank?.attributes?.swiftCode || '',
                opening_date: editingBank.relationships?.bank?.attributes?.openingDate || '',
                phone: editingBank.relationships?.bank?.attributes?.phone || '',
                telephone: editingBank.relationships?.bank?.attributes?.telephone || '',
                email: editingBank.relationships?.bank?.attributes?.email || '',
                website: editingBank.relationships?.bank?.attributes?.website || '',
            })
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={`max-w-3xl max-h-[85vh] overflow-y-auto ${language === 'bn' ? 'font-bengali' : ''}`}>
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold">{editingBank ? 'Edit Bank' : 'Add Bank'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editingBank ? 'Update the bank details.' : 'Create a new bank section.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter bank code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter bank name" {...field} />
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
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter description"
                                                className="min-h-20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Account Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Account Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="branch"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Branch *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter branch name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="account_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Number *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter account number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="account_holder_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Holder Name *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter account holder name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="account_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Account Type *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select account type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="current">Current</SelectItem>
                                                    <SelectItem value="savings">Savings</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address *</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter bank address"
                                                className="min-h-20"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Banking Details */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Banking Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="routing_number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Routing Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter routing number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="swift_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>SWIFT Code</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter SWIFT code" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="opening_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Opening Date</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Contact Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="phone"
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
                                <FormField
                                    control={form.control}
                                    name="telephone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Telephone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter telephone number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
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
                                    name="website"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Website</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter website URL" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : editingBank ? 'Update Bank' : 'Create Bank'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}