import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, ChevronRight } from 'lucide-react';
import { mockPatients } from '@/lib/mock-data'; // Import our mock data

const PatientList: React.FC = () => {

    const getRiskColor = (risk: string) => {
        if (risk === 'high') return 'text-red-500';
        if (risk === 'medium') return 'text-yellow-500';
        return 'text-green-500';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Patient Management</h1>
            <Card>
                <CardHeader>
                    <CardTitle>My Patients ({mockPatients.length})</CardTitle>
                    <CardDescription>Select a patient to view their profile and assessments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockPatients.map(patient => (
                            <Link to={`/doctor/patient/${patient.id}`} key={patient.id} className="block">
                                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-100/80 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-100 rounded-full">
                                            <User className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{patient.name}</p>
                                            <p className="text-sm text-gray-500">{patient.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-semibold capitalize ${getRiskColor(patient.riskLevel)}`}>
                                            {patient.riskLevel} Risk
                                        </span>
                                        <ChevronRight className="h-5 w-5 text-gray-400" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientList;