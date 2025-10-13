import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageSquare, Pill, FilePlus, FileText, Activity, Trash2 } from 'lucide-react'; // Trash2 is now imported
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface SavedAssessment {
  id: string;
  date: string;
  medications: { name: string }[];
  riskPercentage: number;
}

// Mock data for appointments (as this is not dynamic yet)
const upcomingAppointments = [
  {
    id: 1,
    doctor: 'Dr. Jane Smith',
    date: '2023-05-10',
    time: '2:30 PM'
  }
];

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentAssessments, setRecentAssessments] = useState<SavedAssessment[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('adr-assessments');
    if (saved) {
      setRecentAssessments(JSON.parse(saved));
    }
  }, []);

  const handleDeleteAssessment = (idToDelete: string) => {
    // Remove from summary list
    const updatedSummaries = recentAssessments.filter(a => a.id !== idToDelete);
    setRecentAssessments(updatedSummaries);
    localStorage.setItem('adr-assessments', JSON.stringify(updatedSummaries));

    // Remove from full details list
    const fullAssessments = JSON.parse(localStorage.getItem('adr-assessments-full') || '[]');
    const updatedFull = fullAssessments.filter((a: any) => a.id !== idToDelete);
    localStorage.setItem('adr-assessments-full', JSON.stringify(updatedFull));

    toast.success("Assessment has been deleted.");
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
        <Button asChild className="mt-2 sm:mt-0 bg-healthcare-600 hover:bg-healthcare-700">
          <Link to="/medication-check">New Medication Check</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">AI Risk Assessment</CardTitle>
            <CardDescription>Check medications for adverse reactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center flex-col py-6">
              <AlertTriangle className="h-12 w-12 text-healthcare-600 mb-4" />
              <p className="text-center text-gray-600 mb-4">
                Analyze your medications for potential risks and get personalized recommendations
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/medication-check">Start Assessment</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Health Assistant</CardTitle>
            <CardDescription>Get answers to your health questions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center flex-col py-6">
              <MessageSquare className="h-12 w-12 text-healthcare-600 mb-4" />
              <p className="text-center text-gray-600 mb-4">
                Chat with our AI assistant about symptoms, medications, or general health inquiries
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/ai-assistant">Ask Assistant</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Health Records</CardTitle>
            <CardDescription>Upload and manage your health data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center flex-col py-6">
              <FilePlus className="h-12 w-12 text-healthcare-600 mb-4" />
              <p className="text-center text-gray-600 mb-4">
                Upload medical reports for analysis or update your health profile
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/health-profile">Manage Records</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              <Pill className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 rounded-lg border border-gray-200">
                    <p className="font-medium">{appointment.doctor}</p>
                    <div className="flex items-center text-gray-600 text-sm mt-1">
                      <span>{new Date(appointment.date).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{appointment.time}</span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Button variant="outline" size="sm" className="text-xs">Reschedule</Button>
                      <Button variant="outline" size="sm" className="text-xs">Cancel</Button>
                    </div>
                  </div>
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
    </div>
  );
};

export default PatientDashboard;