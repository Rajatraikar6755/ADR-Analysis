
import React from 'react';
import PatientDashboard from '@/components/patient/PatientDashboard';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const PatientDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="patient">
      <MainLayout>
        <PatientDashboard />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default PatientDashboardPage;
