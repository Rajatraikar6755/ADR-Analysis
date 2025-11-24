import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface AppointmentNotesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointmentId: string;
    patientName: string;
    initialNotes?: string;
    onSave: () => void;
}

export const AppointmentNotesModal: React.FC<AppointmentNotesModalProps> = ({
    open,
    onOpenChange,
    appointmentId,
    patientName,
    initialNotes,
    onSave,
}) => {
    const [notes, setNotes] = useState(initialNotes || '');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setNotes(initialNotes || '');
    }, [initialNotes, open]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/api/appointments/${appointmentId}/notes`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ notes }),
            });

            if (res.ok) {
                toast.success('Notes saved successfully');
                onSave();
                onOpenChange(false);
            } else {
                toast.error('Failed to save notes');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Notes for {patientName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="notes">Private Notes (Only visible to you)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Add clinical notes, observations, or reminders..."
                            className="h-[200px]"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-healthcare-600 hover:bg-healthcare-700">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Save Notes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
