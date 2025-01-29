'use client';

import jwt from 'jsonwebtoken';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthData } from '@/types/interfaces';

const AuthContext = createContext<AuthData>({
  user: null,
  token: null,
  setToken: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const [user, setUser] = useState<AuthData['user']>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt.decode(token) as { user_id: any; is_admin: boolean };
        setUser({
          user_id: decoded.user_id,
          is_admin: decoded.is_admin
        });
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }, [token]);

  return <AuthContext.Provider value={{ user, token, setToken }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
