'use client';

import { Container, Stack, Loader, Text } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackButton from '@/components/back-button';
import PostFeed from '@/components/post-feed';
import Header from '@/components/header';
import User from '@/components/user';
import { UserData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

export default function UserPage() {
  const user_id = Number(useParams().user_id);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(API_URL + '/users/' + user_id);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
      setLoading(false);
    };
    fetchUser();
  }, [user_id]);

  if (loading) {
    return (
      <Container
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Loader size='lg' />
      </Container>
    );
  }

  if (!user) {
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
        <User {...user} />
        <PostFeed posterId={user_id} />
      </Stack>
    </Container>
  );
}
