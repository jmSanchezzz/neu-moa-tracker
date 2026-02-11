"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, MOCK_USERS } from '@/lib/mock-data';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('neu_moa_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string) => {
    // Basic institutional email check
    if (!email.endsWith('@neu.edu.ph')) {
      alert('Only institutional Google emails are allowed.');
      return;
    }

    const foundUser = MOCK_USERS.find(u => u.email === email);
    if (foundUser) {
      if (foundUser.isBlocked) {
        alert('Your account is blocked.');
        return;
      }
      setUser(foundUser);
      localStorage.setItem('neu_moa_user', JSON.stringify(foundUser));
      router.push('/dashboard');
    } else {
      alert('User not found. Contact Admin for registration.');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('neu_moa_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}