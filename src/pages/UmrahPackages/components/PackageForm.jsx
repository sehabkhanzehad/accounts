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
    Textarea,
} from "@/components/ui/textarea"

const packageSchema = z.object({
    name: z.string().min(1, "Name is required"),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    duration_days: z.string().optional(),
    price: z.string().min(1, "Price is required"),
    description: z.string().optional(),
    status: z.boolean(),
})

export function PackageForm({ open, onOpenChange, editingPackage, onSubmit, isSubmitting }) {
    const form = useForm({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            name: '',
            start_date: '',
            end_date: '',
            duration_days: '',
            price: '',
            description: '',
            status: true,
        }
    })

    useEffect(() => {
        if (editingPackage) {
            form.reset({
                name: editingPackage.attributes.name || '',
                start_date: editingPackage.attributes.start_date || '',
                end_date: editingPackage.attributes.end_date || '',
                duration_days: editingPackage.attributes.duration_days?.toString() || '',
                price: editingPackage.attributes.price?.toString() || '',
                description: editingPackage.attributes.description || '',
                status: editingPackage.attributes.status || true,
            })
        } else {
            form.reset({
                name: '',
                start_date: '',
                end_date: '',
                duration_days: '',
                price: '',
                description: '',
                status: true,
            })
        }
    }, [editingPackage, form])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {editingPackage ? 'Edit Package' : 'Create Package'}
                    </DialogTitle>
                    <DialogDescription>
                        {editingPackage ? 'Update the package information.' : 'Fill in the details to create a new package.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Package Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter package name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" placeholder="Enter price" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="start_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="end_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
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
                            name="duration_days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (Days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="Enter duration in days" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter package description" {...field} />
                                    </FormControl>
                                    <FormMessage />
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
                                        <div className="text-sm text-muted-foreground">
                                            Make this package available for booking
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : (editingPackage ? 'Update' : 'Create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}