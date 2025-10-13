
import React, { useState } from 'react';
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
  Filter 
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

const appointmentsData = [
  {
    id: '1',
    patient: 'John Doe',
    date: '2023-05-05',
    time: '10:30 AM',
    status: 'confirmed'
  },
  {
    id: '2',
    patient: 'Mary Williams',
    date: '2023-05-05',
    time: '2:15 PM',
    status: 'confirmed'
  },
  {
    id: '3',
    patient: 'James Brown',
    date: '2023-05-06',
    time: '11:00 AM',
    status: 'pending'
  }
];

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string | null>(null);
  
  // Filter patients based on search query and risk filter
  const filteredPatients = patientsData.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter ? patient.riskLevel === riskFilter : true;
    return matchesSearch && matchesRisk;
  });

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
                <p className="text-xl font-bold">2</p>
                <p className="text-sm text-danger-700">High Risk Patients</p>
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
                <p className="text-xl font-bold">5</p>
                <p className="text-sm text-gray-500">Total Patients</p>
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
                <p className="text-xl font-bold">3</p>
                <p className="text-sm text-gray-500">Upcoming Appointments</p>
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
                <CardTitle className="text-lg">Patient Management</CardTitle>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <Filter className="h-4 w-4" />
                        <span>{riskFilter ? `${riskFilter} Risk` : 'All Risks'}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setRiskFilter(null)}>
                        All Risks
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRiskFilter('high')}>
                        High Risk
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRiskFilter('medium')}>
                        Medium Risk
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setRiskFilter('low')}>
                        Low Risk
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Age</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Risk Level</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Conditions</th>
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
                                <p className="text-xs text-gray-500">Last check: {new Date(patient.lastAssessment).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">{patient.age}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              patient.riskLevel === 'high' ? 'bg-danger-100 text-danger-700' :
                              patient.riskLevel === 'medium' ? 'bg-warning-100 text-warning-700' :
                              'bg-success-100 text-success-700'
                            }`}>
                              {patient.riskLevel.charAt(0).toUpperCase() + patient.riskLevel.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {patient.conditions.map((condition, index) => (
                                <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                  {condition}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" className="bg-healthcare-600 hover:bg-healthcare-700">Contact</Button>
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
              <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
              <CardDescription>Manage your scheduled appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointmentsData.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div>
                      <p className="font-medium">{appointment.patient}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        appointment.status === 'confirmed' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                      <Button size="sm" variant="outline">Reschedule</Button>
                      <Button size="sm" className="bg-healthcare-600 hover:bg-healthcare-700">Start Call</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;
