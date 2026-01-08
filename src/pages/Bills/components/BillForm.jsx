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

const billSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    number: z.string().optional(),
    biller_name: z.string().optional(),
})

export function BillForm({ open, onOpenChange, editingBill, onSubmit, isSubmitting }) {
    const form = useForm({
        resolver: zodResolver(billSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            number: '',
            biller_name: '',
        }
    })

    useEffect(() => {
        if (editingBill) {
            form.reset({
                code: editingBill.attributes.code,
                name: editingBill.attributes.name,
                description: editingBill.attributes.description || '',
                number: editingBill.relationships?.bill?.attributes?.number || '',
                biller_name: editingBill.relationships?.bill?.attributes?.billerName || '',
            })
        } else {
            form.reset({
                code: '',
                name: '',
                description: '',
                number: '',
                biller_name: '',
            })
        }
    }, [editingBill, open, form])

    const handleSubmit = (data) => {
        onSubmit(data, editingBill)
    }

    const handleOpenChange = (newOpen) => {
        if (!newOpen) {
            form.reset()
        } else if (newOpen && editingBill) {
            // Populate form when opening for edit
            form.reset({
                code: editingBill.attributes.code,
                name: editingBill.attributes.name,
                description: editingBill.attributes.description || '',
                number: editingBill.relationships?.bill?.attributes?.number || '',
                biller_name: editingBill.relationships?.bill?.attributes?.billerName || '',
            })
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader className="pb-4">
                    <DialogTitle className="text-xl font-semibold">{editingBill ? 'Edit Bill' : 'Add Bill'}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {editingBill ? 'Update the bill details.' : 'Create a new bill section.'}
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
                                                <Input placeholder="Enter bill code" {...field} />
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
                                                <Input placeholder="Enter bill name" {...field} />
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

                        {/* Bill Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase">Bill Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="number"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Bill Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter bill number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="biller_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Biller Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter biller name" {...field} />
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
                                {isSubmitting ? 'Saving...' : editingBill ? 'Update Bill' : 'Create Bill'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}