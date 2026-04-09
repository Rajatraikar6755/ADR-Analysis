import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { loginWithGoogle, loginWithEmail, isLoading, error } = useAuth();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    try {
      await loginWithEmail(email, password);
    } catch (err) {
      // Handled in context
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
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-gray-500 mt-2 text-base">Please enter your details to sign in.</p>
      </div>

      <div className="space-y-6">
        {(error || formError) && (
          <div className="text-sm text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm font-medium">
            {formError || error}
          </div>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 font-semibold mb-1 block">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-vibrantBlue transition-colors" />
              <Input 
                id="email" 
                type="email" 
                placeholder="Ex: john.doe@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-11 py-6 bg-white border-gray-200 text-gray-900 focus-visible:ring-2 focus-visible:ring-vibrantBlue/50 focus-visible:border-vibrantBlue rounded-xl shadow-sm text-base placeholder:text-gray-400 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
              <Link to="#" className="text-sm text-vibrantBlue font-medium hover:text-vibrantBlue-dark transition-colors" onClick={() => alert('Password reset is typically handled via Firebase Email links. Enable it in your console!')}>
                Forgot password?
              </Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-vibrantBlue transition-colors" />
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
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
               {isLoading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...</> : 'Sign In'}
             </Button>
          </motion.div>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-medium">
            <span className="bg-white px-4 text-gray-400">Or continue with</span>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button 
            onClick={() => loginWithGoogle()} 
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
        Don't have an account?{" "}
        <Link to="/register" className="text-vibrantBlue font-semibold hover:text-vibrantBlue-dark hover:underline transition-all">
          Sign up
        </Link>
      </div>
    </motion.div>
  );
};

export default LoginForm;