import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Calendar, User, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Assessment {
    id: string;
    assessment: string;
    createdAt: string;
    doctor: {
        id: string;
        name: string;
        email: string;
    };
    appointment: {
        appointmentDate: string;
        appointmentTime: string;
        reason?: string;
    };
}

interface DoctorGroup {
    doctor: Assessment['doctor'];
    assessments: Assessment[];
}

export const PatientAssessments: React.FC = () => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/assessments/patient', {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) throw new Error('Failed to fetch assessments');
            const data = await response.json();
            setAssessments(data);
        } catch (error) {
            console.error('Error fetching assessments:', error);
            toast.error('Failed to load assessments');
        } finally {
            setIsLoading(false);
        }
    };

    // Group assessments by doctor
    const groupedAssessments: DoctorGroup[] = Object.values(
        assessments.reduce((acc, assessment) => {
            const doctorId = assessment.doctor.id;
            if (!acc[doctorId]) {
                acc[doctorId] = {
                    doctor: assessment.doctor,
                    assessments: [],
                };
            }
            acc[doctorId].assessments.push(assessment);
            return acc;
        }, {} as Record<string, DoctorGroup>)
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-healthcare-600" />
            </div>
        );
    }

    if (assessments.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-lg font-medium">No Assessments Yet</p>
                        <p className="text-sm mt-1">
                            Your consultation reports will appear here after video calls with doctors
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Medical Assessments</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Consultation reports from your doctors
                    </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                    {assessments.length} {assessments.length === 1 ? 'Report' : 'Reports'}
                </Badge>
            </div>

            {/* Doctor List - Like WhatsApp Contacts */}
            <div className="space-y-2">
                {groupedAssessments.map(({ doctor, assessments: doctorAssessments }) => (
                    <motion.div key={doctor.id} layout>
                        <Card
                            className={`cursor-pointer transition-all hover:shadow-md ${selectedDoctorId === doctor.id ? 'ring-2 ring-healthcare-500' : ''
                                }`}
                            onClick={() => setSelectedDoctorId(selectedDoctorId === doctor.id ? null : doctor.id)}
                        >
                            <CardHeader className="py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-healthcare-100 flex items-center justify-center">
                                            <User className="h-6 w-6 text-healthcare-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                                            <p className="text-sm text-gray-500">{doctor.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-healthcare-100 text-healthcare-700">
                                            {doctorAssessments.length} {doctorAssessments.length === 1 ? 'Report' : 'Reports'}
                                        </Badge>
                                        <ChevronRight
                                            className={`h-5 w-5 text-gray-400 transition-transform ${selectedDoctorId === doctor.id ? 'rotate-90' : ''
                                                }`}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            {/* Expanded Assessments - Like WhatsApp Messages */}
                            <AnimatePresence>
                                {selectedDoctorId === doctor.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <CardContent className="pt-0 pb-4 space-y-3">
                                            {doctorAssessments.map((assessment, index) => (
                                                <motion.div
                                                    key={assessment.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    className={`p-4 rounded-lg border ${index === 0
                                                            ? 'bg-blue-50 border-blue-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {new Date(assessment.appointment.appointmentDate).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                })}{' '}
                                                                at {assessment.appointment.appointmentTime}
                                                            </span>
                                                        </div>
                                                        {index === 0 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Latest
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {assessment.appointment.reason && (
                                                        <div className="mb-2 text-sm text-gray-600">
                                                            <span className="font-semibold">Reason:</span> {assessment.appointment.reason}
                                                        </div>
                                                    )}

                                                    <div className="bg-white p-3 rounded border border-gray-200">
                                                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                            <FileText className="h-4 w-4" />
                                                            Consultation Report
                                                        </h4>
                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                                            {assessment.assessment}
                                                        </p>
                                                    </div>

                                                    <div className="mt-2 text-xs text-gray-500">
                                                        Submitted on {new Date(assessment.createdAt).toLocaleString()}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </CardContent>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
