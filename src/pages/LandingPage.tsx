
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import MainLayout from '@/components/layouts/MainLayout';

const LandingPage: React.FC = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturesSection />
    </MainLayout>
  );
};

export default LandingPage;
