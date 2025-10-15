import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import DynamicBackground from '@/components/ui/DynamicBackground';

const RegisterPage: React.FC = () => {
  return (
    <DynamicBackground variant="login">
      <RegisterForm />
    </DynamicBackground>
  );
};

export default RegisterPage;