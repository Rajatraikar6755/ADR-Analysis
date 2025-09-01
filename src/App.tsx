import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import MedicationCheckPage from "./pages/MedicationCheckPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import PremiumPlansPage from "./pages/PremiumPlansPage";
import AssessmentDetailPage from "./pages/AssessmentDetailPage"; 
import HealthProfilePage from "./pages/HealthProfilePage";
import FindDoctorPage from "./pages/FindDoctorPage";
import AppointmentsPage from "./pages/AppointmentsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
            <Route path="/medication-check" element={<MedicationCheckPage />} />
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
            <Route path="/premium-plans" element={<PremiumPlansPage />} />
            <Route path="/assessment/:id" element={<AssessmentDetailPage />} /> 
            <Route path="/health-profile" element={<HealthProfilePage />} />
            <Route path="/find-doctor" element={<FindDoctorPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;