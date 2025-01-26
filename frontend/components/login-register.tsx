'use client';

import React, { useState } from 'react';
import { Card, TextInput, PasswordInput, Button, Tabs, Stack } from '@mantine/core';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

const API_URL = 'http://127.0.0.1:5000';

export default function LoginRegister() {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const { setToken } = useAuth();
  const router = useRouter();

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = async () => {
    if (!email || !password || (activeTab === 'register' && !username)) {
      toast.error('All fields are required');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Invalid email format');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    const endpoint = activeTab === 'login' ? '/users/login' : '/users/register';
    const body = activeTab === 'login' ? { email, password } : { username, email, password };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (activeTab === 'login') {
          setToken(data.token);
          toast.success('Login successful!');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          toast.success('Registration successful! You can now log in.');
          setActiveTab('login');
        }
      } else {
        toast.error(data.error || 'An error occurred');
      }
    } catch {
      toast.error('Failed to process your request');
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAuth();
  };

  return (
    <Card withBorder style={{ width: '100%' }}>
      <ToastContainer position='bottom-center' />
      <Stack>
        <Tabs
          value={activeTab}
          onChange={(tab: string | null) => {
            if (tab !== null) setActiveTab(tab);
          }}
        >
          <Tabs.List>
            <Tabs.Tab value='login'>Login</Tabs.Tab>
            <Tabs.Tab value='register'>Register</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='login'>
            <form onSubmit={handleSubmit}>
              <Stack mt='md'>
                <TextInput
                  label='Email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type='email'
                />
                <PasswordInput
                  label='Password'
                  placeholder='Enter your password (min 8 characters)'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Button type='submit' fullWidth>
                  Login
                </Button>
              </Stack>
            </form>
          </Tabs.Panel>

          <Tabs.Panel value='register'>
            <form onSubmit={handleSubmit}>
              <Stack mt='md'>
                <TextInput
                  label='Username'
                  placeholder='Enter your username'
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
                <TextInput
                  label='Email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type='email'
                />
                <PasswordInput
                  label='Password'
                  placeholder='Enter your password (min 8 characters)'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <Button type='submit' fullWidth>
                  Register
                </Button>
              </Stack>
            </form>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Card>
  );
}
