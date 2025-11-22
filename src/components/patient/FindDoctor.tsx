import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Stethoscope, Calendar, Loader2, Mail, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

interface Doctor {
  id: string;
  name: string;
  email: string;
}

interface Appointment {
  id: string;
  doctor: Doctor;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
}

const FindDoctor: React.FC = () => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    // Booking form state
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    reason: '',
  });

  // Fetch all doctors on component mount
  useEffect(() => {
    fetchDoctors();
    if (user?.id) {
      fetchMyAppointments();
    }
  }, [user?.id]);

  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/appointments/doctors');
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      toast.error('Failed to load doctors');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/appointments/patient/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setMyAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    }
  };

  const handleBookAppointment = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowBookingModal(true);
  };

  const submitBooking = async () => {
    if (!bookingForm.date || !bookingForm.time || !selectedDoctor) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsBooking(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:3001/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: selectedDoctor.id,
          appointmentDate: bookingForm.date,
          appointmentTime: bookingForm.time,
          reason: bookingForm.reason || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to book appointment');
      }

      const data = await response.json();
      toast.success('Appointment booked successfully! Doctor will receive a notification.');

      // Reset form and close modal
      setBookingForm({ date: '', time: '', reason: '' });
      setShowBookingModal(false);
      setSelectedDoctor(null);

      // Refresh appointments
      fetchMyAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to book appointment');
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/appointments/${appointmentId}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: 'CANCELLED' }),
        }
      );

      if (!response.ok) throw new Error('Failed to cancel appointment');
      toast.success('Appointment cancelled');
      fetchMyAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel appointment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-healthcare-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Available Doctors Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Find & Book Appointments</h1>
        <p className="text-gray-600 mb-6">
          Select a doctor below and choose your preferred date and time for an appointment.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://ui-avatars.com/api/?name=${doctor.name.replace(
                            ' ',
                            '+'
                          )}&background=random`}
                          alt={doctor.name}
                        />
                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{doctor.name}</CardTitle>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Stethoscope className="h-4 w-4" />
                          <span>Medical Professional</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Mail className="h-4 w-4" />
                    {doctor.email}
                  </div>
                  <Button
                    onClick={() => handleBookAppointment(doctor)}
                    className="w-full bg-healthcare-600 hover:bg-healthcare-700 text-white"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p>No doctors available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* My Appointments Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Appointments</h2>

        {myAppointments.length > 0 ? (
          <div className="space-y-3">
            {myAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">Dr. {appointment.doctor.name}</h3>
                      <p className="text-sm text-gray-600">
                        📅{' '}
                        {new Date(appointment.appointmentDate).toLocaleDateString()} at{' '}
                        {appointment.appointmentTime}
                      </p>
                      {appointment.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Reason:</strong> {appointment.reason}
                        </p>
                      )}
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          appointment.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </div>
                    {appointment.status === 'PENDING' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelAppointment(appointment.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <p>You have no appointments yet. Book one from the available doctors above!</p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Appointment with Dr. {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              Select your preferred date and time for the appointment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="appointment-date">Date *</Label>
              <Input
                id="appointment-date"
                type="date"
                value={bookingForm.date}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, date: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-time">Time *</Label>
              <Input
                id="appointment-time"
                type="time"
                value={bookingForm.time}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, time: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="appointment-reason">Reason (Optional)</Label>
              <Textarea
                id="appointment-reason"
                placeholder="Brief description of your health concern..."
                value={bookingForm.reason}
                onChange={(e) =>
                  setBookingForm({ ...bookingForm, reason: e.target.value })
                }
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowBookingModal(false)}
              disabled={isBooking}
            >
              Cancel
            </Button>
            <Button
              onClick={submitBooking}
              disabled={isBooking}
              className="bg-healthcare-600 hover:bg-healthcare-700"
            >
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FindDoctor;