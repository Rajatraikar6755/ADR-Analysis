import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, Loader2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { motion } from 'framer-motion';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [passwordError, setPasswordError] = useState('');
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (role === 'doctor' && !licenseDocument) {
      setPasswordError('Verification document is required for doctors');
      return;
    }

    try {
      const result = await register(name, email, password, role, licenseNumber, licenseDocument || undefined);

      // Redirect to OTP verification
      if (result.needsVerification) {
        navigate(`/verify-otp?email=${result.email}`);
      }
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
            Enter your details to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-white/50 border-none placeholder:text-gray-600 focus:ring-2 focus:ring-vibrantBlue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/50 border-none placeholder:text-gray-600 focus:ring-2 focus:ring-vibrantBlue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/50 border-none placeholder:text-gray-600 focus:ring-2 focus:ring-vibrantBlue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-white/50 border-none placeholder:text-gray-600 focus:ring-2 focus:ring-vibrantBlue"
              />
            </div>

            {passwordError && (
              <div className="text-sm text-red-300 bg-red-900/50 p-2 rounded">{passwordError}</div>
            )}

            <div className="space-y-2">
              <Label>I am a</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'patient' | 'doctor')} className="flex gap-4 pt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="patient" className="border-white text-vibrantBlue-light focus:ring-vibrantBlue" />
                  <Label htmlFor="patient" className="cursor-pointer">Patient</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="doctor" id="doctor" className="border-white text-vibrantBlue-light focus:ring-vibrantBlue" />
                  <Label htmlFor="doctor" className="cursor-pointer">Healthcare Professional</Label>
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

            {error && (
              <div className="text-sm text-red-300 bg-red-900/50 p-2 rounded">{error}</div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-vibrantBlue-light to-vibrantBlue text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-white/80 w-full">
            Already have an account?{" "}
            <Link to="/login" className="text-vibrantBlue-light font-bold hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default RegisterForm;