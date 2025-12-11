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
  profile?: {
    qualification?: string;
    specialties?: string[];
    about?: string;
    profilePicture?: string;
  };
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

      // Fetch profile for each doctor
      const doctorsWithProfiles = await Promise.all(
        data.map(async (doctor: Doctor) => {
          try {
            const profileResponse = await fetch(`http://localhost:3001/api/doctors/${doctor.id}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              return {
                ...doctor,
                profile: {
                  qualification: profileData.qualification,
                  specialties: profileData.specialties || [],
                  about: profileData.about,
                  profilePicture: profileData.profilePicture
                }
              };
            }
          } catch (err) {
            console.error(`Failed to fetch profile for doctor ${doctor.id}:`, err);
          }
          return doctor;
        })
      );

      setDoctors(doctorsWithProfiles);
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
    // Check if patient already has a pending or confirmed appointment with this doctor
    const existingAppointment = myAppointments.find(
      apt => apt.doctor.id === doctor.id && (apt.status === 'PENDING' || apt.status === 'CONFIRMED')
    );

    if (existingAppointment) {
      toast.error(
        `You already have a ${existingAppointment.status.toLowerCase()} appointment with Dr. ${doctor.name}. Please wait for it to be completed before booking another one.`,
        { duration: 5000 }
      );
      return;
    }

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

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete appointment');
      }

      toast.success('Appointment deleted successfully');
      fetchMyAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(message);
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
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={doctor.profile?.profilePicture
                            ? `http://localhost:3001/${doctor.profile.profilePicture}`
                            : `https://ui-avatars.com/api/?name=${doctor.name.replace(' ', '+')}&background=random`}
                          alt={doctor.name}
                        />
                        <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">Dr. {doctor.name}</CardTitle>
                        {doctor.profile?.qualification && (
                          <p className="text-sm text-gray-600 mt-1">{doctor.profile.qualification}</p>
                        )}
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <Stethoscope className="h-4 w-4" />
                          <span>Medical Professional</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {doctor.profile?.specialties && doctor.profile.specialties.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {doctor.profile.specialties.slice(0, 3).map((specialty, idx) => (
                          <span key={idx} className="px-2 py-1 bg-healthcare-100 text-healthcare-700 rounded-full text-xs">
                            {specialty}
                          </span>
                        ))}
                        {doctor.profile.specialties.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{doctor.profile.specialties.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {doctor.profile?.about && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-700 line-clamp-2">{doctor.profile.about}</p>
                    </div>
                  )}

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
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${appointment.status === 'CONFIRMED'
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
                    {(appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
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