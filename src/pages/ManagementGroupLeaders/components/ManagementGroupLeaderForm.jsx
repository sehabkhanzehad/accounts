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

const groupLeaderSchema = z.object({
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    group_name: z.string().min(1, "Group name is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    mother_name: z.string().optional(),
    father_name: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    gender: z.enum(['male', 'female', 'other'], "Gender is required"),
    is_married: z.boolean(),
    nid: z.string().optional(),
    date_of_birth: z.string().optional(),
    status: z.boolean(),
})

export function ManagementGroupLeaderForm({ open, onOpenChange, editingGroupLeader, onSubmit, isSubmitting }) {
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
            gender: 'male',
            is_married: false,
            nid: '',
            date_of_birth: '',
            status: true,
        }
    })

    useEffect(() => {
        if (editingGroupLeader) {
            const user = editingGroupLeader.relationships?.user
            const section = editingGroupLeader.relationships?.section
            form.reset({
                code: section?.attributes?.code || '',
                description: section?.attributes?.description || '',
                group_name: editingGroupLeader.attributes.groupName || '',
                first_name: user?.attributes?.firstName || '',
                last_name: user?.attributes?.lastName || '',
                mother_name: user?.attributes?.motherName || '',
                father_name: user?.attributes?.fatherName || '',
                email: user?.attributes?.email || '',
                phone: user?.attributes?.phone || '',
                gender: user?.attributes?.gender || 'male',
                is_married: user?.attributes?.isMarried || false,
                nid: user?.attributes?.nid || '',
                date_of_birth: user?.attributes?.dateOfBirth || '',
                status: editingGroupLeader.attributes.status || true,
            })
        } else {
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
                gender: 'male',
                is_married: false,
                nid: '',
                date_of_birth: '',
                status: true,
            })
        }
    }, [editingGroupLeader, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingGroupLeader ? 'Edit Group Leader' : 'Create Group Leader'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingGroupLeader ? 'Update the group leader information.' : 'Fill in the details to create a new group leader.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Code</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter code" {...field} />
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
                                        <FormLabel>Group Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter group name" {...field} />
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
                                        <Input placeholder="Enter description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
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

                                <FormField
                                    control={form.control}
                                    name="mother_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Mother Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter mother name" {...field} />
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
                                                <Input placeholder="Enter father name" {...field} />
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

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
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
                                    name="nid"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>NID</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter NID" {...field} />
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
                                            <FormLabel>Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="is_married"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Married</FormLabel>
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
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base">Active</FormLabel>
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
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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