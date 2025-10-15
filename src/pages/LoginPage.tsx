import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import DynamicBackground from '@/components/ui/DynamicBackground';

const LoginPage: React.FC = () => {
  return (
    <DynamicBackground variant="login">
      <LoginForm />
    </DynamicBackground>
  );
};

export default LoginPage;