import React, { useState, useEffect } from 'react';
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
    // Load saved profile data and documents from localStorage
    const savedProfile = localStorage.getItem('healthProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
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

  const handleSaveProfile = () => {
    localStorage.setItem('healthProfile', JSON.stringify(profile));
    toast.success('Health profile saved successfully!');
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
        <h1 className="text-2xl font-bold">Health Profile</h1>
        <Button onClick={handleSaveProfile} className="bg-healthcare-600 hover:bg-healthcare-700">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> Personal Information</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse /> Medical Information</CardTitle>
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Phone /> Emergency Contact</CardTitle>
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FileText /> Medical Documents</CardTitle>
          <CardDescription>Upload and manage your prescriptions, lab results, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-6 text-center mb-4">
              <Input id="doc-upload" type="file" className="hidden" onChange={handleFileUpload} />
              <Label htmlFor="doc-upload" className="cursor-pointer flex flex-col items-center justify-center">
                  <FileUp className="h-10 w-10 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-healthcare-600">Upload a new document</span>
              </Label>
          </div>
          <div className="space-y-2">
            {documents.length > 0 ? documents.map(doc => (
              <div key={doc.name} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {(doc.size / 1024).toFixed(2)} KB - Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteDocument(doc.name)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            )) : <p className="text-sm text-center text-gray-500">No documents uploaded.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthProfile;