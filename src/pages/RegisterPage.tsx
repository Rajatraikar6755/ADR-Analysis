import React from 'react';
import RegisterForm from '@/components/auth/RegisterForm';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';

const RegisterPage: React.FC = () => {
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-black/80" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2">
          <div className="bg-vibrantBlue p-2 rounded-xl">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Dr. AI Patient Care</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 max-w-lg"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl pb-10">
             <ShieldCheck className="w-12 h-12 text-vibrantBlue-light mb-6" />
             <h2 className="text-3xl font-bold tracking-tight mb-4 text-white">
                Secure & Compliant Architecture
             </h2>
             <p className="text-base text-gray-300 font-medium leading-relaxed">
               By joining Dr. AI, you're entering a highly secure ecosystem explicitly tailored to protect sensitive medical data. We employ enterprise-grade encryption to ensure peace of mind for both patients and healthcare providers.
             </p>
          </div>
        </motion.div>
        
        <div className="relative z-10 text-sm text-gray-400 font-medium">
          HIPAA & GDPR Compliant Security Infrastructure
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex-1 flex flex-col justify-center items-center py-10 px-6 sm:px-12 bg-white relative overflow-y-auto">
        <div className="w-full max-w-[500px] mx-auto py-8">
           {/* Mobile Header Logo */}
           <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
             <div className="bg-vibrantBlue p-2 rounded-xl">
               <Activity className="h-6 w-6 text-white" />
             </div>
             <span className="text-2xl font-bold text-gray-900">Dr. AI</span>
          </div>

          <RegisterForm />
        </div>
      </div>
      
    </div>
  );
};

export default RegisterPage;