
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, AlertCircle, FileText, MessageSquare, CheckCircle } from 'lucide-react';
import { MotionDiv, MotionH1, MotionP } from '@/components/ui/animated';
import { motion } from 'framer-motion';
import Reveal from '@/components/ui/Reveal';

const HeroSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-100"
      >
        <source src="/background-video.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10 bg-gradient-to-br from-teal-50/30 via-blue-50/30 to-white/30 backdrop-blur-md">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <MotionDiv
            className="flex flex-col md:flex-row items-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="md:w-1/2 md:pr-12">
              <Reveal>
                <MotionDiv variants={itemVariants} className="flex items-center mb-4">
                  <Heart className="text-healthcare-600 h-8 w-8 mr-2 animate-zoom-in" />
                  <MotionH1 className="text-3xl md:text-4xl font-bold text-healthcare-900 animate-slide-in-up">
                    ADR Analysis
                  </MotionH1>
                </MotionDiv>
              </Reveal>
              <Reveal delay={0.05}>
                <motion.h2 variants={itemVariants} className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  AI-Based Adverse Drug Reaction Prediction with Live Doctor Support
                </motion.h2>
              </Reveal>
              <Reveal delay={0.1}>
                <MotionP variants={itemVariants} className="text-lg text-gray-600 mb-6">
                  Predict potential adverse drug reactions, get personalized health recommendations, 
                  and connect with medical professionals - all in one platform.
                </MotionP>
              </Reveal>
              <Reveal delay={0.15}>
                <MotionDiv variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button asChild size="lg" className="bg-gradient-accent text-white hover:opacity-90 animate-zoom-in">
                    <Link to="/register">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="animate-slide-in-right">
                    <Link to="/login">Login</Link>
                  </Button>
                </MotionDiv>
              </Reveal>

              <MotionDiv variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Predict adverse drug reactions",
                  "Free AI health assistant",
                  "Personalized health plans",
                  "Connect with medical professionals"
                ].map((text, index) => (
                  <Reveal key={index} delay={0.2 + index * 0.06}>
                    <motion.div
                      className="flex items-start hover:translate-x-1 transition-transform animate-fade-in-up"
                      whileHover={{ scale: 1.05, color: '#0084df' }}
                    >
                      <CheckCircle className="h-5 w-5 text-healthcare-600 mt-1 mr-2" />
                      <p className="text-gray-700">{text}</p>
                    </motion.div>
                  </Reveal>
                ))}
              </MotionDiv>
            </div>
            
            <MotionDiv variants={itemVariants} className="md:w-1/2 mt-8 md:mt-0">
              <Reveal direction='right'>
                <div className="relative rounded-xl overflow-hidden shadow-2xl animate-zoom-in">
                  <div >
                    {/* ... Card content remains the same */}
                  </div>
                </div>
              </Reveal>
            </MotionDiv>
          </MotionDiv>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
