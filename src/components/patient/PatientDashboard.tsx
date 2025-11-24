import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageSquare, Pill, FilePlus, FileText, Activity, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { PatientMessagingModal } from './PatientMessagingModal';
import { RescheduleModal } from './RescheduleModal';
import { PatientAssessments } from './PatientAssessments';
import { useSocket } from '@/hooks/useSocket';
import { useWebRTC } from '@/hooks/useWebRTC';
import { IncomingCallModal } from '@/components/patient/IncomingCallModal';
import { VideoCallModal } from '@/components/shared/VideoCallModal';

interface SavedAssessment {
  id: string;
  date: string;
  medications: { name: string }[];
  riskPercentage: number;
}

interface Appointment {
  id: string;
  doctorId: string;
  doctor: {
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

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentAssessments, setRecentAssessments] = useState<SavedAssessment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [messagingModalOpen, setMessagingModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<{ id: string; name: string; status: string } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Video call states
  const [incomingCall, setIncomingCall] = useState<{
    callId: string;
    doctorId: string;
    doctorName: string;
  } | null>(null);
  const [videoCallOpen, setVideoCallOpen] = useState(false);
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [callDoctor, setCallDoctor] = useState<{ id: string; name: string } | null>(null);
  const [callStartTime, setCallStartTime] = useState<string | null>(null);

  // Socket.IO connection
  const { socket, isConnected } = useSocket(user?.id);
  useEffect(() => {
    const saved = localStorage.getItem('adr-assessments');
    if (saved) {
      setRecentAssessments(JSON.parse(saved));
    }
  }, []);

  // Fetch real appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setLoadingAppointments(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/appointments/patient/appointments', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error: unknown) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  const fetchUnreadCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/messages/unread/by-sender', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        console.log('[Patient] Unread counts by sender:', data);
        setUnreadCounts(data);
      } else {
        console.error('[Patient] Failed to fetch unread counts, status:', res.status);
      }
    } catch (error) {
      console.error('[Patient] Error fetching unread counts:', error);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
    fetchUnreadCounts();

    // Poll for unread counts every 10 seconds
    const interval = setInterval(fetchUnreadCounts, 10000);
    return () => clearInterval(interval);
  }, [fetchAppointments, fetchUnreadCounts]);

  // Socket.IO event listeners for video calls
  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', (data) => {
      console.log('[Patient] Incoming call:', data);
      setIncomingCall(data);
    });

    socket.on('call-ended', ({ startTime, endTime, duration }) => {
      console.log('[Patient] Call ended event received', { startTime, endTime, duration });
      setVideoCallOpen(false);
      setActiveCallId(null);
      setCallDoctor(null);
      setIncomingCall(null);
      toast.info('Call ended');
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-ended');
    };
  }, [socket]);

  // WebRTC hook
  const webRTC = useWebRTC({
    socket,
    isInitiator: false,
    remotePeerId: callDoctor?.id || '',
    onCallEnded: () => {
      setVideoCallOpen(false);
      setActiveCallId(null);
      setCallDoctor(null);
    },
  });

  const handleAcceptCall = () => {
    if (!socket || !incomingCall) {
      console.error('[Patient] Cannot accept call: socket or incomingCall missing', { socket: !!socket, incomingCall });
      return;
    }

    console.log('[Patient] Accepting call:', incomingCall.callId);
    socket.emit('call-response', {
      callId: incomingCall.callId,
      doctorId: incomingCall.doctorId,
      patientId: user?.id,
      accepted: true,
    });

    setActiveCallId(incomingCall.callId);
    setCallDoctor({ id: incomingCall.doctorId, name: incomingCall.doctorName });
    setVideoCallOpen(true);
    setIncomingCall(null);
  };

  const handleDeclineCall = () => {
    if (!socket || !incomingCall) return;

    socket.emit('call-response', {
      callId: incomingCall.callId,
      doctorId: incomingCall.doctorId,
      patientId: user?.id,
      accepted: false,
    });

    setIncomingCall(null);
  };

  const handleEndCall = () => {
    if (socket && activeCallId) {
      socket.emit('call-ended', {
        callId: activeCallId,
        endedBy: user?.id,
      });
    }
    setVideoCallOpen(false);
    setActiveCallId(null);
    setCallDoctor(null);
  };



  const handleMessageClick = (appointment: Appointment) => {
    setSelectedDoctor({
      id: appointment.doctorId,
      name: appointment.doctor.name,
      status: appointment.status,
    });
    setMessagingModalOpen(true);
  };

  const handleDeleteAssessment = (idToDelete: string) => {
    // Remove from summary list
    const updatedSummaries = recentAssessments.filter(a => a.id !== idToDelete);
    setRecentAssessments(updatedSummaries);
    localStorage.setItem('adr-assessments', JSON.stringify(updatedSummaries));

    // Remove from full details list
    const fullAssessments = JSON.parse(localStorage.getItem('adr-assessments-full') || '[]');
    const updatedFull = fullAssessments.filter((a: SavedAssessment) => a.id !== idToDelete);
    localStorage.setItem('adr-assessments-full', JSON.stringify(updatedFull));

    toast.success("Assessment has been deleted.");
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

  const getRiskLevelInfo = (percentage: number) => {
    if (percentage >= 70) return { text: 'High Risk', badgeClass: 'bg-danger-100 text-danger-700', borderClass: 'border-danger-500 bg-danger-50' };
    if (percentage >= 40) return { text: 'Medium Risk', badgeClass: 'bg-warning-100 text-warning-700', borderClass: 'border-warning-500 bg-warning-50' };
    return { text: 'Low Risk', badgeClass: 'bg-success-100 text-success-700', borderClass: 'border-success-500 bg-success-50' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <div className="flex gap-2 mt-2 sm:mt-0">

          <Button asChild className="bg-healthcare-600 hover:bg-healthcare-700">
            <Link to="/medication-check">New Medication Check</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: AI Risk Assessment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="relative overflow-hidden h-full flex flex-col">
            <img
              src="/bg-risk-asses.png"
              alt="AI Risk Assessment"
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-200"
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-10"></div>
            <div className="relative z-20 flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">AI Risk Assessment</CardTitle>
                <CardDescription className='text-white'>Check medications for adverse reactions</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center flex-col py-6">
                  <AlertTriangle className="h-12 w-12 text-healthcare-600 mb-4" />
                  <p className="text-center text-black mb-4">
                    Analyze your medications for potential risks and get personalized recommendations
                  </p>
                  <Button asChild variant="outline" className="w-full bg-white/50 hover:bg-white/70">
                    <Link to="/medication-check">Start Assessment</Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Card 2: Health Assistant */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card className="relative overflow-hidden h-full flex flex-col">
            <img
              src="/bg-ai-asis.png"
              alt="Health Assistant"
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-200"
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-10"></div>
            <div className="relative z-20 flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Health Assistant</CardTitle>
                <CardDescription className='text-black'>Get answers to your health questions</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center flex-col py-6">
                  <MessageSquare className="h-12 w-12 text-healthcare-600 mb-4" />
                  <p className="text-center text-black-600 mb-4">
                    Chat with our AI assistant about symptoms, medications, or general health inquiries
                  </p>
                  <Button asChild variant="outline" className="w-full bg-white/50 hover:bg-white/70">
                    <Link to="/ai-assistant">Ask Assistant</Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>

        {/* Card 3: Health Records */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card className="relative overflow-hidden h-full flex flex-col">
            <img
              src="/bg-health-record.png"
              alt="Health Records"
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-200"
            />
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-10"></div>
            <div className="relative z-20 flex flex-col h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Health Records</CardTitle>
                <CardDescription className='text-white'>Upload and manage your health data</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-center flex-col py-6">
                  <FilePlus className="h-12 w-12 text-healthcare-600 mb-4" />
                  <p className="text-center text-black-600 mb-4">
                    Upload medical reports for analysis or update your health profile
                  </p>
                  <Button asChild variant="outline" className="w-full bg-white/50 hover:bg-white/70">
                    <Link to="/health-profile">Manage Records</Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Assessments</CardTitle>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {recentAssessments.length > 0 ? (
                <div className="space-y-4">
                  {recentAssessments.map((assessment) => {
                    const riskInfo = getRiskLevelInfo(assessment.riskPercentage);
                    return (
                      <div key={assessment.id} className={`p-3 rounded-lg border-l-4 ${riskInfo.borderClass}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{new Date(assessment.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600 mt-1">{assessment.medications.map(m => m.name).join(', ')}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${riskInfo.badgeClass}`}>{riskInfo.text}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <Button asChild variant="ghost" size="sm" className="text-xs">
                            <Link to={`/assessment/${assessment.id}`}>View Details</Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteAssessment(assessment.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No assessments yet</p>
                  <p className="text-gray-400 text-sm">Run and save your first medication check to see results here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                <MessageSquare className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              {loadingAppointments ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-healthcare-600" />
                </div>
              ) : appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{appointment.doctor.name}</p>
                          <div className="flex items-center text-gray-600 text-sm mt-1">
                            <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                            <span className="mx-2">•</span>
                            <span>{appointment.appointmentTime}</span>
                          </div>
                          {appointment.reason && (
                            <p className="text-gray-600 text-sm mt-2">Reason: {appointment.reason}</p>
                          )}
                        </div>
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${appointment.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700'
                          : appointment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-700'
                            : appointment.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                          {appointment.status}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2 flex-wrap">
                        {/* Message Button - Only enabled if appointment is CONFIRMED */}
                        <Button
                          onClick={() => handleMessageClick(appointment)}
                          disabled={appointment.status !== 'CONFIRMED'}
                          className={`text-xs relative ${appointment.status === 'CONFIRMED'
                            ? 'bg-healthcare-600 hover:bg-healthcare-700 text-white'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message Doctor
                          {/* Unread Badge */}
                          {unreadCounts[appointment.doctorId] > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                              {unreadCounts[appointment.doctorId]}
                            </span>
                          )}
                        </Button>

                        {appointment.status !== 'COMPLETED' && appointment.status !== 'CANCELLED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setRescheduleModalOpen(true);
                            }}
                          >
                            Reschedule
                          </Button>
                        )}

                        {appointment.status === 'COMPLETED' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>

                      {/* Help text for disabled message button */}
                      {appointment.status !== 'CONFIRMED' && (
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Messaging will be available once the doctor confirms your appointment
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Activity className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <p className="text-gray-400 text-sm mb-4">Schedule a consultation with a doctor</p>
                  <Button asChild variant="outline">
                    <Link to="/find-doctor">Find a Doctor</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Patient Messaging Modal */}
      {selectedDoctor && (
        <PatientMessagingModal
          open={messagingModalOpen}
          onOpenChange={setMessagingModalOpen}
          doctorId={selectedDoctor.id}
          doctorName={selectedDoctor.name}
          appointmentStatus={selectedDoctor.status}
        />
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedAppointment && (
        <RescheduleModal
          open={rescheduleModalOpen}
          onOpenChange={setRescheduleModalOpen}
          appointmentId={selectedAppointment.id}
          currentDate={selectedAppointment.appointmentDate}
          currentTime={selectedAppointment.appointmentTime}
          onSuccess={fetchAppointments}
        />
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <IncomingCallModal
          open={!!incomingCall}
          callerName={incomingCall.doctorName}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Video Call Modal */}
      {callDoctor && (
        <VideoCallModal
          open={videoCallOpen}
          localStream={webRTC.localStream}
          remoteStream={webRTC.remoteStream}
          isAudioMuted={webRTC.isAudioMuted}
          isVideoOff={webRTC.isVideoOff}
          connectionState={webRTC.connectionState}
          remoteName={callDoctor.name}
          onToggleAudio={webRTC.toggleAudio}
          onToggleVideo={webRTC.toggleVideo}
          onEndCall={handleEndCall}
        />
      )}
    </div>
  );
};

export default PatientDashboard;