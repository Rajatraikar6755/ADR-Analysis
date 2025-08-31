
import React from 'react';
import AiAssistant from '@/components/chat/AiAssistant';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const AiAssistantPage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="patient">
      <MainLayout>
        <AiAssistant />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default AiAssistantPage;
