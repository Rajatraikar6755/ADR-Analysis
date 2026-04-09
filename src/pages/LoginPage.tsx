import React from 'react';
import LoginForm from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans overflow-hidden">
      
      {/* Left Panel - Image Area (hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-black text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/auth-bg.png" 
            alt="Medical AI Abstract" 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-vibrantBlue p-2 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">ADR Analysis</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
             Empowering Healthcare with <span className="text-vibrantBlue-light">Artificial Intelligence</span>
          </h1>
          <p className="text-lg text-gray-300 font-medium leading-relaxed">
            Unify data, accelerate diagnoses, and build stronger doctor-patient relationships inside an environment built for modern medicine.
          </p>
        </motion.div>
        
        <div className="relative z-10 text-sm text-gray-400 font-medium">
          © 2024 ADR Analysis Research Group. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-10">
             <div className="bg-vibrantBlue p-2 rounded-xl">
               <Activity className="h-6 w-6 text-white" />
             </div>
             <span className="text-2xl font-bold text-gray-900">ADR Analysis</span>
          </div>

          <LoginForm />
        </div>
      </div>
      
    </div>
  );
};

export default LoginPage;