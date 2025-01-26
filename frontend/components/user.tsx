'use client';

import { Avatar, Card, Flex, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { UserProps, UserData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

export default function User({ user_id }: UserProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const response = await fetch(API_URL + '/users/' + user_id);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [user_id]);

  if (isLoading) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        Loading...
      </Card>
    );
  }

  if (!userData) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        Failed to load user data.
      </Card>
    );
  }

  return (
    <Card withBorder style={{ width: '100%' }}>
      <Flex direction='column' align='center' style={{ gap: '8px' }}>
        <Avatar src={userData?.profile_picture ? API_URL + userData.profile_picture : undefined} radius='xl' size={100}>
          {!userData?.profile_picture && userData?.username?.charAt(0).toUpperCase()}
        </Avatar>
        <Title order={4} style={{ margin: 0, textAlign: 'center' }}>
          {userData.username}
        </Title>
      </Flex>
    </Card>
  );
}
