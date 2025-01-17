'use client';

import React, { useState } from 'react';
import { TextInput, PasswordInput, Button } from '@mantine/core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'http://127.0.0.1:5000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    try {
      const response = await fetch(API_URL + '/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Login successful!');
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        toast.error(data.error || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('An error occurred during login');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <ToastContainer position="bottom-center" />
      <h1 style={{ textAlign: 'center' }}>Login</h1>

      <TextInput
        label="Email"
        placeholder="Enter your email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: '10px' }}
      />

      <PasswordInput
        label="Password"
        placeholder="Enter your password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      <Button fullWidth onClick={handleLogin}>
        Login
      </Button>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <span>Don't have an account yet? </span>
        <Link href="/register">
          Sign up
        </Link>
      </div>
    </div>
  );
}
