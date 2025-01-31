'use client';

import { Avatar, Button, Card, Flex, Title } from '@mantine/core';
import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { API_URL } from '@/config';
import { UserProps } from '@/types/interfaces';

export default function User({ userData }: UserProps) {
  const { user, token } = useAuth();
  const [isFollowing, setIsFollowing] = useState(userData.is_following);

  const handleFollowToggle = async () => {
    if (!token) return;

    const method = isFollowing ? 'DELETE' : 'POST';
    const response = await fetch(API_URL + '/follows', {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ followee_id: userData.user_id })
    });

    if (response.ok) {
      setIsFollowing(!isFollowing);
    }
  };

  return (
    <Card withBorder style={{ width: '100%' }}>
      <Flex direction='column' align='center' style={{ gap: '8px' }}>
        <Avatar src={userData.profile_picture ? API_URL + userData.profile_picture : undefined} radius='xl' size={100}>
          {!userData.profile_picture && userData.username.charAt(0).toUpperCase()}
        </Avatar>
        <Title order={4} style={{ margin: 0, textAlign: 'center' }}>
          {userData.username}
        </Title>
        {token && user?.user_id !== userData.user_id && isFollowing !== null && (
          <Button onClick={handleFollowToggle} variant={isFollowing ? 'outline' : 'filled'}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </Flex>
    </Card>
  );
}
