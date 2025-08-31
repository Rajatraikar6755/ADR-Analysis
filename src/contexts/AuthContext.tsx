
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";

// Types for our authentication context
type User = {
  id: string;
  name: string;
  email: string;
  role: "patient" | "doctor";
  profileComplete: boolean;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "patient" | "doctor") => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  error: string | null;
};

// Mock authentication for demonstration purposes
// In a real application, this would use actual API calls to a backend
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "patient@example.com",
    password: "password",
    role: "patient",
    profileComplete: true
  },
  {
    id: "2",
    name: "Dr. Jane Smith",
    email: "doctor@example.com",
    password: "password",
    role: "doctor",
    profileComplete: true
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(
        user => user.email === email && user.password === password
      );
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        toast.success("Login successful!");
        
        // Redirect based on role and profile completion
        if (foundUser.role === "patient") {
          navigate("/patient-dashboard");
        } else {
          navigate("/doctor-dashboard");
        }
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("An unknown error occurred");
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: "patient" | "doctor") => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if email already exists
      const emailExists = mockUsers.some(user => user.email === email);
      
      if (emailExists) {
        throw new Error("Email already in use");
      }
      
      // In a real app, this would be an API call
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        profileComplete: false
      };
      
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      toast.success("Registration successful!");
      
      // Redirect based on role
      if (role === "patient") {
        navigate("/patient-dashboard");
      } else {
        navigate("/doctor-dashboard");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("An unknown error occurred");
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // Check if user is authenticated
  const checkAuth = async (): Promise<boolean> => {
    // In a real app, this would verify the token with the server
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      checkAuth,
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
