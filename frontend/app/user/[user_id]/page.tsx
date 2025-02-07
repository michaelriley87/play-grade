'use client';

import styles from '@/styles/pages.module.css';
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

  // call to fetch user profile data for user component (posts retrieved in user-feed component)
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

  return (
    <Container className={styles.page}>
      <Stack className={styles.pageContent}>
        <Header />
        <BackButton />
        {loading ? (
          <Loader size="lg" className={styles.loader} />
        ) : userData ? (
          <>
            <User userData={userData} />
            <PostFeed posterId={user_id} />
          </>
        ) : (
          <Text>User not found.</Text>
        )}
      </Stack>
    </Container>
  );
}
