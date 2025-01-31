'use client';

import { Container, Stack, Loader, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackButton from '@/components/back-button';
import PostFeed from '@/components/post-feed';
import Header from '@/components/header';
import User from '@/components/user';
import { useAuth } from '@/context/auth-context';
import { UserData } from '@/types/interfaces';
import { API_URL } from '@/config';

export default function UserPage() {
  const user_id = Number(useParams().user_id);
  const { token } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(API_URL + '/users/' + user_id, { headers });

      if (response.ok) {
        setUserData(await response.json());
      }
      setLoading(false);
    };

    fetchUser();
  }, [user_id, token]);

  if (loading) {
    return (
      <Container style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
        <Stack align='center' style={{ width: '750px' }}>
          <Header />
          <BackButton />
          <Loader size='lg' />
        </Stack>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container size='sm' style={{ paddingTop: '20px' }}>
        <Header />
        <Stack align='center'>
          <Text>User not found.</Text>
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
        <User userData={userData} />
        <PostFeed posterId={user_id} />
      </Stack>
    </Container>
  );
}
