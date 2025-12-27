import TransactionForm from './TransactionForm';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function CreateTransactionModal({ open, onOpenChange }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Create Transaction</DialogTitle>
                    <DialogDescription>
                        Add a new transaction to the system
                    </DialogDescription>
                </DialogHeader>
                <TransactionForm onSuccess={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
}