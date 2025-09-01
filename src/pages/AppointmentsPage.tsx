import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Phone, Mail, User, FileText, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

interface Appointment {
    id: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    hospital: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    symptoms: string;
    isFirstVisit: boolean;
    bookingDate: string;
    status: 'confirmed' | 'cancelled' | 'completed';
}

const AppointmentsPage: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = () => {
        const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
        setAppointments(savedAppointments);
    };

    const cancelAppointment = (appointmentId: string) => {
        const updatedAppointments = appointments.map(apt => 
            apt.id === appointmentId ? { ...apt, status: 'cancelled' as const } : apt
        );
        setAppointments(updatedAppointments);
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        toast.success('Appointment cancelled successfully');
    };

    const deleteAppointment = (appointmentId: string) => {
        const updatedAppointments = appointments.filter(apt => apt.id !== appointmentId);
        setAppointments(updatedAppointments);
        localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
        toast.success('Appointment deleted successfully');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredAppointments = filterStatus === 'all' 
        ? appointments 
        : appointments.filter(apt => apt.status === filterStatus);

    const upcomingAppointments = filteredAppointments.filter(apt => 
        new Date(apt.appointmentDate) > new Date() && apt.status === 'confirmed'
    );

    const pastAppointments = filteredAppointments.filter(apt => 
        new Date(apt.appointmentDate) <= new Date() || apt.status !== 'confirmed'
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">My Appointments</h1>
                <p className="text-gray-600">Manage your booked appointments and medical consultations</p>
            </div>

            {/* Filter Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2 flex-wrap">
                        <Button 
                            variant={filterStatus === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('all')}
                        >
                            All ({appointments.length})
                        </Button>
                        <Button 
                            variant={filterStatus === 'confirmed' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('confirmed')}
                        >
                            Confirmed ({appointments.filter(apt => apt.status === 'confirmed').length})
                        </Button>
                        <Button 
                            variant={filterStatus === 'completed' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('completed')}
                        >
                            Completed ({appointments.filter(apt => apt.status === 'completed').length})
                        </Button>
                        <Button 
                            variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('cancelled')}
                        >
                            Cancelled ({appointments.filter(apt => apt.status === 'cancelled').length})
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-green-700">Upcoming Appointments</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {upcomingAppointments.map(appointment => (
                            <Card key={appointment.id} className="border-green-200 bg-green-50">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                                        <Badge className={getStatusColor(appointment.status)}>
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>{appointment.doctorSpecialty}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {appointment.hospital}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {appointment.appointmentTime}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            {appointment.patientName}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            {appointment.reason}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => cancelAppointment(appointment.id)}
                                        >
                                            Cancel Appointment
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => {
                                                // Add reschedule functionality
                                                toast.info('Reschedule feature coming soon!');
                                            }}
                                        >
                                            Reschedule
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Past Appointments */}
            {pastAppointments.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Past Appointments</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {pastAppointments.map(appointment => (
                            <Card key={appointment.id} className="border-gray-200">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">{appointment.doctorName}</CardTitle>
                                        <Badge className={getStatusColor(appointment.status)}>
                                            {appointment.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>{appointment.doctorSpecialty}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2 text-sm">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {appointment.hospital}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            {appointment.appointmentTime}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            {appointment.patientName}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            {appointment.reason}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => {
                                                // Add view details functionality
                                                toast.info('View details feature coming soon!');
                                            }}
                                        >
                                            View Details
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => deleteAppointment(appointment.id)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* No Appointments */}
            {filteredAppointments.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <div className="space-y-4">
                            <Calendar className="h-16 w-16 mx-auto text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-600">No appointments found</h3>
                            <p className="text-gray-500">
                                {appointments.length === 0 
                                    ? "You haven't booked any appointments yet. Start by finding a doctor!"
                                    : "No appointments match your current filter criteria."
                                }
                            </p>
                            {appointments.length === 0 && (
                                <Button 
                                    onClick={() => window.location.href = '/find-doctor'}
                                    className="bg-healthcare-600 hover:bg-healthcare-700"
                                >
                                    Find a Doctor
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AppointmentsPage;
