import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { X, User, Heart, FileText, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';

interface PatientProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
}

interface PatientProfile {
  id: string;
  dob?: string;
  gender?: string;
  bloodType?: string;
  conditions?: string;
  allergies?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PatientDetails {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  open,
  onOpenChange,
  patientId,
  patientName,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [details, setDetails] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && patientId) {
      fetchPatientProfile();
    }
  }, [open, patientId]);

  const fetchPatientProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      // Fetch profile
      const profileRes = await fetch(`/api/appointments/patient/${patientId}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Fetch details
      const detailsRes = await fetch(`/api/appointments/patient/${patientId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      if (detailsRes.ok) {
        const detailsData = await detailsRes.json();
        setDetails(detailsData);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load patient profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'Not provided';
    return new Date(date).toLocaleDateString();
  };

  const parseJsonField = (field: string | undefined) => {
    if (!field) return [];
    try {
      // If it's a JSON string, parse it
      return Array.isArray(JSON.parse(field)) ? JSON.parse(field) : [field];
    } catch {
      // If it's a plain string, split by comma
      return field.split(',').map(item => item.trim()).filter(item => item);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Patient Health Profile
          </DialogTitle>
          <DialogDescription>
            Viewing profile for {patientName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-600"></div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{patientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{details?.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="font-medium">{profile?.dob ? formatDate(profile.dob) : 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium">{profile?.gender || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Blood Type</p>
                  <p className="font-medium">
                    {profile?.bloodType ? (
                      <span className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full">
                        {profile.bloodType}
                      </span>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Medical Conditions</p>
                  {profile?.conditions ? (
                    <div className="flex flex-wrap gap-2">
                      {parseJsonField(profile.conditions).map((condition: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {condition}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No conditions recorded</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-2">Allergies</p>
                  {profile?.allergies ? (
                    <div className="flex flex-wrap gap-2">
                      {parseJsonField(profile.allergies).map((allergy: string, idx: number) => (
                        <span key={idx} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {allergy}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No allergies recorded</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{profile?.emergencyContactName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{profile?.emergencyContactPhone || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Profile Last Updated */}
            {profile?.updatedAt && (
              <div className="text-xs text-gray-500 text-center">
                Last updated: {formatDate(profile.updatedAt)}
              </div>
            )}
          </motion.div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientProfileModal;
