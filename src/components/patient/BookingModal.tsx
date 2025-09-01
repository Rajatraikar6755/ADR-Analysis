import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, Phone, Mail, Star } from 'lucide-react';
import { Doctor } from '@/data/doctors';
import { toast } from '@/components/ui/sonner';

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
}

interface BookingForm {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    symptoms: string;
    isFirstVisit: boolean;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, doctor }) => {
    const [formData, setFormData] = useState<BookingForm>({
        patientName: '',
        patientEmail: '',
        patientPhone: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        symptoms: '',
        isFirstVisit: true
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const timeSlots = [
        '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '12:00 PM', '12:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
        '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM'
    ];

    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();
        
        // Generate next 30 days
        for (let i = 1; i <= 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            // Check if doctor is available on this day
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            if (doctor?.availableDays.includes(dayName)) {
                dates.push({
                    date: date.toISOString().split('T')[0],
                    day: dayName
                });
            }
        }
        
        return dates;
    };

    const handleInputChange = (field: keyof BookingForm, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!doctor) return;

        // Validate form
        if (!formData.patientName || !formData.patientEmail || !formData.patientPhone || 
            !formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Save booking to localStorage
            const bookings = JSON.parse(localStorage.getItem('appointments') || '[]');
            const newBooking = {
                id: Date.now().toString(),
                doctorId: doctor.id,
                doctorName: doctor.name,
                doctorSpecialty: doctor.specialty,
                hospital: doctor.hospital,
                ...formData,
                bookingDate: new Date().toISOString(),
                status: 'confirmed'
            };
            
            bookings.push(newBooking);
            localStorage.setItem('appointments', JSON.stringify(bookings));

            toast.success(`Appointment booked successfully with ${doctor.name}!`);
            
            // Reset form
            setFormData({
                patientName: '',
                patientEmail: '',
                patientPhone: '',
                appointmentDate: '',
                appointmentTime: '',
                reason: '',
                symptoms: '',
                isFirstVisit: true
            });
            
            onClose();
        } catch (error) {
            toast.error('Failed to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!doctor) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Book Appointment with {doctor.name}
                    </DialogTitle>
                    <DialogDescription>
                        Schedule your appointment with {doctor.specialty} at {doctor.hospital}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Doctor Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start gap-4">
                            <img 
                                src={doctor.imageUrl} 
                                alt={doctor.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    <span className="text-sm">{doctor.rating} ({doctor.experience})</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    <MapPin className="h-3 w-3 inline mr-1" />
                                    {doctor.hospital}, {doctor.location}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {doctor.availableTime} | ₹{doctor.consultationFee}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="patientName">Full Name *</Label>
                                <Input
                                    id="patientName"
                                    value={formData.patientName}
                                    onChange={(e) => handleInputChange('patientName', e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="patientEmail">Email *</Label>
                                <Input
                                    id="patientEmail"
                                    type="email"
                                    value={formData.patientEmail}
                                    onChange={(e) => handleInputChange('patientEmail', e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="patientPhone">Phone Number *</Label>
                                <Input
                                    id="patientPhone"
                                    value={formData.patientPhone}
                                    onChange={(e) => handleInputChange('patientPhone', e.target.value)}
                                    placeholder="Enter your phone number"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="appointmentDate">Preferred Date *</Label>
                                <Select 
                                    value={formData.appointmentDate} 
                                    onValueChange={(value) => handleInputChange('appointmentDate', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a date" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableDates().map(({ date, day }) => (
                                            <SelectItem key={date} value={date}>
                                                {new Date(date).toLocaleDateString('en-US', { 
                                                    month: 'short', 
                                                    day: 'numeric' 
                                                })} ({day})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="appointmentTime">Preferred Time *</Label>
                                <Select 
                                    value={formData.appointmentTime} 
                                    onValueChange={(value) => handleInputChange('appointmentTime', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {timeSlots.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="isFirstVisit">Visit Type</Label>
                                <Select 
                                    value={formData.isFirstVisit ? 'first' : 'followup'} 
                                    onValueChange={(value) => handleInputChange('isFirstVisit', value === 'first')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="first">First Visit</SelectItem>
                                        <SelectItem value="followup">Follow-up Visit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="reason">Reason for Visit *</Label>
                            <Input
                                id="reason"
                                value={formData.reason}
                                onChange={(e) => handleInputChange('reason', e.target.value)}
                                placeholder="Brief reason for consultation"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="symptoms">Symptoms (Optional)</Label>
                            <Textarea
                                id="symptoms"
                                value={formData.symptoms}
                                onChange={(e) => handleInputChange('symptoms', e.target.value)}
                                placeholder="Describe your symptoms in detail"
                                rows={3}
                            />
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Important Information</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Please arrive 15 minutes before your appointment time</li>
                                <li>• Bring your previous medical records if applicable</li>
                                <li>• Consultation fee: ₹{doctor.consultationFee}</li>
                                <li>• Payment to be made at the hospital reception</li>
                                <li>• Cancellation policy: 24 hours notice required</li>
                            </ul>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className="flex-1"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
