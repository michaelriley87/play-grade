'use client';

import { Avatar, Button, Card, Flex, Title } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { UserProps, UserData } from '@/types/interfaces';
import { API_URL } from '@/config';

export default function User({ user_id }: UserProps) {
  const { user, token } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
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

    const fetchFollowStatus = async () => {
      if (!token || user?.user_id === user_id) return;

      const response = await fetch(API_URL + '/follows/status/' + user_id, {
        headers: { Authorization: `Bearer ` + token }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.is_following);
      }
    };

    fetchUserData();
    fetchFollowStatus();
  }, [user_id, user?.user_id, token]);

  const handleFollowToggle = async () => {
    if (!token) return;

    const method = isFollowing ? 'DELETE' : 'POST';
    const response = await fetch(API_URL + `/follows`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + token
      },
      body: JSON.stringify({ followee_id: user_id })
    });

    if (response.ok) {
      setIsFollowing(!isFollowing);
    }
  };

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
        {user?.user_id !== user_id && isFollowing !== null && (
          <Button onClick={handleFollowToggle} variant={isFollowing ? 'outline' : 'filled'}>
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </Flex>
    </Card>
  );
}
