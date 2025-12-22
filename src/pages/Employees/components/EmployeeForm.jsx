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
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().optional(),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    position: z.string().optional(),
    hire_date: z.string().optional(),
    status: z.boolean().optional(),
})

export function EmployeeForm({ open, onOpenChange, editingEmployee, onSubmit, isSubmitting }) {
    const form = useForm({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            position: '',
            hire_date: '',
            status: true,
        }
    })

    useEffect(() => {
        if (editingEmployee) {
            form.reset({
                code: editingEmployee.attributes.code,
                name: editingEmployee.attributes.name,
                description: editingEmployee.attributes.description || '',
                first_name: editingEmployee.relationships?.employee?.attributes?.firstName || '',
                last_name: editingEmployee.relationships?.employee?.attributes?.lastName || '',
                email: editingEmployee.relationships?.employee?.attributes?.email || '',
                phone: editingEmployee.relationships?.employee?.attributes?.phone || '',
                position: editingEmployee.relationships?.employee?.attributes?.position || '',
                hire_date: editingEmployee.relationships?.employee?.attributes?.hireDate || '',
                status: editingEmployee.relationships?.employee?.attributes?.status ?? true,
            })
        } else {
            form.reset({
                code: '',
                name: '',
                description: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                position: '',
                hire_date: '',
                status: true,
            })
        }
    }, [editingEmployee, open, form])

    const handleSubmit = (data) => {
        onSubmit(data, editingEmployee)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        } else if (newOpen && editingEmployee) {
            // Populate form when opening for edit
            form.reset({
                code: editingEmployee.attributes.code,
                name: editingEmployee.attributes.name,
                description: editingEmployee.attributes.description || '',
                first_name: editingEmployee.relationships?.employee?.attributes?.firstName || '',
                last_name: editingEmployee.relationships?.employee?.attributes?.lastName || '',
                email: editingEmployee.relationships?.employee?.attributes?.email || '',
                phone: editingEmployee.relationships?.employee?.attributes?.phone || '',
                position: editingEmployee.relationships?.employee?.attributes?.position || '',
                hire_date: editingEmployee.relationships?.employee?.attributes?.hireDate || '',
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
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Code *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter employee code" {...field} />
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
                                                <Input placeholder="Enter employee name" {...field} />
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
                                                className="min-h-[80px]"
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
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Personal Information</h3>
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
                                            <FormLabel>Email *</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Enter email address" {...field} />
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
                                                <Input placeholder="Enter phone number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Employment Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="position"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Position</FormLabel>
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
                                            <FormLabel>Hire Date</FormLabel>
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