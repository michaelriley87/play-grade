'use client';

import Header from '@/components/header';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Stack, Loader } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import User from '@/components/user';
import { UserData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

export default function ProfilePage() {
  const { user_id } = useParams<{ user_id: string }>();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await fetch(`${API_URL}/users/${user_id}`);
        if (!res.ok) {
          throw new Error('User not found');
        }
        const data: UserData = await res.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user_id, router]);

  if (loading) {
    return (
      <Container size="sm" className="full-height">
        <Loader size="lg" />
      </Container>
    );
  }

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
      <Stack align="center">{userData && <User user_id={user_id} />}</Stack>
    </Container>
  );
}
