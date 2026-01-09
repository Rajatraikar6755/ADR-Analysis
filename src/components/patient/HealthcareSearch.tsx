import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Hospital, User, Pill, ExternalLink, Navigation } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface HealthcareFacility {
    name: string;
    type: 'Hospital' | 'Doctor' | 'Medical Store';
    address: string;
    description: string;
    distance?: string;
}

const HealthcareSearch: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [results, setResults] = useState<HealthcareFacility[]>([]);
    const [findingLocation, setFindingLocation] = useState(false);

    const getIcon = (type: string) => {
        switch (type) {
            case 'Hospital': return <Hospital className="h-6 w-6 text-red-500" />;
            case 'Doctor': return <User className="h-6 w-6 text-blue-500" />;
            case 'Medical Store': return <Pill className="h-6 w-6 text-green-500" />;
            default: return <MapPin className="h-6 w-6 text-gray-500" />;
        }
    };

    const handleGetLocation = () => {
        setFindingLocation(true);
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setFindingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setFindingLocation(false);
                toast.success("Location acquired!");
            },
            (error) => {
                console.error("Error getting location:", error);
                toast.error("Failed to get your location. Please check permissions.");
                setFindingLocation(false);
            }
        );
    };

    const searchNearby = async () => {
        if (!location) {
            toast.error("Please provide your location first");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/healthcare/nearby', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ lat: location.lat, lon: location.lon })
            });

            if (!response.ok) throw new Error("Failed to fetch healthcare facilities");

            const data = await response.json();
            setResults(data);
            toast.success(`Found ${data.length} nearby healthcare facilities`);
        } catch (error) {
            console.error("Error searching healthcare:", error);
            toast.error("An error occurred while searching for nearby healthcare");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (location) {
            searchNearby();
        }
    }, [location]);

    const openInMaps = (facility: HealthcareFacility) => {
        const query = encodeURIComponent(`${facility.name} ${facility.address}`);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-healthcare-600 to-healthcare-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Hospital className="h-32 w-32" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Nearby Healthcare</h1>
                    <p className="text-healthcare-100 max-w-2xl">
                        Find hospitals, specialized doctors, and medical stores near you using Gemini AI.
                        Search is grounded in real-time data to give you accurate results.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        {!location ? (
                            <Button
                                onClick={handleGetLocation}
                                className="bg-white text-healthcare-700 hover:bg-healthcare-50"
                                disabled={findingLocation}
                            >
                                {findingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                {findingLocation ? "Locating..." : "Use Current Location"}
                            </Button>
                        ) : (
                            <Button
                                onClick={searchNearby}
                                className="bg-white text-healthcare-700 hover:bg-healthcare-50"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
                                {loading ? "Searching..." : "Refresh Search"}
                            </Button>
                        )}
                        {location && (
                            <div className="flex items-center text-xs text-healthcare-100 bg-white/10 px-3 py-2 rounded-full backdrop-blur-sm">
                                <MapPin className="h-3 w-3 mr-1" />
                                Location Set: {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <Card key={`skeleton-${i}`} className="animate-pulse border-none bg-gray-100 h-48">
                                <CardContent className="p-6">
                                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
                                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                                </CardContent>
                            </Card>
                        ))
                    ) : results.length > 0 ? (
                        results.map((facility, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                            >
                                <Card className="h-full border-healthcare-100 hover:border-healthcare-300 transition-all shadow-sm hover:shadow-md">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-healthcare-50 rounded-lg">
                                                {getIcon(facility.type)}
                                            </div>
                                            {facility.distance && (
                                                <span className="text-xs font-medium text-healthcare-600 bg-healthcare-100 px-2 py-1 rounded-full">
                                                    {facility.distance}
                                                </span>
                                            )}
                                        </div>
                                        <CardTitle className="text-xl mt-3 line-clamp-1">{facility.name}</CardTitle>
                                        <CardDescription className="font-semibold text-healthcare-600">{facility.type}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-gray-600 line-clamp-2">
                                            {facility.description}
                                        </p>
                                        <div className="flex items-start gap-2 text-xs text-gray-500">
                                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                                            <span>{facility.address}</span>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="w-full mt-2 hover:bg-healthcare-600 hover:text-white transition-colors"
                                            onClick={() => openInMaps(facility)}
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            View on Maps
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))
                    ) : !loading && location ? (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-gray-50 inline-flex p-6 rounded-full mb-4">
                                <MapPin className="h-12 w-12 text-gray-300" />
                            </div>
                            <p className="text-gray-500">No facilities found. Try adjusting your position or refreshing.</p>
                        </div>
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-gray-50 inline-flex p-6 rounded-full mb-4">
                                <MapPin className="h-12 w-12 text-gray-300" />
                            </div>
                            <p className="text-gray-500">Enter your location to see nearby healthcare facilities.</p>
                            <Button
                                onClick={handleGetLocation}
                                variant="outline"
                                className="mt-4"
                                disabled={findingLocation}
                            >
                                {findingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                                Get Started
                            </Button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HealthcareSearch;
