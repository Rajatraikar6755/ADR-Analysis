import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { authAPI } from "@/services/api";
import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

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
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string, role?: "patient" | "doctor", licenseNumber?: string, licenseDocument?: File) => Promise<void>;
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

  const handleBackendAuth = async (idToken: string, role?: "patient" | "doctor", licenseNumber?: string, licenseDocument?: File, name?: string) => {
    // Send the token to the backend
    const response = await authAPI.loginWithFirebase(idToken, role, licenseNumber, licenseDocument, name);

    // Store token and user from our backend
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    setUser(response.user);

    toast.success(response.message || "Authentication successful!");

    // Redirect based on role
    if (response.user.role === "PATIENT") {
      navigate("/patient-dashboard");
    } else if (response.user.role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/doctor-dashboard");
    }
  };

  const loginWithGoogle = async (role?: "patient" | "doctor", licenseNumber?: string, licenseDocument?: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await handleBackendAuth(idToken, role, licenseNumber, licenseDocument);
    } catch (err: any) {
      const message = err.message || "Google Authentication failed";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      // Role doesn't matter for login
      await handleBackendAuth(idToken);
    } catch (err: any) {
      let message = err.message || "Authentication failed";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = "Invalid email or password.";
      }
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string, role?: "patient" | "doctor", licenseNumber?: string, licenseDocument?: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      await handleBackendAuth(idToken, role, licenseNumber, licenseDocument, name);
    } catch (err: any) {
      let message = err.message || "Registration failed";
      if (err.code === 'auth/email-already-in-use') {
        message = "An account with this email already exists.";
      } else if (err.code === 'auth/weak-password') {
        message = "Password should be at least 6 characters.";
      }
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
      loginWithEmail,
      registerWithEmail,
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