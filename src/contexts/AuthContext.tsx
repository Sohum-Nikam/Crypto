import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
  walletBalance: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  simplePasswordReset: (email: string, newPassword: string) => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    if (tokenFromStorage) {
      setToken(tokenFromStorage);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      const { token, user, message } = data;
      localStorage.setItem('token', token);
      setToken(token);
      setUser(user);
      return message; // Return the welcome message
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const register = async (userData: {
    name: string;
    lastname: string;
    email: string;
    phone: string;
    password: string;
  }) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok) {
      return data.message; // Return the success message
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset request failed');
    }
    
    return data;
  };

  const resetPassword = async (email: string, newPassword: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }
    
    return data.message;
  };

  const simplePasswordReset = async (email: string, newPassword: string) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/simple-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Password reset failed');
    }
    
    return data.message;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    simplePasswordReset,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};