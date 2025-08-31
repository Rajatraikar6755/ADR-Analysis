
import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import MainLayout from '@/components/layouts/MainLayout';

const RegisterPage: React.FC = () => {
  return (
    <MainLayout>
      <RegisterForm />
    </MainLayout>
  );
};

export default RegisterPage;
