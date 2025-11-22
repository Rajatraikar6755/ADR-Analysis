import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const VerifyOTPForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const { verifyOTP, resendOTP, isLoading, error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return;
    }
    try {
      await verifyOTP(email, otp);
    } catch (err) {
      // Error handled in context
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP(email);
      setCountdown(60); // 60 seconds cooldown
    } catch (err) {
      // Error handled in context
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex justify-center items-center min-h-screen"
    >
      <Card className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 text-black">
        <CardHeader className="space-y-1 text-center">
          <Heart className="h-12 w-12 text-vibrantBlue mx-auto drop-shadow-lg" />
          <CardTitle className="text-3xl font-bold drop-shadow-md">Verify Your Email</CardTitle>
          <CardDescription className="text-vibrantBlue/80">
            We've sent a 6-digit OTP to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp" className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Enter OTP
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="bg-white/50 border-none placeholder:text-gray-600 focus:ring-2 focus:ring-vibrantBlue text-center text-2xl tracking-widest font-bold"
              />
              <p className="text-xs text-gray-600 text-center">
                Check your email inbox and spam folder
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-300 bg-red-900/50 p-2 rounded">{error}</div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-vibrantBlue-light to-vibrantBlue text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow" 
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-black/80 mb-2">Didn't receive the code?</p>
            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={countdown > 0 || isLoading}
              className="bg-white/20 border-white/50 hover:bg-white/30"
            >
              {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerifyOTPForm;