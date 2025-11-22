import React, { useState, useEffect } from 'react';
import Reveal from '@/components/ui/Reveal';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, Save, User, HeartPulse, Shield, Phone, FileText, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileData {
  fullName: string;
  dob: string;
  gender: string;
  bloodType: string;
  conditions: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

interface MedicalDocument {
  name: string;
  size: number;
  uploadDate: string;
}

const HealthProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    fullName: user?.name || '',
    dob: '',
    gender: '',
    bloodType: '',
    conditions: '',
    allergies: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);

  useEffect(() => {
    // Load saved profile data from backend
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        // Get the current user's ID from the auth context
        const userId = user?.id;
        
        if (!userId) {
          console.error('User ID not available');
          return;
        }

        const res = await fetch(`/api/appointments/patient/${userId}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(prev => ({
            ...prev,
            dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
            gender: data.gender || '',
            bloodType: data.bloodType || '',
            conditions: data.conditions || '',
            allergies: data.allergies || '',
            emergencyContactName: data.emergencyContactName || '',
            emergencyContactPhone: data.emergencyContactPhone || '',
          }));
        } else if (res.status === 404) {
          // Profile doesn't exist yet, load from localStorage
          const savedProfile = localStorage.getItem('healthProfile');
          if (savedProfile) {
            setProfile(JSON.parse(savedProfile));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // Fall back to localStorage
        const savedProfile = localStorage.getItem('healthProfile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      }
    };

    loadProfile();

    // Load documents from localStorage
    const savedDocs = localStorage.getItem('medicalDocuments');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Check if token exists
      if (!token) {
        toast.error('Session expired. Please log in again.');
        return;
      }

      // Validate that we have required data
      if (!profile.dob && !profile.gender && !profile.bloodType && 
          !profile.conditions && !profile.allergies && 
          !profile.emergencyContactName && !profile.emergencyContactPhone) {
        toast.error('Please fill in at least one health profile field');
        return;
      }

      // Save to backend
      console.log('Sending health profile to:', '/api/appointments/health-profile');
      console.log('Profile data:', {
        dob: profile.dob || null,
        gender: profile.gender || null,
        bloodType: profile.bloodType || null,
        conditions: profile.conditions || null,
        allergies: profile.allergies || null,
        emergencyContactName: profile.emergencyContactName || null,
        emergencyContactPhone: profile.emergencyContactPhone || null,
      });
      console.log('Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');

      const res = await fetch('/api/appointments/health-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dob: profile.dob || null,
          gender: profile.gender || null,
          bloodType: profile.bloodType || null,
          conditions: profile.conditions || null,
          allergies: profile.allergies || null,
          emergencyContactName: profile.emergencyContactName || null,
          emergencyContactPhone: profile.emergencyContactPhone || null,
        }),
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);

      if (res.ok) {
        const data = await res.json();
        console.log('Profile saved:', data);
        // Also save to localStorage for local access
        localStorage.setItem('healthProfile', JSON.stringify(profile));
        toast.success('Health profile saved successfully!');
      } else {
        const contentType = res.headers.get('content-type');
        let errorMessage = 'Failed to save profile';
        
        try {
          if (contentType && contentType.includes('application/json')) {
            const error = await res.json();
            console.error('API Error:', error);
            errorMessage = error.error || errorMessage;
          } else {
            const text = await res.text();
            console.error('Server error:', text);
            errorMessage = `Server error (${res.status}): ${text.substring(0, 100)}`;
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          errorMessage = `Server error (${res.status})`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Network error:', error);
      toast.error(error.message || 'Network error while saving profile');
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc: MedicalDocument = {
        name: file.name,
        size: file.size,
        uploadDate: new Date().toISOString()
      };
      const updatedDocs = [...documents, newDoc];
      setDocuments(updatedDocs);
      localStorage.setItem('medicalDocuments', JSON.stringify(updatedDocs));
      toast.success(`${file.name} uploaded and saved.`);
    }
  };
  
  const deleteDocument = (docName: string) => {
    const updatedDocs = documents.filter(doc => doc.name !== docName);
    setDocuments(updatedDocs);
    localStorage.setItem('medicalDocuments', JSON.stringify(updatedDocs));
    toast.info(`${docName} has been removed.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Reveal>
          <h1 className="text-2xl font-bold animate-slide-in-up">Health Profile</h1>
        </Reveal>
        <Reveal delay={0.06}>
          <Button onClick={handleSaveProfile} className="bg-gradient-accent text-white hover:opacity-90 animate-zoom-in">
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </Reveal>
      </div>

      <Card className="animate-zoom-in">
        <CardHeader>
          <Reveal>
            <CardTitle className="flex items-center gap-2 animate-slide-in-up"><User /> Personal Information</CardTitle>
          </Reveal>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" value={profile.fullName} onChange={handleProfileChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" name="dob" type="date" value={profile.dob} onChange={handleProfileChange} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select name="gender" value={profile.gender} onValueChange={(val) => handleSelectChange('gender', val)}>
              <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
                <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Blood Type</Label>
            <Select name="bloodType" value={profile.bloodType} onValueChange={(val) => handleSelectChange('bloodType', val)}>
                <SelectTrigger><SelectValue placeholder="Select blood type" /></SelectTrigger>
                <SelectContent>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="animate-zoom-in">
        <CardHeader>
          <Reveal>
            <CardTitle className="flex items-center gap-2 animate-slide-in-up"><HeartPulse /> Medical Information</CardTitle>
          </Reveal>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <Label htmlFor="conditions">Chronic Conditions</Label>
                <Textarea id="conditions" name="conditions" placeholder="List any chronic conditions like diabetes, asthma..." value={profile.conditions} onChange={handleProfileChange}/>
            </div>
            <div>
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea id="allergies" name="allergies" placeholder="List any known allergies to medication or food..." value={profile.allergies} onChange={handleProfileChange}/>
            </div>
        </CardContent>
      </Card>
      
      <Card className="animate-zoom-in">
        <CardHeader>
          <Reveal>
            <CardTitle className="flex items-center gap-2 animate-slide-in-up"><Phone /> Emergency Contact</CardTitle>
          </Reveal>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Contact Name</Label>
                <Input id="emergencyContactName" name="emergencyContactName" placeholder="e.g., Jane Doe" value={profile.emergencyContactName} onChange={handleProfileChange}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                <Input id="emergencyContactPhone" name="emergencyContactPhone" type="tel" placeholder="e.g., +1 123-456-7890" value={profile.emergencyContactPhone} onChange={handleProfileChange}/>
            </div>
        </CardContent>
      </Card>
      
      <Card className="animate-zoom-in">
        <CardHeader>
          <Reveal>
            <CardTitle className="flex items-center gap-2 animate-slide-in-up"><FileText /> Medical Documents</CardTitle>
          </Reveal>
          <Reveal delay={0.06}>
            <CardDescription className="animate-fade-in-up">Upload and manage your prescriptions, lab results, etc.</CardDescription>
          </Reveal>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center mb-4 animate-slide-in-up">
              <Input id="doc-upload" type="file" className="hidden" onChange={handleFileUpload} />
              <Label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-healthcare-600">Upload a new document</span>
              </Label>
          </div>
          <div className="space-y-2">
            {documents.length > 0 ? documents.map((doc, idx) => (
              <motion.div key={doc.name} className="flex items-center justify-between p-2 bg-gray-50 rounded border hover:shadow-sm transition-shadow" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.35, delay: 0.04 * idx }}>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {(doc.size / 1024).toFixed(2)} KB - Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteDocument(doc.name)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </motion.div>
            )) : <p className="text-sm text-center text-gray-500">No documents uploaded.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthProfile;