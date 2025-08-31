import React from 'react';
import FindDoctor from '@/components/patient/FindDoctor';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const FindDoctorPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="patient">
      <MainLayout>
        <FindDoctor />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default FindDoctorPage;