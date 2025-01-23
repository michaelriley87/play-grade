'use client';

import React from 'react';
import { Button, Card, Stack, Text, Title } from '@mantine/core';

export default function Account({ onClose }: { onClose: () => void }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack>
        <Title>Account</Title>

        <Stack>
          <Text size="sm">
            Welcome to your account management. More features coming soon!
          </Text>
        </Stack>

        <Button
          color="red"
          onClick={handleLogout}
          style={{ marginTop: '15px' }}
          fullWidth
        >
          Logout
        </Button>
      </Stack>
    </Card>
  );
}
