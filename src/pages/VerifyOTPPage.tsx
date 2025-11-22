import React from 'react';
import VerifyOTPForm from '@/components/auth/VerifyOTPForm';
import DynamicBackground from '@/components/ui/DynamicBackground';

const VerifyOTPPage: React.FC = () => {
  return (
    <DynamicBackground variant="login">
      <VerifyOTPForm />
    </DynamicBackground>
  );
};

export default VerifyOTPPage;