import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, Mail, Lock, User } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';

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
        setFormError('License number is required for doctors');
        return;
      }
      if (!licenseDocument) {
        setFormError('Verification document is required for doctors');
        return;
      }
    }

    try {
      await registerWithEmail(name, email, password, role, licenseNumber, licenseDocument || undefined);
    } catch (err) {
      // Error handled in context
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError('');

    if (role === 'doctor') {
      if (!licenseNumber) {
        setFormError('License number is required for doctors');
        return;
      }
      if (!licenseDocument) {
        setFormError('Verification document is required for doctors');
        return;
      }
    }

    try {
      await loginWithGoogle(role, licenseNumber, licenseDocument || undefined);
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="w-full max-w-[700px] bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 text-black">
        <CardHeader className="space-y-1 text-center">
          <Heart className="h-12 w-12 text-vibrantBlue mx-auto drop-shadow-lg" />
          <CardTitle className="text-3xl text-vibrantBlue font-bold drop-shadow-md">Create an Account</CardTitle>
          <CardDescription className="text-black/80">
            Join the platform securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-lg font-semibold">I am a</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'patient' | 'doctor')} className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="flex items-center space-x-3 bg-white/40 p-4 rounded-xl flex-1 border border-white/50 cursor-pointer hover:bg-white/60 transition-colors" onClick={() => setRole('patient')}>
                  <RadioGroupItem value="patient" id="patient" className="border-vibrantBlue text-vibrantBlue focus:ring-vibrantBlue scale-125" />
                  <Label htmlFor="patient" className="cursor-pointer text-base font-medium">Patient</Label>
                </div>
                <div className="flex items-center space-x-3 bg-white/40 p-4 rounded-xl flex-1 border border-white/50 cursor-pointer hover:bg-white/60 transition-colors" onClick={() => setRole('doctor')}>
                  <RadioGroupItem value="doctor" id="doctor" className="border-vibrantBlue text-vibrantBlue focus:ring-vibrantBlue scale-125" />
                  <Label htmlFor="doctor" className="cursor-pointer text-base font-medium">Healthcare Professional</Label>
                </div>
              </RadioGroup>
            </div>

            {role === 'doctor' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Medical License Number</Label>
                  <Input
                    id="licenseNumber"
                    placeholder="MC-123456"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    required
                    className="bg-white/50 border-none placeholder:text-gray-600 focus:ring-2 focus:ring-vibrantBlue"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseDocument">Verification Document (PDF or Image)</Label>
                  <Input
                    id="licenseDocument"
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => setLicenseDocument(e.target.files?.[0] || null)}
                    required
                    className="bg-white/50 border-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-vibrantBlue file:text-white hover:file:bg-vibrantBlue-light cursor-pointer"
                  />
                  <p className="text-xs text-black/60">Upload your ID card or medical certificate for verification.</p>
                </div>
              </motion.div>
            )}

            {(formError || error) && (
              <div className="text-sm text-red-100 bg-red-600/80 p-3 rounded-lg font-medium shadow-sm">
                {formError || error}
              </div>
            )}

            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input 
                      id="name" 
                      placeholder="John Doe" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-white/50 border-white/40 focus:ring-vibrantBlue"
                    />
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/50 border-white/40 focus:ring-vibrantBlue"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/50 border-white/40 focus:ring-vibrantBlue"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-vibrantBlue hover:bg-vibrantBlue-light font-bold py-6 rounded-lg shadow-md hover:shadow-lg transition-all" 
                disabled={isLoading}
              >
                {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Creating account...</> : 'Sign Up via Email'}
              </Button>
            </form>

            <div className="relative my-4 pt-2 pb-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#e6f2fb] px-2 text-gray-500 rounded backdrop-blur">OR</span>
              </div>
            </div>

            <Button 
              onClick={handleGoogleSignUp} 
              type="button"
              className="w-full bg-white text-gray-800 hover:bg-gray-100 font-bold py-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center border border-gray-200 mt-4 gap-3 text-lg" 
              disabled={isLoading}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign up with Google
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-black/80 w-full">
            Already have an account?{" "}
            <Link to="/login" className="text-vibrantBlue font-bold hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;