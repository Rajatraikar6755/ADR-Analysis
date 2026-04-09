import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginForm: React.FC = () => {
  const { loginWithGoogle, isLoading, error } = useAuth();

  const handleGoogleSignIn = async () => {
    // Calling loginWithGoogle without role parameters means it's just a login attempt
    await loginWithGoogle();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="w-full max-w-md bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 text-black">
        <CardHeader className="space-y-1 text-center">
          <Heart className="h-12 w-12 text-vibrantBlue mx-auto drop-shadow-lg" />
          <CardTitle className="text-3xl font-bold drop-shadow-md">Welcome Back</CardTitle>
          <CardDescription className="text-vibrantBlue/80">Sign in securely with Google</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <div className="text-sm text-red-300 bg-red-900/50 p-3 rounded">{error}</div>
            )}

            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full bg-white text-gray-800 hover:bg-gray-100 font-bold py-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center border border-gray-200 gap-3" 
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Logging in...</>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-black/80 w-full">
            Don't have an account?{" "}
            <Link to="/register" className="text-vibrantBlue font-bold hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default LoginForm;