'use client';

import Header from '@/components/header';
import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Stack } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import User from '@/components/user';
import Feed from '@/components/feed';

export default function ProfilePage() {
  const { user_id } = useParams<{ user_id: string }>();
  const router = useRouter();

  return (
    <Container size="sm" style={{ paddingTop: '20px' }}>
      <Header />
      <Stack align="center" style={{ marginBottom: '1rem' }}>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/')}
        >
          Home
        </Button>
      </Stack>
      <Stack align="center">
        <User user_id={user_id} />
        <Feed filters={{ posterId: user_id }} />
      </Stack>
    </Container>
  );
}
