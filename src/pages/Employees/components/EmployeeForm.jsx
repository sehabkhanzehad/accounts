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

const employeeSchema = z.object({
    code: z.string().min(1, "Code is required"),
    description: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    // email is optional but must be a valid email when provided or an empty string
    email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
    phone: z.string().optional(),
    position: z.string().optional(),
    hire_date: z.string().optional(),
    // gender is required and must be one of the allowed values
    gender: z.enum(['male', 'female', 'other']),
    status: z.boolean().optional(),
})

export function EmployeeForm({ open, onOpenChange, editingEmployee, onSubmit, isSubmitting }) {
    const form = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            code: '',
            description: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            position: '',
            hire_date: '',
            gender: '', // Added gender field
            status: true,
        }
    })

    useEffect(() => {
        if (editingEmployee) {
            const userAttrs = editingEmployee.relationships?.employee?.relationships?.user?.attributes

            form.reset({
                code: editingEmployee.attributes.code,
                description: editingEmployee.attributes.description || '',
                first_name: userAttrs?.firstName || '',
                last_name: userAttrs?.lastName || '',
                email: userAttrs?.email || '',
                phone: userAttrs?.phone || '',
                position: editingEmployee.relationships?.employee?.attributes?.position || '',
                hire_date: (() => {
                    const raw = editingEmployee.relationships?.employee?.attributes?.hireDate
                    if (!raw) return ''
                    // normalize to YYYY-MM-DD for date input
                    if (typeof raw === 'string') {
                        return raw.split('T')[0].split(' ')[0]
                    }
                    return ''
                })(),
                gender: userAttrs?.gender || '',
                status: editingEmployee.relationships?.employee?.attributes?.status ?? true,
            })
        } else {
            form.reset({
                code: '',
                description: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                position: '',
                hire_date: '',
                gender: '', // Added gender field
                status: true,
            })
        }
    }, [editingEmployee, open, form])

    const handleSubmit = (data) => {
        // Normalize empty strings to null where backend expects nullable
        const payload = {
            code: data.code,
            first_name: data.first_name,
            last_name: data.last_name && data.last_name.length ? data.last_name : null,
            description: data.description && data.description.length ? data.description : null,
            email: data.email && data.email.length ? data.email : null,
            phone: data.phone && data.phone.length ? data.phone : null,
            gender: data.gender,
            position: data.position && data.position.length ? data.position : null,
            hire_date: data.hire_date && data.hire_date.length ? data.hire_date : null,
            status: typeof data.status === 'boolean' ? data.status : true,
        }

        onSubmit(payload, editingEmployee)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        } else if (newOpen && editingEmployee) {
            // Populate form when opening for edit
            const userAttrs = editingEmployee.relationships?.employee?.relationships?.user?.attributes

            form.reset({
                code: editingEmployee.attributes.code,
                description: editingEmployee.attributes.description || '',
                first_name: userAttrs?.firstName || '',
                last_name: userAttrs?.lastName || '',
                email: userAttrs?.email || '',
                phone: userAttrs?.phone || '',
                position: editingEmployee.relationships?.employee?.attributes?.position || '',
                hire_date: (() => {
                    const raw = editingEmployee.relationships?.employee?.attributes?.hireDate
                    if (!raw) return ''
                    if (typeof raw === 'string') {
                        return raw.split('T')[0].split(' ')[0]
                    }
                    return ''
                })(),
                gender: userAttrs?.gender || '',
                status: editingEmployee.relationships?.employee?.attributes?.status ?? true,
            })
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold">{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editingEmployee ? 'Update the employee details.' : 'Create a new employee section.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Code *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter employee code" {...field} />
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
                                        <FormLabel className="text-base">Description</FormLabel>
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

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">First Name *</FormLabel>
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
                                            <FormLabel className="text-base">Last Name</FormLabel>
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
                                            <FormLabel className="text-base">Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Enter email address (optional)" {...field} />
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
                                            <FormLabel className="text-base">Phone</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter phone number (optional)" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Gender *</FormLabel>
                                            <FormControl>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <SelectTrigger className="w-full h-10">
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="male">Male</SelectItem>
                                                        <SelectItem value="female">Female</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground">Employment Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Position</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter position" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="hire_date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base">Hire Date</FormLabel>
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Status</FormLabel>
                                            <div className="text-sm text-muted-foreground">
                                                Set employee status to active or inactive
                                            </div>
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
                                {isSubmitting ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Create Employee'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}