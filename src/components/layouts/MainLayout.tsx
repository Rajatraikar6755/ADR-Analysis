
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
import { motion } from 'framer-motion';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';

  return (
    <div className="min-h-screen flex flex-col">
      {user && (
        <motion.div
          className="absolute inset-0 z-0 overflow-hidden" // Ensure it's behind everything (z-0)
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <div className="absolute w-72 h-72 rounded-full bg-healthcare-200/50 opacity-30 blur-2xl -top-20 -left-20 animate-sparkle-float-slow"></div>
          <div className="absolute w-96 h-96 rounded-full bg-healthcare-100/50 opacity-25 blur-2xl -bottom-24 -right-24 animate-sparkle-float-medium"></div>
          <div className="absolute w-56 h-56 rounded-full bg-accent-200/50 opacity-20 blur-2xl top-1/3 left-1/4 animate-sparkle-float-fast"></div>
        </motion.div>
      )}
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-lg shadow-sm py-4 px-6 border-b border-white/30 sticky top-0 z-20">
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
        <div className="flex flex-1 z-10 bg-gray-50/50 relative overflow-hidden">

          {/* Sidebar */}
          <aside className="w-64 bg-white/40 backdrop-blur-lg border-r border-white/30 shadow-sm hidden md:block">
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
                  <Link
                    to="/medical-assessments"
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <FileText className="h-5 w-5" />
                    <span>Medical Assessments</span>
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
                    to="/doctor/profile"
                    className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </>
              )}

              {!isDoctor && (
                <Link
                  to="/find-doctor"
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-healthcare-50 text-gray-700 hover:text-healthcare-700">
                  <Calendar className="h-5 w-5" />
                  <span>Book Appointment</span>
                </Link>
              )}
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
      <footer className="py-4 px-6 border-t border-white/30 mt-auto z-10 bg-white/40 backdrop-blur-lg">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ADR-Analysis. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
