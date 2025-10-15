import React from 'react';
import { motion } from 'framer-motion';

interface DynamicBackgroundProps {
  children: React.ReactNode;
  variant?: 'login' | 'subtle'; // login for full vibrant, subtle for lighter
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children, variant = 'login' }) => {
  if (variant === 'subtle') {
    return (
      <div className="relative min-h-screen bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-healthcare-50 to-white opacity-50"></div>
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* Subtle moving shapes for general pages */}
          <div className="absolute w-64 h-64 rounded-full bg-healthcare-200 opacity-20 blur-3xl -top-16 -left-16 animate-sparkle-float-slow"></div>
          <div className="absolute w-80 h-80 rounded-full bg-healthcare-100 opacity-15 blur-3xl -bottom-20 -right-20 animate-sparkle-float-medium"></div>
          <div className="absolute w-48 h-48 rounded-full bg-accent-100 opacity-10 blur-3xl top-1/3 left-1/4 animate-sparkle-float-fast"></div>
        </motion.div>
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  // Default 'login' variant
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gradientBlueStart to-gradientBlueEnd">
      {/* Background elements */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 810"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Layer 1: Distant mountains/hills */}
        <motion.path
          d="M0 600 Q200 500 400 650 T800 550 T1200 680 T1440 500 V810 H0 Z"
          fill="#87ceeb"
          className="opacity-70"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Layer 2: Closer mountains/hills */}
        <motion.path
          d="M0 650 Q150 580 300 700 T600 600 T900 750 T1200 650 T1440 780 V810 H0 Z"
          fill="#6495ed"
          className="opacity-80"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Layer 3: Foreground elements (trees/shapes) */}
        <motion.path
          d="M0 700 Q100 620 200 750 T400 680 T600 800 T800 700 T1000 810 T1200 720 T1440 810 V810 H0 Z"
          fill="#4169e1"
          className="opacity-90"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* Particle/Star elements */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white opacity-80"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 20 - 10, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.5, 1, 0.5],
            scale: [1, Math.random() * 0.2 + 0.9, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 10, // 10-20 seconds
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Main content layer */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default DynamicBackground;