import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import MainLayout from '@/components/layouts/MainLayout';

interface PendingDoctor {
    id: string;
    licenseNumber: string;
    licenseDocument: string;
    verificationStatus: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

const AdminDashboardPage: React.FC = () => {
    const [pendingDoctors, setPendingDoctors] = useState<PendingDoctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchPendingDoctors();
    }, []);

    const fetchPendingDoctors = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/admin/pending-doctors', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setPendingDoctors(data);
            } else {
                toast.error(data.error || 'Failed to fetch pending doctors');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerify = async (doctorId: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await fetch('http://localhost:3001/api/admin/verify-doctor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ doctorId, status })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                setPendingDoctors(pendingDoctors.filter(d => d.id !== doctorId));
            } else {
                toast.error(data.error || 'Action failed');
            }
        } catch (error) {
            toast.error('Something went wrong');
        }
    };

    return (
        <MainLayout>
            <div className="container mx-auto p-6 space-y-6">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500">Manage doctor verifications and platform settings.</p>
                    </div>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Pending Doctor Verifications</CardTitle>
                        <CardDescription>Review credentials of healthcare professionals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="h-8 w-8 animate-spin text-vibrantBlue" />
                            </div>
                        ) : pendingDoctors.length === 0 ? (
                            <div className="text-center p-8 text-gray-500">No pending verifications.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="py-4 px-4 font-semibold">Doctor Name</th>
                                            <th className="py-4 px-4 font-semibold">Email</th>
                                            <th className="py-4 px-4 font-semibold">License Number</th>
                                            <th className="py-4 px-4 font-semibold">Documents</th>
                                            <th className="py-4 px-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingDoctors.map((doctor) => (
                                            <tr key={doctor.id} className="border-b hover:bg-gray-50 transition-colors">
                                                <td className="py-4 px-4">{doctor.user.name}</td>
                                                <td className="py-4 px-4">{doctor.user.email}</td>
                                                <td className="py-4 px-4 font-mono text-sm">{doctor.licenseNumber}</td>
                                                <td className="py-4 px-4">
                                                    <a
                                                        href={doctor.licenseDocument ? (doctor.licenseDocument.startsWith('http') ? doctor.licenseDocument : `http://localhost:3001/${doctor.licenseDocument}`) : '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center gap-1 text-sm font-medium ${doctor.licenseDocument ? 'text-vibrantBlue hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
                                                        onClick={(e) => !doctor.licenseDocument && e.preventDefault()}
                                                    >
                                                        {doctor.licenseDocument ? 'View License' : 'No Document'} <ExternalLink className="h-3 w-3" />
                                                    </a>
                                                </td>
                                                <td className="py-4 px-4 text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleVerify(doctor.id, 'APPROVED')}
                                                    >
                                                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                                        onClick={() => handleVerify(doctor.id, 'REJECTED')}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" /> Reject
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
};

export default AdminDashboardPage;
