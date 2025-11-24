import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface RescheduleModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    appointmentId: string;
    currentDate: string;
    currentTime: string;
    onSuccess: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
    open,
    onOpenChange,
    appointmentId,
    currentDate,
    currentTime,
    onSuccess,
}) => {
    const [date, setDate] = useState<Date | undefined>(new Date(currentDate));
    const [time, setTime] = useState(currentTime);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!date || !time || !reason.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    date: date.toISOString(),
                    time,
                    reason,
                }),
            });

            if (res.ok) {
                toast.success('Reschedule request sent');
                onSuccess();
                onOpenChange(false);
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to request reschedule');
            }
        } catch (error) {
            console.error('Error rescheduling:', error);
            toast.error('Failed to request reschedule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                    <DialogDescription>
                        Propose a new time for your appointment. The doctor will need to approve this change.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>New Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date()}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="time">New Time</Label>
                        <div className="relative">
                            <Clock className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                id="time"
                                type="time"
                                className="pl-8"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="reason">Reason for Rescheduling</Label>
                        <Textarea
                            id="reason"
                            placeholder="I have a conflict..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-healthcare-600 hover:bg-healthcare-700">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
