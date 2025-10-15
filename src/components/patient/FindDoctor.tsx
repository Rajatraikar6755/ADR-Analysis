import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Globe, Stethoscope, Calendar, Loader2, MapPin, Search } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Label } from 'recharts';

interface Doctor {
    id: string;
    name: string;
    phone: string;
    website: string;
    specialties: string[];
    isOpen: boolean | 'Unknown';
}

const specialtiesList = [
    "Cardiologist", "Dermatologist", "Neurologist", "Oncologist", 
    "Pediatrician", "Psychiatrist", "Gastroenterologist",
    "Endocrinologist", "Ophthalmologist", "Orthopedic Surgeon"
];

const FindDoctor: React.FC = () => {
    const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
    const [radius, setRadius] = useState('5000'); // Default radius 5km
    const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    // Get user location once on component mount
    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
            },
            () => {
                setError("Unable to retrieve your location. Please enable location services in your browser.");
            }
        );
    }, []);

    const fetchNearbyDoctors = useCallback(async () => {
        if (!location) {
            toast.error("Location not available. Please grant permission and try again.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAllDoctors([]);

        try {
            const response = await fetch(`http://localhost:3001/api/nearby-doctors?lat=${location.lat}&lon=${location.lon}&radius=${radius}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch doctors.");
            }
            const data: Doctor[] = await response.json();
            setAllDoctors(data);
            if(data.length === 0) {
              toast.info("No doctors found within this range. Try selecting a larger radius.");
            }
        } catch (err: any) {
            setError(err.message || "An unknown error occurred.");
            toast.error(err.message || "Could not fetch nearby doctors.");
        } finally {
            setIsLoading(false);
        }
    }, [location, radius]);

    const filteredDoctors = selectedSpecialty
        ? allDoctors.filter(doc => doc.specialties.includes(selectedSpecialty))
        : allDoctors;
        
    const handleBookAppointment = (doctorName: string) => {
        toast.success(`Appointment booking initiated with ${doctorName}. This feature is for demo purposes.`);
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-healthcare-600 mb-4" />
                    <p className="font-semibold">Searching for doctors...</p>
                </div>
            );
        }

        if (error && allDoctors.length === 0) {
            return (
                <div className="text-center py-10 text-red-600">
                    <p>{error}</p>
                </div>
            );
        }
        
        if (allDoctors.length === 0 && !isLoading) {
            return (
                <div className="text-center text-gray-500 py-8">
                    <MapPin className="h-10 w-10 mx-auto mb-4 text-gray-400" />
                    <p>Click "Find Doctors" to start a search.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                    {selectedSpecialty ? `Showing results for "${selectedSpecialty.replace('_', ' ')}"` : "Nearby Doctors"}
                </h2>
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                        <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                           <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={`https://ui-avatars.com/api/?name=${doctor.name.replace(' ', '+')}&background=random`} alt={doctor.name} />
                                    <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1 capitalize">
                                        <Stethoscope className="h-4 w-4" /> 
                                        {doctor.specialties.length > 0 ? doctor.specialties.map(s => s.replace(/_/g, ' ')).slice(0, 3).join(', ') : 'General Practice'}
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mt-2 text-sm">
                                        <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {doctor.phone}</p>
                                        {doctor.website !== 'Not available' && (
                                            <a href={doctor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                                <Globe className="h-4 w-4" /> Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <Button onClick={() => handleBookAppointment(doctor.name)} className="mt-2 md:mt-0 bg-healthcare-600 text-white hover:bg-healthcare-700">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Book Appointment
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No doctors found for the selected specialty. Try clearing the filter.</p>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Book an Appointment</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Find Doctors Near You</CardTitle>
                    <CardDescription>Select a search range, filter by specialty, and find a doctor that fits your needs.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <div className='flex-1 space-y-2'>
                        <Label>Search Radius</Label>
                        <Select value={radius} onValueChange={setRadius}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a range..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5000">5 km</SelectItem>
                                <SelectItem value="10000">10 km</SelectItem>
                                <SelectItem value="25000">25 km</SelectItem>
                                <SelectItem value="50000">50 km</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className='flex-1 space-y-2'>
                        <Label>Filter by Specialty</Label>
                        <Select onValueChange={(val) => setSelectedSpecialty(val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Specialties..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={null}>All Specialties</SelectItem>
                                {specialtiesList.map(specialty => (
                                    <SelectItem key={specialty} value={specialty.toLowerCase().replace(' ', '_')}>{specialty}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={fetchNearbyDoctors} disabled={!location || isLoading} className="w-full sm:w-auto">
                        <Search className="h-4 w-4 mr-2"/>
                        Find Doctors
                      </Button>
                    </div>
                </CardContent>
            </Card>

            {renderContent()}
        </div>
    );
};

export default FindDoctor;