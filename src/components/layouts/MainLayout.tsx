
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  User, 
  Calendar, 
  LogOut, 
  MessageSquare,
  Heart,
  FileText,
  Home
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const isPatient = user?.role === 'patient';
  const isDoctor = user?.role === 'doctor';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-healthcare-700 flex items-center gap-2">
            <Heart className="h-6 w-6 text-healthcare-600" />
            <span>ADR-Analysis</span>
          </Link>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {isDoctor ? 'Dr. ' : ''}{user.name}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content with sidebar for authenticated users */}
      {user ? (
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 bg-slate-50 border-r shadow-sm hidden md:block">
            <nav className="p-4 space-y-1">
              {isPatient && (
                <>
                  <Link 
                    to="/patient-dashboard" 
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/health-profile" 
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <User className="h-5 w-5" />
                    <span>Health Profile</span>
                  </Link>
                  <Link 
                    to="/medication-check" 
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Medication Check</span>
                  </Link>
                  <Link 
                    to="/ai-assistant" 
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>AI Assistant</span>
                  </Link>
                </>
              )}

              {isDoctor && (
                <>
                  <Link 
                    to="/doctor-dashboard" 
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/patients" 
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <User className="h-5 w-5" />
                    <span>Patient Management</span>
                  </Link>
                </>
              )}

              <Link 
  to="/find-doctor" 
  className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700">
  <Calendar className="h-5 w-5" />
  <span>Book Appointment</span>
</Link>
            </nav>
          </aside>

          {/* Mobile menu for small screens */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 z-10">
            <div className="flex justify-around">
              <Link to={isPatient ? "/patient-dashboard" : "/doctor-dashboard"} className="flex flex-col items-center p-2">
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Home</span>
              </Link>
              
              {isPatient ? (
                <>
                  <Link to="/medication-check" className="flex flex-col items-center p-2">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs mt-1">Meds</span>
                  </Link>
                  <Link to="/ai-assistant" className="flex flex-col items-center p-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="text-xs mt-1">Chat</span>
                  </Link>
                </>
              ) : (
                <Link to="/patients" className="flex flex-col items-center p-2">
                  <User className="h-5 w-5" />
                  <span className="text-xs mt-1">Patients</span>
                </Link>
              )}
              
                <Link to="/find-doctor" className="flex flex-col items-center p-2">
                  <Calendar className="h-5 w-5" />
                <span className="text-xs mt-1">Doctors</span>
                </Link>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-y-auto pb-16 md:pb-6">
            {children}
          </main>
        </div>
      ) : (
        <main className="flex-1">
          {children}
        </main>
      )}

      {/* Footer */}
      <footer className="py-4 px-6 border-t mt-auto">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ADR-Analysis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
