'use client';

import React, { useState } from 'react';
import { TextInput, PasswordInput, Button, Tabs } from '@mantine/core';
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const API_URL = 'http://127.0.0.1:5000';

export default function LoginRegister({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<string>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const router = useRouter();

  const handleAuth = async () => {
    if (!email || !password || (activeTab === 'register' && !name)) {
      toast.error('All fields are required');
      return;
    }
  
    const endpoint = activeTab === 'login' ? '/users/login' : '/users/register';
    const body = activeTab === 'login' ? { email, password } : { name, email, password };
  
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (activeTab === 'login') {
          localStorage.setItem('token', data.token);
          toast.success('Login successful!');
  
          setTimeout(() => {
            window.location.reload();
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
  

  return (
    <div style={{ width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <ToastContainer position="bottom-center" />

      <Tabs
        value={activeTab}
        onChange={(tab) => {
          if (tab !== null) setActiveTab(tab);
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="login">Login</Tabs.Tab>
          <Tabs.Tab value="register">Register</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="login">
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: '10px' }}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginTop: '10px' }}
          />
          <Button onClick={handleAuth} style={{ marginTop: '15px' }} fullWidth>
            Login
          </Button>
        </Tabs.Panel>

        <Tabs.Panel value="register">
          <TextInput
            label="Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginTop: '10px' }}
          />
          <TextInput
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginTop: '10px' }}
          />
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginTop: '10px' }}
          />
          <Button onClick={handleAuth} style={{ marginTop: '15px' }} fullWidth>
            Register
          </Button>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
