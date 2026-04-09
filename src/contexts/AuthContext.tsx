import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { authAPI } from "@/services/api";
import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup } from "firebase/auth";

type User = {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "DOCTOR" | "ADMIN";
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: (role?: "patient" | "doctor", licenseNumber?: string, licenseDocument?: File) => Promise<void>;
  logout: () => void;
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

  const loginWithGoogle = async (role?: "patient" | "doctor", licenseNumber?: string, licenseDocument?: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Sign in with Google via Firebase
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2. Send the token to the backend
      const response = await authAPI.loginWithGoogle(idToken, role, licenseNumber, licenseDocument);

      // 3. Store token and user from our backend
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);

      toast.success(response.message || "Authentication successful!");

      // 4. Redirect based on role
      if (response.user.role === "PATIENT") {
        navigate("/patient-dashboard");
      } else if (response.user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/doctor-dashboard");
      }
    } catch (err: any) {
      const message = err.message || "Authentication failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    auth.signOut(); // Ensure we sign out of Firebase too
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      loginWithGoogle,
      logout,
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