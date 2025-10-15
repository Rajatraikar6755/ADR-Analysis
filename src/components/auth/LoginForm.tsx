
// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Label } from '@/components/ui/label';
// import { Heart, Loader2 } from 'lucide-react';

// const LoginForm: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const { login, isLoading, error } = useAuth();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await login(email, password);
//   };

//   // For demo purposes, pre-fill with sample credentials
//   const fillPatientCredentials = () => {
//     setEmail('patient@example.com');
//     setPassword('password');
//   };

//   const fillDoctorCredentials = () => {
//     setEmail('doctor@example.com');
//     setPassword('password');
//   };

//   return (
//     <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <div className="flex justify-center mb-2">
//             <Heart className="h-10 w-10 text-healthcare-600" />
//           </div>
//           <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
//           <CardDescription className="text-center">
//             Enter your credentials to access your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="name@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link to="/forgot-password" className="text-sm text-healthcare-600 hover:underline">
//                   Forgot password?
//                 </Link>
//               </div>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="••••••••"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>

//             {error && (
//               <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>
//             )}

//             <Button type="submit" className="w-full bg-healthcare-600 hover:bg-healthcare-700" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Logging in...
//                 </>
//               ) : (
//                 'Login'
//               )}
//             </Button>
//           </form>

//           <div className="mt-6 space-y-2">
//             <p className="text-center text-sm text-gray-500">For demo purposes:</p>
//             <div className="flex gap-2">
//               <Button variant="outline" onClick={fillPatientCredentials} className="flex-1 text-xs" size="sm">
//                 Use Patient Demo
//               </Button>
//               <Button variant="outline" onClick={fillDoctorCredentials} className="flex-1 text-xs" size="sm">
//                 Use Doctor Demo
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//         <CardFooter>
//           <p className="text-sm text-center text-gray-600 w-full">
//             Don't have an account?{" "}
//             <Link to="/register" className="text-healthcare-600 hover:underline">
//               Register
//             </Link>
//           </p>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// };

// export default LoginForm;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Heart, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };
  
  const fillPatientCredentials = () => {
    setEmail('patient@example.com');
    setPassword('password');
  };

  const fillDoctorCredentials = () => {
    setEmail('doctor@example.com');
    setPassword('password');
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
          <CardDescription className="text-vibrantBlue/80">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium">Email</Label>
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
              <Label htmlFor="password" className="font-medium">Password</Label>
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

            {error && (
              <div className="text-sm text-red-300 bg-red-900/50 p-2 rounded">{error}</div>
            )}

            <Button type="submit" className="w-full bg-gradient-to-r from-vibrantBlue-light to-vibrantBlue text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : 'Login'}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <Button variant="outline" onClick={fillPatientCredentials} className="flex-1 text-xs bg-white/20 border-white/50 hover:bg-white/30 text-black">
                Use Patient Demo
              </Button>
              <Button variant="outline" onClick={fillDoctorCredentials} className="flex-1 text-xs bg-white/20 border-white/50 hover:bg-white/30 text-black">
                Use Doctor Demo
              </Button>
            </div>
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