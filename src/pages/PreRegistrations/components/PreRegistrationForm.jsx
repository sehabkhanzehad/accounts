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
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
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

const preRegistrationSchema = z.object({
    group_leader_id: z.string().min(1, "Group leader is required"),
    bank_id: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    mother_name: z.string().optional(),
    father_name: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other'], "Gender is required"),
    is_married: z.boolean(),
    date_of_birth: z.string().optional(),
    nid: z.string().min(1, "NID is required"),
    serial_no: z.string().optional(),
    bank_voucher_no: z.string().optional(),
    date: z.string().optional(),
    status: z.enum(['pending', 'active'], "Status is required"),
}).refine((data) => data.status !== 'active' || (data.bank_id && data.bank_id.length > 0), {
    message: "Bank is required when status is active",
    path: ["bank_id"],
}).refine((data) => data.status !== 'active' || (data.serial_no && data.serial_no.length > 0), {
    message: "Serial No is required when status is active",
    path: ["serial_no"],
}).refine((data) => data.status !== 'active' || (data.bank_voucher_no && data.bank_voucher_no.length > 0), {
    message: "Bank Voucher No is required when status is active",
    path: ["bank_voucher_no"],
}).refine((data) => data.status !== 'active' || (data.date && data.date.length > 0), {
    message: "Date is required when status is active",
    path: ["date"],
})

export function PreRegistrationForm({ open, onOpenChange, editingPreRegistration, onSubmit, isSubmitting, groupLeaders, banks }) {

    const form = useForm({
        resolver: zodResolver(preRegistrationSchema),
        defaultValues: {
            group_leader_id: '',
            bank_id: '',
            first_name: '',
            last_name: '',
            mother_name: '',
            father_name: '',
            email: '',
            phone: '',
            gender: 'male',
            is_married: false,
            date_of_birth: '',
            nid: '',
            serial_no: '',
            bank_voucher_no: '',
            date: new Date().toISOString().split('T')[0],
            status: 'active',
        }
    })

    useEffect(() => {
        if (editingPreRegistration) {
            const pilgrim = editingPreRegistration.relationships?.pilgrim
            const user = pilgrim?.relationships?.user
            form.reset({
                group_leader_id: editingPreRegistration.relationships?.groupLeader?.id.toString() || '',
                bank_id: editingPreRegistration.relationships?.bank?.id.toString() || '',
                first_name: user?.attributes?.firstName || '',
                last_name: user?.attributes?.lastName || '',
                mother_name: user?.attributes?.motherName || '',
                father_name: user?.attributes?.fatherName || '',
                email: user?.attributes?.email || '',
                phone: user?.attributes?.phone || '',
                gender: user?.attributes?.gender || 'male',
                is_married: user?.attributes?.isMarried || false,
                date_of_birth: user?.attributes?.dateOfBirth || '',
                nid: user?.attributes?.nid || '',
                serial_no: editingPreRegistration.attributes.serialNo || '',
                bank_voucher_no: editingPreRegistration.attributes.bankVoucherNo || '',
                date: editingPreRegistration.attributes.date ? new Date(editingPreRegistration.attributes.date).toISOString().split('T')[0] : '',
                status: editingPreRegistration.attributes.status || 'active',
            })
            form.setValue('date', editingPreRegistration.attributes.date ? new Date(editingPreRegistration.attributes.date).toISOString().split('T')[0] : '')
            form.trigger('date')
        } else {
            form.reset({
                group_leader_id: '',
                bank_id: '',
                first_name: '',
                last_name: '',
                mother_name: '',
                father_name: '',
                email: '',
                phone: '',
                gender: 'male',
                is_married: false,
                date_of_birth: '',
                nid: '',
                serial_no: '',
                bank_voucher_no: '',
                date: new Date().toISOString().split('T')[0],
                status: 'active',
            })
        }
    }, [editingPreRegistration, open, form])

    const handleSubmit = (data) => {
        onSubmit(data)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingPreRegistration ? 'Edit Pre-registration' : 'Create Pre-registration'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingPreRegistration ? 'Update the pre-registration details.' : 'Create a new pre-registration record.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-lg font-semibold">Selection</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="group_leader_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Leader *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select group leader" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {groupLeaders?.map((leader) => (
                                                        <SelectItem key={leader.id} value={leader.id.toString()}>
                                                            {leader.attributes.groupName}
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
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Status *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="pending">Pending</SelectItem>
                                                    <SelectItem value="active">Active</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="bank_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bank{form.watch('status') === 'active' ? ' *' : ''}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || ''}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select bank" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {banks?.map((bank) => (
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
                        </div>
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-lg font-semibold">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="mother_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Father Name</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="male">Male</SelectItem>
                                                    <SelectItem value="female">Female</SelectItem>
                                                    <SelectItem value="other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="date_of_birth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="is_married"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center justify-between">
                                            <FormLabel>Is Married</FormLabel>
                                            <FormControl>
                                                <Switch
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-lg font-semibold">Contact Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} />
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
                                            <FormLabel>Phone</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="border rounded-lg p-4 space-y-4">
                            <h3 className="text-lg font-semibold">Registration Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="nid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NID *</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="serial_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Serial No{form.watch('status') === 'active' ? ' *' : ''}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="bank_voucher_no"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bank Voucher No{form.watch('status') === 'active' ? ' *' : ''}</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                            <FormLabel>Date{form.watch('status') === 'active' ? ' *' : ''}</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingPreRegistration ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}