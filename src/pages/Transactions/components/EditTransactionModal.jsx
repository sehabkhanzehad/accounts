import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'

const editTransactionSchema = z.object({
    voucher_no: z.string().min(1, 'Voucher number is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
})

export default function EditTransactionModal({ open, onOpenChange, transaction, onUpdate, isUpdating }) {
    const form = useForm({
        resolver: zodResolver(editTransactionSchema),
        defaultValues: {
            voucher_no: '',
            title: '',
            description: '',
        },
    })

    useEffect(() => {
        if (transaction) {
            form.reset({
                voucher_no: transaction.attributes.voucherNo?.replace(/^[IE]/, '') || '',
                title: transaction.attributes.title || '',
                description: transaction.attributes.description || '',
            })
        }
    }, [transaction, form])

    const onSubmit = (data) => {
        onUpdate({ id: transaction.id, data })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Update the transaction details
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="voucher_no"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Voucher No *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter voucher number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter title" {...field} />
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
                                        <Textarea placeholder="Enter description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUpdating}>
                                {isUpdating ? 'Updating...' : 'Update Transaction'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}