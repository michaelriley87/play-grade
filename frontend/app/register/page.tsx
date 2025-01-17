'use client';

import React, { useState } from 'react';
import { TextInput, PasswordInput, Button } from '@mantine/core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const API_URL = 'http://127.0.0.1:5000';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Please log in.');
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      toast.error('Failed to register');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <ToastContainer position="bottom-center" />
      <h1 style={{ textAlign: 'center' }}>Register</h1>

      <TextInput
        label="Username"
        placeholder="Enter your username"
        required
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: '10px' }}
      />

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
        style={{ marginBottom: '10px' }}
      />

      <PasswordInput
        label="Confirm Password"
        placeholder="Confirm your password"
        required
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      <Button fullWidth onClick={handleRegister}>
        Register
      </Button>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <span>Already have an account? </span>
        <Link href="/login">
          Login
        </Link>
      </div>
    </div>
  );
}
