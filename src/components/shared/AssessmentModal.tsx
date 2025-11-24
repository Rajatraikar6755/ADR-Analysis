import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';

interface AssessmentModalProps {
    open: boolean;
    appointmentId: string;
    patientName: string;
    onSubmit: (assessment: string) => Promise<void>;
}

export const AssessmentModal: React.FC<AssessmentModalProps> = ({
    open,
    appointmentId,
    patientName,
    onSubmit,
}) => {
    const [assessment, setAssessment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!assessment.trim()) {
            toast.error('Please write an assessment before submitting');
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(assessment.trim());
            setAssessment(''); // Clear after successful submit
        } catch (error) {
            console.error('Error submitting assessment:', error);
            toast.error('Failed to submit assessment');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Prevent closing if assessment is empty
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen && !assessment.trim()) {
            toast.error('You must write an assessment before closing', {
                duration: 3000,
            });
            return;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="sm:max-w-[600px]"
                onInteractOutside={(e) => {
                    // Prevent closing by clicking outside
                    if (!assessment.trim()) {
                        e.preventDefault();
                        toast.error('You must write an assessment before closing');
                    }
                }}
                onEscapeKeyDown={(e) => {
                    // Prevent closing with Escape key
                    if (!assessment.trim()) {
                        e.preventDefault();
                        toast.error('You must write an assessment before closing');
                    }
                }}
            >
                <DialogHeader>
                    <DialogTitle>Post-Call Assessment Required</DialogTitle>
                    <DialogDescription>
                        Please write a consultation summary for {patientName}. This is mandatory and will be sent to the patient.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                            You cannot close this dialog without writing an assessment. Please provide a detailed summary of the consultation.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assessment">Consultation Assessment *</Label>
                        <Textarea
                            id="assessment"
                            placeholder="Write your consultation summary here... Include diagnosis, recommendations, prescriptions, follow-up instructions, etc."
                            value={assessment}
                            onChange={(e) => setAssessment(e.target.value)}
                            rows={10}
                            className="resize-none"
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-gray-500">
                            {assessment.trim().length} characters
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !assessment.trim()}
                        className="bg-healthcare-600 hover:bg-healthcare-700"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Assessment'
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
