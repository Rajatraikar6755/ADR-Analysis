
import React from 'react';
import MedicationCheck from '@/components/patient/MedicationCheck';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const MedicationCheckPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="patient">
      <MainLayout>
        <MedicationCheck />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default MedicationCheckPage;
