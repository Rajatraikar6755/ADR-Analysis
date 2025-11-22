import React from 'react';
import PatientList from '@/components/doctor/PatientList';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const PatientListPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="doctor">
      <MainLayout>
        <PatientList />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default PatientListPage;