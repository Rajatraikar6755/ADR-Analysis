
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import MainLayout from '@/components/layouts/MainLayout';
import Reveal from '@/components/ui/Reveal';

const LandingPage: React.FC = () => {
  return (
    <MainLayout>
      <Reveal>
        <HeroSection />
      </Reveal>
      <Reveal delay={0.08}>
        <FeaturesSection />
      </Reveal>
    </MainLayout>
  );
};

export default LandingPage;
