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
  Loader2,
  FileText,
  Video,
  Trash2
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
import { PatientAssessmentsModal } from './PatientAssessmentsModal';
import { AppointmentNotesModal } from './AppointmentNotesModal';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { VideoCallModal } from '@/components/shared/VideoCallModal';
import { AssessmentModal } from '@/components/shared/AssessmentModal';


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
  rescheduleStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  rescheduleDate?: string;
  rescheduleTime?: string;
  rescheduleReason?: string;
  notes?: string;
  hasHadVideoCall?: boolean;
  callDuration?: number;
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
  const [activeTab, setActiveTab] = useState("patients");

  // Modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [messagingModalOpen, setMessagingModalOpen] = useState(false);
  const [assessmentsModalOpen, setAssessmentsModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCountsBySender, setUnreadCountsBySender] = useState<Record<string, number>>({});

  // Video call states
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [callPatient, setCallPatient] = useState<{ id: string; name: string } | null>(null);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callStartTime, setCallStartTime] = useState<string | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);

  // Assessment modal states
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [pendingAssessmentAppointment, setPendingAssessmentAppointment] = useState<{ id: string; patientName: string } | null>(null);

  // Socket.IO connection
  const { socket, isConnected } = useSocket(user?.id);

  // Fetch appointments and unread count on mount
  useEffect(() => {
    fetchAppointments();
    fetchUnreadCount();
    fetchUnreadCountsBySender();

    // Poll for unread messages every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnreadCountsBySender();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/messages/unread/count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchUnreadCountsBySender = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/messages/unread/by-sender', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCountsBySender(data);
      }
    } catch (error) {
      console.error('Error fetching unread counts by sender:', error);
    }
  };

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update appointment';
      toast.error(message);
    }
  };

  const handleRescheduleAction = async (appointmentId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/appointments/${appointmentId}/reschedule-action`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      if (!response.ok) throw new Error('Failed to process reschedule');
      toast.success(`Reschedule request ${action.toLowerCase()}d`);
      fetchAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to process reschedule';
      toast.error(message);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/appointments/${appointmentId}/complete`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete appointment');
      }

      toast.success('Appointment completed successfully');
      fetchAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete appointment';
      toast.error(message);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment record?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3001/api/appointments/${appointmentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete appointment');
      }

      toast.success('Appointment deleted successfully');
      fetchAppointments();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete appointment';
      toast.error(message);
    }
  };

  // Video call handlers
  const handleInitiateCall = (patient: { id: string; name: string }) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server. Please refresh the page.');
      return;
    }

    setCallPatient(patient);
    // setIsInitiator(true); // Removed: Wait for call acceptance
    setCallStartTime(new Date().toISOString());

    // Send call request to patient
    socket.emit('call-request', {
      patientId: patient.id,
      doctorId: user?.id,
      doctorName: user?.name,
    });

    toast.info(`Calling ${patient.name}...`);
  };

  const handleEndCall = async () => {
    if (socket && activeCallId) {
      socket.emit('call-ended', {
        callId: activeCallId,
        endedBy: user?.id,
      });
    }

    // Send call summary message
    if (callPatient && callStartTime) {
      await sendCallSummaryMessage(callPatient.id, callStartTime, new Date().toISOString());
    }

    setVideoCallOpen(false);

    // Find the appointment for this call to create assessment
    if (callPatient) {
      const appointment = appointments.find(
        apt => apt.patientId === callPatient.id && apt.status === 'CONFIRMED'
      );

      if (appointment) {
        setPendingAssessmentAppointment({
          id: appointment.id,
          patientName: callPatient.name
        });
        setAssessmentModalOpen(true);
      }
    }

    setCallPatient(null);
    setActiveCallId(null);
    setCallStartTime(null);
    setIsInitiator(false);
  };

  const handleSubmitAssessment = async (assessment: string) => {
    if (!pendingAssessmentAppointment) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/assessments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: pendingAssessmentAppointment.id,
          assessment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit assessment');
      }

      toast.success('Assessment submitted successfully');
      setAssessmentModalOpen(false);
      setPendingAssessmentAppointment(null);
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error; // Re-throw to let modal handle it
    }
  };

  const sendCallSummaryMessage = async (patientId: string, startTime: string, endTime: string) => {
    try {
      const duration = Math.floor((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000);
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;

      const content = `📞 Video call completed\nDuration: ${minutes}m ${seconds}s\nStarted: ${new Date(startTime).toLocaleTimeString()}\nEnded: ${new Date(endTime).toLocaleTimeString()}`;

      const token = localStorage.getItem('token');
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: patientId,
          content,
        }),
      });
    } catch (error) {
      console.error('Error sending call summary:', error);
    }
  };

  // Socket.IO event listeners for video calls
  useEffect(() => {
    if (!socket) return;

    socket.on('call-accepted', ({ callId, patientId }) => {
      console.log('[Doctor] Call accepted:', callId);
      setVideoCallOpen(true);
      setActiveCallId(callId);
      setCallPatient({ id: patientId, name: 'Patient' }); // Ideally get name from response
      setIsInitiator(true);
    });

    socket.on('call-declined', ({ patientId }) => {
      console.log('[Doctor] Call declined by patient:', patientId);
      toast.error('Patient declined the call');
      setCallPatient(null);
      setIsInitiator(false);
    });

    socket.on('call-failed', ({ reason }) => {
      toast.error(`Call failed: ${reason}`);
      setCallPatient(null);
      setIsInitiator(false);
    });

    socket.on('call-ended', ({ startTime, endTime, duration }) => {
      console.log('[Doctor] Call ended:', { startTime, endTime, duration });
      setVideoCallOpen(false);
      setActiveCallId(null);
      setCallPatient(null);
      toast.info(`Call ended. Duration: ${duration}s`);

      // Send call summary message
      if (callPatient) {
        // Assuming sendMessage is a function available in this scope, e.g., from a messaging context
        // For now, we'll use sendCallSummaryMessage as it's defined.
        sendCallSummaryMessage(callPatient.id, startTime, endTime || new Date().toISOString());
      }

      setVideoCallOpen(false);
      setCallPatient(null);
      setActiveCallId(null);
      setCallStartTime(null);
      setIsInitiator(false);
      toast.info('Call ended');
    });

    return () => {
      socket.off('call-accepted');
      socket.off('call-declined');
      socket.off('call-failed');
      socket.off('call-ended');
    };
  }, [socket, callPatient, callStartTime]);

  // WebRTC hook
  const webRTC = useWebRTC({
    socket,
    isInitiator,
    remotePeerId: callPatient?.id || '',
    onCallEnded: handleEndCall,
  });


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
    if (statusFilter === 'PENDING') {
      return appointment.status === 'PENDING' || appointment.rescheduleStatus === 'PENDING';
    }
    const matchesStatus = statusFilter ? appointment.status === statusFilter : true;
    return matchesStatus;
  });

  const pendingCount = appointments.filter(a => a.status === 'PENDING' || a.rescheduleStatus === 'PENDING').length;
  const confirmedCount = appointments.filter(a => a.status === 'CONFIRMED').length;
  const todayAppointmentsCount = appointments.filter(a =>
    a.status === 'CONFIRMED' &&
    new Date(a.appointmentDate).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Welcome, Dr. {user?.name}</h1>
        <div className="flex gap-2 mt-2 sm:mt-0">
          {/* Removed Office Hours and Messages buttons */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="bg-danger-50 border-danger-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-danger-500 mr-4" />
                <div>
                  <p className="text-xl font-bold">{todayAppointmentsCount}</p>
                  <p className="text-sm text-danger-700">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setActiveTab("patients");
            }}
          >
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
          <Card
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setActiveTab("appointments");
              setStatusFilter("PENDING");
            }}
          >
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-healthcare-600 mr-4" />
                <div>
                  <p className="text-xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-gray-500">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                                  className="bg-healthcare-600 hover:bg-healthcare-700 relative"
                                  onClick={() => {
                                    setSelectedPatient({ id: patient.id, name: patient.name });
                                    setMessagingModalOpen(true);
                                  }}
                                >
                                  Message
                                  {/* Unread Badge */}
                                  {unreadCountsBySender[patient.id] > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                      {unreadCountsBySender[patient.id]}
                                    </span>
                                  )}
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleInitiateCall({ id: patient.id, name: patient.name })}
                                >
                                  <Video className="h-4 w-4" />
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
                          {appointment.notes && (
                            <div className="mt-2 bg-yellow-50 p-2 rounded border border-yellow-100">
                              <p className="text-xs font-semibold text-yellow-800 flex items-center">
                                <FileText className="h-3 w-3 mr-1" /> Private Note:
                              </p>
                              <p className="text-xs text-yellow-900 mt-1">{appointment.notes}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setNotesModalOpen(true);
                            }}
                            title="Add Note"
                          >
                            <FileText className="h-4 w-4 text-gray-500" />
                          </Button>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${appointment.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : appointment.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {appointment.status}
                          </span>

                          {/* Reschedule Request Badge */}
                          {appointment.rescheduleStatus === 'PENDING' && appointment.rescheduleDate && (
                            <div className="bg-orange-50 border border-orange-200 rounded-md p-2 text-sm">
                              <p className="font-semibold text-orange-800 flex items-center gap-1">
                                <Clock className="h-3 w-3" /> Reschedule Requested
                              </p>
                              <p className="text-orange-700 mt-1">
                                New: {new Date(appointment.rescheduleDate!).toLocaleDateString()} at {appointment.rescheduleTime}
                              </p>
                              {appointment.rescheduleReason && (
                                <p className="text-orange-600 text-xs mt-1 italic">"{appointment.rescheduleReason}"</p>
                              )}
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-orange-600 hover:bg-orange-700"
                                  onClick={() => handleRescheduleAction(appointment.id, 'APPROVE')}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-orange-200 text-orange-700 hover:bg-orange-100"
                                  onClick={() => handleRescheduleAction(appointment.id, 'REJECT')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Complete Appointment Button */}
                          {appointment.status === 'CONFIRMED' && appointment.hasHadVideoCall && appointment.callDuration && appointment.callDuration >= 30 && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => handleCompleteAppointment(appointment.id)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Complete Appointment
                              </Button>
                            </div>
                          )}

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

                          {appointment.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteAppointment(appointment.id)}
                              title="Delete Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
          <PatientAssessmentsModal
            open={assessmentsModalOpen}
            onOpenChange={setAssessmentsModalOpen}
            patientId={selectedPatient.id}
            patientName={selectedPatient.name}
          />
        </>
      )}

      {selectedAppointment && (
        <AppointmentNotesModal
          open={notesModalOpen}
          onOpenChange={setNotesModalOpen}
          appointmentId={selectedAppointment.id}
          patientName={selectedAppointment.patient.name}
          initialNotes={selectedAppointment.notes}
          onSave={fetchAppointments}
        />
      )}

      {/* Video Call Modal */}
      {callPatient && (
        <VideoCallModal
          open={videoCallOpen}
          localStream={webRTC.localStream}
          remoteStream={webRTC.remoteStream}
          isAudioMuted={webRTC.isAudioMuted}
          isVideoOff={webRTC.isVideoOff}
          connectionState={webRTC.connectionState}
          remoteName={callPatient.name}
          onToggleAudio={webRTC.toggleAudio}
          onToggleVideo={webRTC.toggleVideo}
          onEndCall={handleEndCall}
        />
      )}

      {/* Assessment Modal */}
      {pendingAssessmentAppointment && (
        <AssessmentModal
          open={assessmentModalOpen}
          appointmentId={pendingAssessmentAppointment.id}
          patientName={pendingAssessmentAppointment.patientName}
          onSubmit={handleSubmitAssessment}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
