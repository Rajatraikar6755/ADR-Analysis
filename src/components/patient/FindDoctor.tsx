import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, Mail, Stethoscope, Calendar, Star, MapPin, Clock, Search, Filter } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { doctors, getDoctorsBySpecialty, getAllSpecialties, Doctor } from '@/data/doctors';
import BookingModal from './BookingModal';

const FindDoctor: React.FC = () => {
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

    const specialties = getAllSpecialties();
    const locations = [...new Set(doctors.map(doctor => doctor.location))];

    // Filter doctors based on search criteria
    const filteredDoctors = doctors.filter(doctor => {
        const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty;
        const matchesSearch = !searchQuery || 
            doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.hospital.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !selectedLocation || doctor.location === selectedLocation;
        
        return matchesSpecialty && matchesSearch && matchesLocation;
    });

    const handleBookAppointment = (doctor: Doctor) => {
        setSelectedDoctor(doctor);
        setIsBookingModalOpen(true);
    };

    const handleCloseBookingModal = () => {
        setIsBookingModalOpen(false);
        setSelectedDoctor(null);
    };

    const clearFilters = () => {
        setSelectedSpecialty(null);
        setSearchQuery('');
        setSelectedLocation(null);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Find & Book a Doctor</h1>
                <p className="text-gray-600">Search for specialists and book appointments with real doctors</p>
            </div>

            {/* Search and Filter Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Doctors
                    </CardTitle>
                    <CardDescription>Find the right specialist for your health needs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="search">Search by name, hospital, or specialty</Label>
                            <Input
                                id="search"
                                placeholder="Search doctors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label>Specialty</Label>
                            <Select onValueChange={setSelectedSpecialty} value={selectedSpecialty || ''}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All Specialties" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Specialties</SelectItem>
                                    {specialties.map(specialty => (
                                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Location</Label>
                            <Select onValueChange={setSelectedLocation} value={selectedLocation || ''}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="All Locations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Locations</SelectItem>
                                    {locations.map(location => (
                                        <SelectItem key={location} value={location}>{location}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    {(selectedSpecialty || searchQuery || selectedLocation) && (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                                Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
                            </p>
                            <Button variant="outline" size="sm" onClick={clearFilters}>
                                <Filter className="h-4 w-4 mr-2" />
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Doctors List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">
                        {selectedSpecialty ? `${selectedSpecialty}s` : "Available Doctors"}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
                    </p>
                </div>

                {filteredDoctors.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredDoctors.map(doctor => (
                            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-20 w-20">
                                            <AvatarImage src={doctor.imageUrl} alt={doctor.name} />
                                            <AvatarFallback className="text-lg">
                                                {doctor.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h3 className="text-lg font-bold">{doctor.name}</h3>
                                                <p className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Stethoscope className="h-4 w-4" /> 
                                                    {doctor.specialty}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                                    <span className="text-sm font-medium">{doctor.rating}</span>
                                                    <span className="text-sm text-gray-500">({doctor.experience})</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 text-sm">
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    {doctor.hospital}, {doctor.location}
                                                </p>
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    <Clock className="h-4 w-4" />
                                                    {doctor.availableTime}
                                                </p>
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="h-4 w-4" />
                                                    {doctor.email}
                                                </p>
                                                <p className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    {doctor.phone}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <div className="text-sm">
                                                    <span className="font-semibold text-green-600">
                                                        ₹{doctor.consultationFee}
                                                    </span>
                                                    <span className="text-gray-500"> consultation fee</span>
                                                </div>
                                                <Button 
                                                    onClick={() => handleBookAppointment(doctor)}
                                                    className="bg-healthcare-600 hover:bg-healthcare-700"
                                                >
                                                    <Calendar className="h-4 w-4 mr-2" />
                                                    Book Appointment
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="space-y-4">
                                <Stethoscope className="h-16 w-16 mx-auto text-gray-400" />
                                <h3 className="text-lg font-semibold text-gray-600">No doctors found</h3>
                                <p className="text-gray-500">
                                    Try adjusting your search criteria or filters to find available doctors.
                                </p>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear All Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={handleCloseBookingModal}
                doctor={selectedDoctor}
            />
        </div>
    );
};

export default FindDoctor;