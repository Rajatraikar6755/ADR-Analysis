import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterForm: React.FC = () => {
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [formError, setFormError] = useState('');
  
  const { loginWithGoogle, registerWithEmail, isLoading, error } = useAuth();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name || !email || !password) {
      setFormError('Please fill in all general fields.');
      return;
    }

    if (role === 'doctor') {
      if (!licenseNumber) {
        setFormError('License number is required for healthcare professionals.');
        return;
      }
      if (!licenseDocument) {
        setFormError('Verification document is required for healthcare professionals.');
        return;
      }
    }

    try {
      await registerWithEmail(name, email, password, role, licenseNumber, licenseDocument || undefined);
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h2>
        <p className="text-gray-500 mt-2 text-base">Enter your details to get started.</p>
      </div>

      <div className="space-y-6">
        
        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-xl mb-6 shadow-inner">
           <button 
             type="button"
             onClick={() => setRole('patient')}
             className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${role === 'patient' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Patient
           </button>
           <button 
             type="button"
             onClick={() => setRole('doctor')}
             className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all ${role === 'doctor' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
           >
             Healthcare Professional
           </button>
        </div>

        {(formError || error) && (
          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm font-medium">
            {formError || error}
          </div>
        )}

        <AnimatePresence mode="popLayout">
            {role === 'doctor' && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.98 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50"
              >
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber" className="text-vibrantBlue-dark font-semibold">Medical License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="e.g. MC-123456"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    className="py-5 bg-white border-blue-200 focus-visible:ring-2 focus-visible:ring-vibrantBlue/50 text-gray-900 shadow-sm rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseDocument" className="text-vibrantBlue-dark font-semibold">Verification Document</Label>
                  <Input
                    id="licenseDocument"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setLicenseDocument(e.target.files?.[0] || null)}
                    required
                    className="bg-white border-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-vibrantBlue/10 file:text-vibrantBlue-dark hover:file:bg-vibrantBlue/20 cursor-pointer shadow-sm rounded-xl py-2.5 h-auto text-sm"
                  />
                  <p className="text-xs text-blue-600/80 mt-1 font-medium px-1">Upload ID card or medical certificate (PDF/Image).</p>
                </div>
              </motion.div>
            )}
        </AnimatePresence>

        <form onSubmit={handleEmailSignUp} className="space-y-5">
           
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700 font-semibold mb-1 block">Full Name</Label>
            <div className="relative group">
              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-vibrantBlue transition-colors" />
              <Input 
                id="name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="pl-11 py-6 bg-white border-gray-200 text-gray-900 focus-visible:ring-2 focus-visible:ring-vibrantBlue/50 focus-visible:border-vibrantBlue rounded-xl shadow-sm text-base placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold mb-1 block">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-vibrantBlue transition-colors" />
              <Input 
                id="email" 
                type="email" 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 py-6 bg-white border-gray-200 text-gray-900 focus-visible:ring-2 focus-visible:ring-vibrantBlue/50 focus-visible:border-vibrantBlue rounded-xl shadow-sm text-base placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-semibold mb-1 block">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-vibrantBlue transition-colors" />
              <Input 
                id="password" 
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-11 py-6 bg-white border-gray-200 text-gray-900 focus-visible:ring-2 focus-visible:ring-vibrantBlue/50 focus-visible:border-vibrantBlue rounded-xl shadow-sm text-base placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
             <Button 
               type="submit" 
               className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-6 rounded-xl shadow-md transition-all text-base mt-2" 
               disabled={isLoading}
             >
               {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating account...</> : 'Sign up via Email'}
             </Button>
          </motion.div>
        </form>

        <div className="relative my-6 pb-1">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="bg-white px-4 text-gray-400">Or sign up with</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button 
            onClick={() => {
                if (role === 'doctor' && (!licenseNumber || !licenseDocument)) {
                    setFormError('License number and Verification document are required for healthcare professionals.');
                    return;
                }
                loginWithGoogle(role, licenseNumber, licenseDocument || undefined);
            }} 
            type="button"
            className="w-full bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 font-semibold py-6 rounded-xl shadow-sm border border-gray-200 transition-all flex items-center justify-center gap-3 text-base" 
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Google
          </Button>
        </motion.div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="text-vibrantBlue font-semibold hover:text-vibrantBlue-dark hover:underline transition-all">
          Sign In
        </Link>
      </div>
    </motion.div>
  );
};

export default RegisterForm;