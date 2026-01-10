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

const borrowingSchema = z.object({
    selectedUser: z.string().min(1, "Please select a user"),
    amount: z.string().min(1, "Amount is required"),
    date: z.string().min(1, "Date is required"),
    description: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
}).refine((data) => {
    if (data.selectedUser === 'new') {
        return data.first_name && data.first_name.trim().length > 0;
    }
    return true;
}, {
    message: "First name is required for new user",
    path: ["first_name"],
})

export function BorrowingForm({ open, onOpenChange, editingBorrowing, onSubmit, isSubmitting, users }) {

    const form = useForm({
        resolver: zodResolver(borrowingSchema),
        defaultValues: {
            selectedUser: '',
            amount: '',
            date: new Date().toISOString().split('T')[0], // Default to today
            description: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
        }
    })

    useEffect(() => {
        if (editingBorrowing) {
            const user = editingBorrowing.relationships?.loanable
            form.reset({
                selectedUser: user ? user.id.toString() : 'new',
                amount: editingBorrowing.attributes.amount.toString(),
                date: editingBorrowing.attributes.date,
                description: editingBorrowing.attributes.description || '',
                first_name: user ? user.attributes.firstName : '',
                last_name: user ? user.attributes.lastName : '',
                email: user ? user.attributes.email : '',
                phone: user ? user.attributes.phone : '',
            })
            // Ensure date is set explicitly
            form.setValue('date', editingBorrowing.attributes.date || '')
            form.trigger('date')
        } else {
            form.reset({
                selectedUser: '',
                amount: '',
                date: '',
                description: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
            })
        }
    }, [editingBorrowing, open, form])

    const handleSubmit = (data) => {
        // Transform data
        const payload = {
            amount: parseFloat(data.amount),
            date: data.date,
            description: data.description || undefined,
        }
        if (data.selectedUser === 'new') {
            payload.first_name = data.first_name
            payload.last_name = data.last_name || undefined
            payload.email = data.email || undefined
            payload.phone = data.phone || undefined
        } else {
            payload.user_id = parseInt(data.selectedUser)
        }
        onSubmit(payload, editingBorrowing)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold">{editingBorrowing ? 'Edit Borrowing' : 'Add Borrowing'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editingBorrowing ? 'Update the borrowing details.' : 'Create a new borrowing record.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* User Selection */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">User Selection</h3>
                            <FormField
                                control={form.control}
                                name="selectedUser"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Select User *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!!editingBorrowing}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a user or create new" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="new">Create New User</SelectItem>
                                                {users?.data?.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        {user.attributes.firstName} {user.attributes.lastName} ({user.attributes.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* User Information - shown only if new user */}
                        {form.watch('selectedUser') === 'new' && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase">User Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter first name" {...field} />
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
                                                    <Input placeholder="Enter last name" {...field} />
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
                                                    <Input type="email" placeholder="Enter email" {...field} />
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
                                                    <Input placeholder="Enter phone" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Borrowing Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Borrowing Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Amount *</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="Enter amount" {...field} disabled={!!editingBorrowing} />
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
                                            <FormLabel>Date *</FormLabel>
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingBorrowing ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}