'use client';

import React from 'react';
import { Button } from '@mantine/core';

export default function Account({ onClose }: { onClose: () => void }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '10px',
      }}
    >
      <h2>Account</h2>
      <p>Welcome to your account management. More features coming soon!</p>
      <Button
        color="red"
        onClick={handleLogout}
        style={{ marginTop: '15px' }}
        fullWidth
      >
        Logout
      </Button>
    </div>
  );
}
