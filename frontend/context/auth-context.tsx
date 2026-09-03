'use client';

import jwt from 'jsonwebtoken';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthData } from '@/types/interfaces';

const AuthContext = createContext<AuthData>({
  user: null,
  token: null,
  setToken: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('token') : null);
  const user = useMemo<AuthData['user']>(() => {
    if (!token) return null;

    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded === 'string' || typeof decoded.user_id !== 'number' || typeof decoded.is_admin !== 'boolean') {
      return null;
    }

    return {
      user_id: decoded.user_id,
      is_admin: decoded.is_admin
    };
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
