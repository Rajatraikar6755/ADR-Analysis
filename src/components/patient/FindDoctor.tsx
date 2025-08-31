import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, Stethoscope, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const specialties = [
    "Cardiologist", "Dermatologist", "Neurologist", "Oncologist", 
    "Pediatrician", "Surgeon", "Psychiatrist", "Gastroenterologist",
    "Endocrinologist", "Ophthalmologist", "ENT Specialist", "Orthopedic Surgeon",
    "Urologist", "Nephrologist", "Pulmonologist", "Allergist/Immunologist",
    "Anesthesiologist", "Obstetrician-Gynecologist (OB/GYN)"
];

// Mock data for doctors. In a real app, this would come from your database.
const mockDoctors = [
    { name: 'Dr. Jane Smith', specialty: 'Cardiologist', email: 'jane.smith@example.com', phone: '123-456-7890', imageUrl: '/placeholder.svg' },
    { name: 'Dr. John Davis', specialty: 'Dermatologist', email: 'john.davis@example.com', phone: '234-567-8901', imageUrl: '/placeholder.svg' },
    { name: 'Dr. Emily White', specialty: 'Neurologist', email: 'emily.white@example.com', phone: '345-678-9012', imageUrl: '/placeholder.svg' },
    { name: 'Dr. Michael Brown', specialty: 'Cardiologist', email: 'michael.brown@example.com', phone: '456-789-0123', imageUrl: '/placeholder.svg' },
    { name: 'Dr. Sarah Wilson', specialty: 'Pediatrician', email: 'sarah.wilson@example.com', phone: '567-890-1234', imageUrl: '/placeholder.svg' },
];

const FindDoctor: React.FC = () => {
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

    const filteredDoctors = selectedSpecialty
        ? mockDoctors.filter(doc => doc.specialty === selectedSpecialty)
        : mockDoctors;
        
    const handleBookAppointment = (doctorName: string) => {
        // In a real app, this would open a calendar or a booking modal.
        toast.success(`Appointment booking initiated with ${doctorName}. This feature is for demo purposes.`);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Book an Appointment</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Find a Specialist</CardTitle>
                    <CardDescription>Select a specialty to find a doctor that fits your needs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={setSelectedSpecialty}>
                        <SelectTrigger className="w-full md:w-1/2">
                            <SelectValue placeholder="Select a specialty..." />
                        </SelectTrigger>
                        <SelectContent>
                            {specialties.map(specialty => (
                                <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                    {selectedSpecialty ? `Showing ${selectedSpecialty}s` : "Available Doctors"}
                </h2>
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doctor => (
                        <Card key={doctor.name}>
                            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
                                    <AvatarFallback>{doctor.name.charAt(4).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                                    <p className="flex items-center gap-2 text-sm text-gray-600"><Stethoscope className="h-4 w-4" /> {doctor.specialty}</p>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-sm">
                                        <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> {doctor.email}</p>
                                        <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {doctor.phone}</p>
                                    </div>
                                </div>
                                <Button onClick={() => handleBookAppointment(doctor.name)} className="mt-2 md:mt-0">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Appointment
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No doctors found for the selected specialty.</p>
                )}
            </div>
        </div>
    );
};

export default FindDoctor;