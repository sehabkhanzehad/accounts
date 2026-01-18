import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ChevronsUpDown } from 'lucide-react';

const createTransactionSchema = (selectedSection) => {
    const baseSchema = {
        section_id: z.string().min(1, 'Section is required'),
        type: z.enum(['income', 'expense']),
        voucher_no: z.string().min(1, 'Voucher number is required'),
        title: z.string().min(1, 'Title is required'),
        description: z.string().optional(),
        amount: z.union([z.string(), z.number()]).refine((val) => {
            const strVal = String(val || '').trim();
            return strVal.length > 0 && !isNaN(Number(strVal)) && Number(strVal) > 0;
        }, 'Amount must be a valid positive number'),
        date: z.string().min(1, 'Date is required'),
        loan_id: z.string().optional(),
        pre_registration_ids: z.array(z.string()).optional(),
        registration_ids: z.array(z.string()).optional(),
    };

    return z.object(baseSchema);
};

export default function TransactionForm({ onSuccess }) {
    const queryClient = useQueryClient();
    const [selectedSection, setSelectedSection] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const dropdownRef = useRef(null);

    const form = useForm({
        resolver: zodResolver(createTransactionSchema(selectedSection)),
        defaultValues: {
            section_id: '',
            type: 'income',
            voucher_no: '',
            title: '',
            description: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            loan_id: '',
            pre_registration_ids: [],
            registration_ids: [],
        },
    });

    const { data: sections = [] } = useQuery({
        queryKey: ['transaction-sections'],
        queryFn: async () => {
            const response = await api.get('/transactions/sections');
            return response.data.data;
        }
    });

    const { data: loans = [] } = useQuery({
        queryKey: ['transaction-loans'],
        queryFn: async () => {
            const response = await api.get('/transactions/loans');
            return response.data.data;
        }
    });

    const { data: preRegistrations = [] } = useQuery({
        queryKey: ['transaction-pre-registrations'],
        queryFn: async () => {
            const response = await api.get('/transactions/pre-registrations');
            return response.data.data;
        }
    });

    const { data: registrations = [] } = useQuery({
        queryKey: ['transaction-registrations'],
        queryFn: async () => {
            const response = await api.get('/transactions/registrations');
            return response.data.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/transactions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            toast.success('Transaction created successfully');
            form.reset();
            if (onSuccess) onSuccess();
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Failed to create transaction');
        }
    });

    const watchedSectionId = form.watch('section_id');
    useEffect(() => {
        if (watchedSectionId && sections) {
            const section = sections.find(s => s.id.toString() === watchedSectionId);
            setSelectedSection(section);
            form.clearErrors(['loan_id', 'pre_registration_id', 'pre_registration_ids', 'registration_ids']);
            if (section && (section.attributes.type === 'lend' || section.attributes.type === 'borrow')) {
                const requiredType = section.attributes.type === 'lend' ? 'income' : 'expense';
                form.setValue('type', requiredType);
            }
        }
    }, [watchedSectionId, sections, form]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsSelectOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const filteredSections = sections.filter(section =>
        section.attributes.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        // Reset voucher number when type changes to update prefix
        form.setValue('voucher_no', '')
    }, [form.watch('type'), form])

    const onSubmit = (data) => {
        // Add prefix to voucher number before sending to backend
        const prefix = data.type === 'income' ? 'I' : 'E'
        const processedData = {
            ...data,
            voucher_no: `${prefix}${data.voucher_no}`
        }

        processedData.amount = parseFloat(processedData.amount) || 0;
        if (!processedData.loan_id) delete processedData.loan_id;
        if (!processedData.pre_registration_id) delete processedData.pre_registration_id;
        if (processedData.pre_registration_ids && processedData.pre_registration_ids.length === 0) delete processedData.pre_registration_ids;
        if (processedData.registration_ids && processedData.registration_ids.length === 0) delete processedData.registration_ids;
        createMutation.mutate(processedData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="section_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Section *</FormLabel>
                                <input type="hidden" {...field} />
                                <div className="relative">
                                    <div
                                        className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                                        onClick={() => setIsSelectOpen(!isSelectOpen)}
                                    >
                                        {selectedSection ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <span className="font-medium text-sm">
                                                    {selectedSection.attributes.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">
                                                Select section
                                            </span>
                                        )}
                                        <ChevronsUpDown className={`h-5 w-5 transition-transform ${isSelectOpen ? 'rotate-180 text-primary opacity-100' : 'text-muted-foreground opacity-60'}`} strokeWidth={2.5} />
                                    </div>

                                    {isSelectOpen && (
                                        <div ref={dropdownRef} className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md">
                                            {/* Search Input */}
                                            <div className="p-2 border-b">
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Search sections..."
                                                        value={searchTerm}
                                                        onChange={(e) => setSearchTerm(e.target.value)}
                                                        className="h-8"
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>

                                            {/* Sections List */}
                                            <div className="max-h-60 overflow-y-auto">
                                                {filteredSections?.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        {searchTerm
                                                            ? 'No sections found'
                                                            : 'No sections available'}
                                                    </div>
                                                ) : (
                                                    filteredSections?.map((section) => (
                                                        <div
                                                            key={section.id}
                                                            className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                                                            onClick={() => {
                                                                field.onChange(section.id.toString());
                                                                setSelectedSection(section);
                                                                setIsSelectOpen(false);
                                                                setSearchTerm('');
                                                            }}
                                                        >
                                                            <span className="font-medium text-sm">
                                                                {section.attributes.name}
                                                            </span>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => {
                            let allowedTypes = ['income', 'expense'];
                            if (selectedSection && (selectedSection.attributes.type === 'lend' || selectedSection.attributes.type === 'borrow')) {
                                allowedTypes = selectedSection.attributes.type === 'lend' ? ['income'] : ['expense'];
                            }
                            return (
                                <FormItem>
                                    <FormLabel>Type *</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {allowedTypes.map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {type === 'income' ? 'Income' : 'Expense'}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title *</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter transaction title" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount *</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.01" placeholder="0.00" value={field.value || ''} onChange={field.onChange} onBlur={field.onBlur} name={field.name} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <FormField
                        control={form.control}
                        name="voucher_no"
                        render={({ field }) => {
                            const type = form.watch('type')
                            const prefix = type === 'income' ? 'I' : 'E'

                            return (
                                <FormItem>
                                    <FormLabel>Voucher Number *</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter voucher number"
                                            value={field.value ? `${prefix}${field.value}` : prefix}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.startsWith(prefix)) {
                                                    field.onChange(value.slice(1));
                                                } else {
                                                    // If user tries to remove prefix, keep it
                                                    field.onChange(field.value || '');
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )
                        }}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Enter transaction description (optional)" className="resize-none" rows={2} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Conditional reference fields based on section type */}
                {selectedSection && (
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Additional References</h3>

                        {(selectedSection.attributes.type === 'lend' || selectedSection.attributes.type === 'borrow') && loans && (
                            <FormField
                                control={form.control}
                                name="loan_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Related Loan *</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a loan" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {loans.map(loan => (
                                                    <SelectItem key={loan.id} value={loan.id.toString()}>
                                                        {loan.attributes.title} - {loan.attributes.amount}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {selectedSection.attributes.type === 'pre_registration' && preRegistrations && (
                            <FormField
                                control={form.control}
                                name="pre_registration_ids"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Related Pre-registrations *</FormLabel>
                                        <ScrollArea className="h-30 border rounded-md p-3 bg-muted/20">
                                            <div className="space-y-2">
                                                {preRegistrations.map(pr => (
                                                    <FormField
                                                        key={pr.id}
                                                        control={form.control}
                                                        name="pre_registration_ids"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(pr.id.toString())}
                                                                        onCheckedChange={checked => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, pr.id.toString()])
                                                                                : field.onChange(field.value?.filter(value => value !== pr.id.toString()));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal text-sm cursor-pointer">
                                                                    {pr.attributes.serialNo} - {pr.relationships?.pilgrim?.attributes?.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {selectedSection.attributes.type === 'registration' && registrations && (
                            <FormField
                                control={form.control}
                                name="registration_ids"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Related Registrations *</FormLabel>
                                        <ScrollArea className="h-32 border rounded-md p-3 bg-muted/20">
                                            <div className="space-y-2">
                                                {registrations.map(reg => (
                                                    <FormField
                                                        key={reg.id}
                                                        control={form.control}
                                                        name="registration_ids"
                                                        render={({ field }) => (
                                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(reg.id.toString())}
                                                                        onCheckedChange={checked => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, reg.id.toString()])
                                                                                : field.onChange(field.value?.filter(value => value !== reg.id.toString()));
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <FormLabel className="font-normal text-sm cursor-pointer">
                                                                    {reg.attributes.serialNo} - {reg.relationships?.pilgrim?.attributes?.name}
                                                                </FormLabel>
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </ScrollArea>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                    </div>
                )}

                <div className="flex justify-end space-x-2">
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Creating...' : 'Create Transaction'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}