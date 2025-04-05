
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '@/types/auth';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => boolean;
  register: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });
  const { toast } = useToast();

  // Load user data from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem('currentUser');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setState({
            user: parsedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to load user data',
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    loadUser();
  }, []);

  const getUsers = (): User[] => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };

  const saveUsers = (users: User[]) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  const register = (username: string, password: string): boolean => {
    const users = getUsers();
    
    // Check if username already exists
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
      toast({
        title: "Registration failed",
        description: "Username already exists. Please choose another one.",
        variant: "destructive",
      });
      setState(prev => ({ ...prev, error: 'Username already exists' }));
      return false;
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      username,
      password,
      createdAt: new Date()
    };

    // Add to users list
    users.push(newUser);
    saveUsers(users);

    // Login the user
    setState({
      user: newUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });

    // Save current user to localStorage
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    toast({
      title: "Registration successful",
      description: `Welcome, ${username}!`,
    });

    return true;
  };

  const login = (username: string, password: string): boolean => {
    const users = getUsers();
    const user = users.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      // Save current user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(user));

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });

      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
      
      setState(prev => ({
        ...prev,
        error: 'Invalid username or password',
      }));

      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });

    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
