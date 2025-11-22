import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { authAPI } from "@/services/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "DOCTOR";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "patient" | "doctor") => Promise<{ needsVerification: boolean; email: string }>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Register function
  const register = async (name: string, email: string, password: string, role: "patient" | "doctor") => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.register(name, email, password, role);
      toast.success(response.message);
      return { needsVerification: true, email: response.email };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.verifyOTP(email, otp);
      
      // Store token and user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      
      toast.success(response.message);
      
      // Redirect based on role
      if (response.user.role === "PATIENT") {
        navigate("/patient-dashboard");
      } else {
        navigate("/doctor-dashboard");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Verification failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.resendOTP(email);
      toast.success(response.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.login(email, password);
      
      // Store token and user
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);
      
      toast.success(response.message);
      
      // Redirect based on role
      if (response.user.role === "PATIENT") {
        navigate("/patient-dashboard");
      } else {
        navigate("/doctor-dashboard");
      }
    } catch (err: any) {
      const message = err.message || "Login failed";
      setError(message);
      
      // Handle email not verified case
      if (err.needsVerification) {
        toast.error("Please verify your email first");
        navigate(`/verify-otp?email=${err.email}`);
      } else {
        toast.error(message);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Forgot Password
  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.forgotPassword(email);
      toast.success(response.message);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send reset email";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password
  const resetPassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authAPI.resetPassword(token, newPassword);
      toast.success(response.message);
      navigate("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reset password";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login,
      register,
      verifyOTP,
      resendOTP,
      logout,
      forgotPassword,
      resetPassword,
      error
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};