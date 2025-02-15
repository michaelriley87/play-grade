'use client';

import styles from '@/styles/components.module.css';
import { Avatar, Card, Text, Group, Stack, ActionIcon, Tooltip, Anchor, Image } from '@mantine/core';
import { IconThumbUp, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ReplyProps } from '@/types/interfaces';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { API_URL } from '@/config';

export default function Reply({ reply_id, replier_id, body, username, profile_picture, like_count, created_at, image_url, liked }: ReplyProps) {
  const { user, token } = useAuth();
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(like_count);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    const response = await fetch(API_URL + '/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + token
      },
      body: JSON.stringify({ target_id: reply_id, type: 'reply' })
    });

    if (response.ok) {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const handleUnlikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    const response = await fetch(API_URL + '/likes', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + token
      },
      body: JSON.stringify({ target_id: reply_id, type: 'reply' })
    });

    if (response.ok) {
      setIsLiked(false);
      setLikeCount(prev => Math.max(prev - 1, 0));
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this reply?');
    if (!confirmed || !token) return;

    const response = await fetch(API_URL + '/replies/' + reply_id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + token
      }
    });

    if (response.ok) {
      window.location.reload();
    } else {
      const error = await response.json();
      alert(error.error || 'Failed to delete reply.');
    }
  };

  const canDelete = user && (user.user_id === replier_id || user.is_admin);

  return (
    <Card withBorder className={styles.card}>
      <Group align='flex-start'>
        <Anchor
          href={'/user/' + replier_id}
          onClick={e => {
            e.stopPropagation();
            router.push('/user/' + replier_id);
          }}
        >
          <Tooltip label={username || 'Unknown User'} withArrow>
            <Avatar src={profile_picture ? API_URL + profile_picture : undefined} radius='xl' size='md'>
              {!profile_picture && username?.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
        </Anchor>
        <Stack style={{ flexGrow: 1 }}>
          <Group align='center' justify='space-between'>
            <Anchor
              href={'/user/' + replier_id}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={e => {
                e.stopPropagation();
                router.push('/user/' + replier_id);
              }}
            >
              <Text>{username || 'Unknown User'}</Text>
            </Anchor>
            <Text size='xs' c='dimmed'>
              {new Date(created_at).toLocaleString()}
            </Text>
          </Group>
          <Text size='sm' c='dimmed'>
            {body}
          </Text>
          {image_url && <Image src={API_URL + image_url} alt='Reply Image' className={styles.image} />}
        </Stack>
      </Group>
      <Group justify='space-between' align='center' style={{ marginTop: '20px' }}>
        <Group>
          <Tooltip label={isLiked ? 'Unlike' : 'Like'} withArrow>
            <ActionIcon variant={isLiked ? 'filled' : 'light'} color={isLiked ? 'blue' : 'gray'} radius='xl' size='xl' onClick={isLiked ? handleUnlikeClick : handleLikeClick}>
              <IconThumbUp size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size='sm' c='dimmed'>
            {likeCount}
          </Text>
        </Group>
        {canDelete && (
          <Tooltip label='Delete Reply' withArrow>
            <ActionIcon variant='light' color='red' radius='xl' size='xl' onClick={handleDeleteClick}>
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <div style={{ width: '50px' }} />
      </Group>
    </Card>
  );
}
