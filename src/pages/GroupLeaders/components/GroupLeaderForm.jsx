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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

const groupLeaderSchema = z.object({
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    group_name: z.string().min(1, "Group name is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    mother_name: z.string().optional(),
    father_name: z.string().optional(),
    // email optional but must be valid when provided
    email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
    phone: z.string().optional(),
    gender: z.enum(["male", "female", "other"], {
        required_error: "Please select a gender",
    }),
    date_of_birth: z.string().optional(),
    track_payment: z.boolean(),
    status: z.boolean(),
})

export function GroupLeaderForm({ open, onOpenChange, editingGroupLeader, onSubmit, isSubmitting }) {
    const form = useForm({
        resolver: zodResolver(groupLeaderSchema),
        defaultValues: {
            code: '',
            description: '',
            group_name: '',
            first_name: '',
            last_name: '',
            mother_name: '',
            father_name: '',
            email: '',
            phone: '',
            gender: '',
            date_of_birth: '',
            track_payment: false,
            status: true,
        },
    })

    // Reset form when dialog opens/closes or editing changes
    useEffect(() => {
        if (editingGroupLeader) {
            // Editing existing - populate with data from nested user resource
            const user = editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes
            form.reset({
                code: editingGroupLeader.attributes.code,
                description: editingGroupLeader.attributes.description || '',
                group_name: editingGroupLeader.relationships?.groupLeader?.attributes?.groupName || '',
                first_name: user?.firstName || '',
                last_name: user?.lastName || '',
                mother_name: user?.motherName || '',
                father_name: user?.fatherName || '',
                email: user?.email || '',
                phone: user?.phone || '',
                gender: user?.gender || '',
                date_of_birth: user?.dateOfBirth || '',
                track_payment: editingGroupLeader.relationships?.groupLeader?.attributes?.trackPayment || false,
                status: editingGroupLeader.relationships?.groupLeader?.attributes?.status ?? true,
            })
        } else if (open) {
            // Creating new - reset to empty
            form.reset({
                code: '',
                description: '',
                group_name: '',
                first_name: '',
                last_name: '',
                mother_name: '',
                father_name: '',
                email: '',
                phone: '',
                gender: '',
                date_of_birth: '',
                status: true,
            })
        }
    }, [editingGroupLeader, open, form])

    const handleSubmit = (data) => {
        const payload = {
            code: data.code,
            group_name: data.group_name,
            description: data.description && data.description.length ? data.description : null,
            first_name: data.first_name,
            last_name: data.last_name && data.last_name.length ? data.last_name : null,
            mother_name: data.mother_name && data.mother_name.length ? data.mother_name : null,
            father_name: data.father_name && data.father_name.length ? data.father_name : null,
            email: data.email && data.email.length ? data.email : null,
            phone: data.phone && data.phone.length ? data.phone : null,
            gender: data.gender,
            date_of_birth: data.date_of_birth && data.date_of_birth.length ? data.date_of_birth : null,
            track_payment: typeof data.track_payment === 'boolean' ? data.track_payment : Boolean(data.track_payment),
            status: typeof data.status === 'boolean' ? data.status : Boolean(data.status),
        }

        onSubmit(payload, editingGroupLeader)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        } else if (newOpen && editingGroupLeader) {
            // Populate form when opening for edit
            form.reset({
                code: editingGroupLeader.attributes.code,
                description: editingGroupLeader.attributes.description || '',
                group_name: editingGroupLeader.relationships?.groupLeader?.attributes?.groupName || '',
                first_name: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.firstName || '',
                last_name: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.lastName || '',
                mother_name: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.motherName || '',
                father_name: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.fatherName || '',
                email: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.email || '',
                phone: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.phone || '',
                gender: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.gender || '',
                date_of_birth: editingGroupLeader.relationships?.groupLeader?.relationships?.user?.attributes?.dateOfBirth || '',
                track_payment: editingGroupLeader.relationships?.groupLeader?.attributes?.trackPayment || false,
            })
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold">
                        {editingGroupLeader ? 'Edit Group Leader' : 'Add Group Leader'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editingGroupLeader ? 'Update the group leader details.' : 'Create a new group leader section.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground capitalize">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter group leader code"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="group_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter group name"
                                                    {...field}
                                                    className="h-9"
                                                />
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
                                                {...field}
                                                className="min-h-15 resize-none"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Pilgrim Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground capitalize">Pilgrim Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name *</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter first name"
                                                    {...field}
                                                    className="h-9"
                                                />
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
                                                <Input
                                                    placeholder="Enter last name"
                                                    {...field}
                                                    className="h-9"
                                                />
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
                                            <FormLabel>Mother Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter mother name"
                                                    {...field}
                                                    className="h-9"
                                                />
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
                                                <Input
                                                    placeholder="Enter father name"
                                                    {...field}
                                                    className="h-9"
                                                />
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
                                                <Input
                                                    placeholder="Enter phone number"
                                                    {...field}
                                                    className="h-9"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="Enter email (optional)"
                                                    {...field}
                                                    className="h-9"
                                                />
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
                                            <FormLabel>Gender *</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-9 w-full">
                                                        <SelectValue placeholder="Select gender" />
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
                                                <Input type="date" {...field} className="h-9" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="track_payment"
                                        render={({ field }) => (
                                            <FormItem className="rounded-lg border p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Track Payment?</FormLabel>
                                                        <div className="text-sm text-muted-foreground">Enable to track pilgrim payments</div>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem className="rounded-lg border p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Status *</FormLabel>
                                                        <div className="text-sm text-muted-foreground">Set leader status active/inactive</div>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
                                {isSubmitting ? 'Saving...' : (editingGroupLeader ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}