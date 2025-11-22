import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  User, 
  Users, 
  Clock, 
  Search, 
  MessageSquare, 
  ChevronDown,
  Filter,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { PatientProfileModal } from './PatientProfileModal';
import { MessagingModal } from './MessagingModal';

interface Appointment {
  id: string;
  patientId: string;
  patient: {
    id: string;
    name: string;
    email: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

// Mock data
const patientsData = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    riskLevel: 'high',
    lastAssessment: '2023-05-01',
    conditions: ['Hypertension', 'Diabetes'],
    medications: ['Lisinopril', 'Metformin', 'Warfarin', 'Aspirin']
  },
  {
    id: '2',
    name: 'Alice Johnson',
    age: 67,
    riskLevel: 'medium',
    lastAssessment: '2023-05-02',
    conditions: ['Arthritis', 'High Cholesterol'],
    medications: ['Simvastatin', 'Ibuprofen']
  },
  {
    id: '3',
    name: 'Robert Smith',
    age: 52,
    riskLevel: 'low',
    lastAssessment: '2023-04-29',
    conditions: ['Allergies'],
    medications: ['Cetirizine']
  },
  {
    id: '4',
    name: 'Mary Williams',
    age: 73,
    riskLevel: 'high',
    lastAssessment: '2023-04-28',
    conditions: ['COPD', 'Atrial Fibrillation'],
    medications: ['Albuterol', 'Digoxin', 'Diltiazem']
  },
  {
    id: '5',
    name: 'James Brown',
    age: 58,
    riskLevel: 'medium',
    lastAssessment: '2023-04-25',
    conditions: ['Depression', 'Anxiety'],
    medications: ['Sertraline', 'Alprazolam']
  }
];

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [messagingModalOpen, setMessagingModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  
  // Fetch appointments on mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/appointments/doctor/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
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
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error('Failed to update appointment');
      toast.success(`Appointment ${newStatus.toLowerCase()}`);
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update appointment');
    }
  };
  
  // Get unique confirmed patients from actual appointment data
  const confirmedAppointments = appointments.filter(a => a.status === 'CONFIRMED');
  
  // Create a map of unique patients from confirmed appointments
  const confirmedPatientsMap = new Map();
  confirmedAppointments.forEach(apt => {
    if (!confirmedPatientsMap.has(apt.patientId)) {
      confirmedPatientsMap.set(apt.patientId, apt.patient);
    }
  });

  // Filter patients based on search query
  const filteredPatients = Array.from(confirmedPatientsMap.values()).filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const filteredAppointments = appointments.filter(appointment => {
    const matchesStatus = statusFilter ? appointment.status === statusFilter : true;
    return matchesStatus;
  });

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Welcome, Dr. {user?.name}</h1>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button variant="outline" size="sm">
            <Clock className="h-4 w-4 mr-2" />
            Office Hours
          </Button>
          <Button size="sm" className="bg-healthcare-600 hover:bg-healthcare-700">
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="bg-danger-50 border-danger-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-danger-500 mr-4" />
              <div>
                <p className="text-xl font-bold">{confirmedAppointments.length}</p>
                <p className="text-sm text-danger-700">Confirmed Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-healthcare-600 mr-4" />
              <div>
                <p className="text-xl font-bold">{confirmedPatientsMap.size}</p>
                <p className="text-sm text-gray-500">Confirmed Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-healthcare-600 mr-4" />
              <div>
                <p className="text-xl font-bold">{pendingCount}</p>
                <p className="text-sm text-gray-500">Pending Appointments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      <Tabs defaultValue="patients">
        <TabsList className="mb-4">
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="patients">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <CardTitle className="text-lg">Confirmed Patients</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search patients"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Patient Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr key={patient.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="bg-gray-200 rounded-full p-2 mr-3">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                              <div>
                                <p className="font-medium">{patient.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-sm text-gray-600">{patient.email}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setSelectedPatient({ id: patient.id, name: patient.name });
                                  setProfileModalOpen(true);
                                }}
                              >
                                View Profile
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-healthcare-600 hover:bg-healthcare-700"
                                onClick={() => {
                                  setSelectedPatient({ id: patient.id, name: patient.name });
                                  setMessagingModalOpen(true);
                                }}
                              >
                                Message
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-gray-500">
                          No patients match the current filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="appointments">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Appointment Requests</CardTitle>
                  <CardDescription>Manage booking requests from patients</CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      <span>{statusFilter ? statusFilter : 'All Status'}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                      All Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('PENDING')}>
                      Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('CONFIRMED')}>
                      Confirmed
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('COMPLETED')}>
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingAppointments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-healthcare-600" />
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-3">
                  {filteredAppointments.map((appointment) => (
                    <div 
                      key={appointment.id} 
                      className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 hover:bg-gray-100 transition"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-lg">{appointment.patient.name}</p>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4 mr-2" />
                          📅 {new Date(appointment.appointmentDate).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })} at {appointment.appointmentTime}
                        </div>
                        {appointment.reason && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Reason:</strong> {appointment.reason}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.patient.email}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          appointment.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800' 
                            : appointment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : appointment.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => updateAppointmentStatus(appointment.id, 'CONFIRMED')}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateAppointmentStatus(appointment.id, 'CANCELLED')}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No appointments found</p>
                </div>
              )}
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedPatient && (
        <>
          <PatientProfileModal
            open={profileModalOpen}
            onOpenChange={setProfileModalOpen}
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
          />
          <MessagingModal
            open={messagingModalOpen}
            onOpenChange={setMessagingModalOpen}
            recipientId={selectedPatient.id}
            recipientName={selectedPatient.name}
          />
        </>
      )}
    </div>
  );
};

export default DoctorDashboard;
