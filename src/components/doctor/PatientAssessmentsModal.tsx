import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Assessment {
    id: string;
    riskPercentage: number;
    summary: string;
    medications: { name: string }[];
    createdAt: string;
}

interface PatientAssessmentsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    patientId: string;
    patientName: string;
}

export const PatientAssessmentsModal: React.FC<PatientAssessmentsModalProps> = ({
    open,
    onOpenChange,
    patientId,
    patientName,
}) => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3001/api/appointments/patient/${patientId}/assessments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setAssessments(data);
            }
        } catch (error) {
            console.error('Error fetching assessments:', error);
        } finally {
            setLoading(false);
        }
    }, [patientId]);

    useEffect(() => {
        if (open && patientId) {
            fetchAssessments();
        }
    }, [open, patientId, fetchAssessments]);



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle>Risk Assessments for {patientName}</DialogTitle>
                    <DialogDescription>
                        Review past medication risk analyses.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-[500px] pr-4">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-healthcare-600" />
                        </div>
                    ) : assessments.length > 0 ? (
                        <div className="space-y-4">
                            {assessments.map((assessment) => (
                                <Card key={assessment.id}>
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-base font-semibold flex items-center">
                                                <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                                {new Date(assessment.createdAt).toLocaleDateString()}
                                            </CardTitle>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${assessment.riskPercentage > 70 ? 'bg-red-100 text-red-800' :
                                                assessment.riskPercentage > 30 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                Risk: {assessment.riskPercentage}%
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 mb-2">{assessment.summary}</p>
                                        <div className="text-xs text-gray-500">
                                            <strong>Medications:</strong> {assessment.medications.map((m) => m.name).join(', ')}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                            <p>No assessments found for this patient.</p>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
