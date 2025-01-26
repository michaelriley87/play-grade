'use client';

import { Container, Stack, Loader } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackButton from '@/components/back-button';
import Feed from '@/components/feed';
import Header from '@/components/header';
import User from '@/components/user';
import { UserData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

export default function ProfilePage() {
  const { user_id } = useParams<{ user_id: string }>();
  const numericUserId = Number(user_id);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(API_URL + '/users/' + numericUserId);
        if (!response.ok) {
          throw new Error('User not found');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [numericUserId]);

  if (loading) {
    return (
      <Container size='sm' className='full-height'>
        <Loader size='lg' />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size='sm' style={{ paddingTop: '20px' }}>
        <Header />
        <Stack align='center'>
          <p>User not found.</p>
          <BackButton />
        </Stack>
      </Container>
    );
  }

  return (
    <Container style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
      <Stack align='center' style={{ width: '750px' }}>
        <Header />
        <BackButton />
        <User {...user} />
        <Feed filters={{ posterId: numericUserId }} />
      </Stack>
    </Container>
  );
}
