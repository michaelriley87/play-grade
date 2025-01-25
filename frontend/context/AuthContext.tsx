'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import jwt from 'jsonwebtoken';

interface AuthData {
  user: { user_id: string; is_admin: boolean } | null;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthData>({
  user: null,
  token: null,
  setToken: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  const [user, setUser] = useState<{
    user_id: string;
    is_admin: boolean;
  } | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt.decode(token) as {
          user_id: string;
          is_admin: boolean;
        };
        setUser(decoded);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
