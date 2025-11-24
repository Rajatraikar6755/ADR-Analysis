import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Upload, X, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AVAILABLE_SPECIALTIES = [
    "Cardiologist", "Dermatologist", "Neurologist", "Oncologist",
    "Pediatrician", "Surgeon", "Psychiatrist", "Gastroenterologist",
    "Endocrinologist", "Ophthalmologist", "ENT Specialist", "Orthopedic Surgeon",
    "Urologist", "Nephrologist", "Pulmonologist", "Allergist/Immunologist",
    "Anesthesiologist", "Obstetrician-Gynecologist (OB/GYN)"
];

const DoctorProfile: React.FC = () => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [profile, setProfile] = useState({
        qualification: '',
        specialties: [] as string[],
        about: '',
        profilePicture: ''
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/doctors/profile', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setProfile({
                    qualification: data.qualification || '',
                    specialties: data.specialties || [],
                    about: data.about || '',
                    profilePicture: data.profilePicture || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/doctors/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    qualification: profile.qualification,
                    specialties: profile.specialties,
                    about: profile.about
                })
            });

            if (!response.ok) throw new Error('Failed to update profile');

            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/doctors/profile/image', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload image');

            const data = await response.json();
            setProfile(prev => ({ ...prev, profilePicture: data.profilePicture }));
            toast.success('Profile picture updated');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const toggleSpecialty = (specialty: string) => {
        setProfile(prev => {
            const current = prev.specialties;
            if (current.includes(specialty)) {
                return { ...prev, specialties: current.filter(s => s !== specialty) };
            } else {
                return { ...prev, specialties: [...current, specialty] };
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-healthcare-600" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture Card */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Upload a professional photo</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <Avatar className="h-40 w-40 border-4 border-white shadow-lg">
                            <AvatarImage
                                src={profile.profilePicture ? `http://localhost:3001/${profile.profilePicture}` : undefined}
                                className="object-cover"
                            />
                            <AvatarFallback className="text-4xl bg-healthcare-100 text-healthcare-600">
                                {user?.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageUpload}
                        />

                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Upload className="h-4 w-4 mr-2" />
                            )}
                            Change Photo
                        </Button>
                    </CardContent>
                </Card>

                {/* Profile Details Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Professional Details</CardTitle>
                        <CardDescription>Manage your public profile information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="qualification">Qualification</Label>
                            <Input
                                id="qualification"
                                placeholder="e.g. MBBS, MD (Cardiology)"
                                value={profile.qualification}
                                onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Specialties</Label>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {profile.specialties.map(specialty => (
                                    <Badge key={specialty} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                                        {specialty}
                                        <button
                                            onClick={() => toggleSpecialty(specialty)}
                                            className="hover:text-red-500 ml-1"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>

                            <div className="border rounded-md p-3 max-h-48 overflow-y-auto bg-gray-50">
                                <div className="grid grid-cols-2 gap-2">
                                    {AVAILABLE_SPECIALTIES.map(specialty => (
                                        <div
                                            key={specialty}
                                            className={`
                                                flex items-center p-2 rounded cursor-pointer text-sm transition-colors
                                                ${profile.specialties.includes(specialty)
                                                    ? 'bg-healthcare-100 text-healthcare-700 font-medium'
                                                    : 'hover:bg-gray-200 text-gray-700'}
                                            `}
                                            onClick={() => toggleSpecialty(specialty)}
                                        >
                                            {specialty}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="about">About Me</Label>
                            <Textarea
                                id="about"
                                placeholder="Tell patients about your experience and approach..."
                                rows={5}
                                value={profile.about}
                                onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={isSaving} className="bg-healthcare-600 hover:bg-healthcare-700">
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DoctorProfile;
