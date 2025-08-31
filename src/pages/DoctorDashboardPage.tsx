
import React from 'react';
import DoctorDashboard from '@/components/doctor/DoctorDashboard';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const DoctorDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="doctor">
      <MainLayout>
        <DoctorDashboard />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default DoctorDashboardPage;
