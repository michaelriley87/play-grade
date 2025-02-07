'use client';

import styles from '@/styles/components.module.css';
import { Avatar, Card, Text, Group, Image, Stack, Title, ActionIcon, Tooltip, Badge } from '@mantine/core';
import { IconThumbUp, IconMessageCircle, IconTrash } from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useState } from 'react';
import { PostProps } from '@/types/interfaces';
import { API_URL } from '@/config';

const categoryIcons: { [key: string]: string } = {
  G: '🎮',
  F: '🎥',
  M: '🎵'
};

export default function Post({ post_id, poster_id, title, body, category, created_at, like_count, reply_count, image_url, username, profile_picture, liked }: PostProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(like_count);
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    const response = await fetch(API_URL + '/likes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ target_id: post_id, type: 'post' })
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
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ target_id: post_id, type: 'post' })
    });

    if (response.ok) {
      setIsLiked(false);
      setLikeCount(prev => Math.max(prev - 1, 0));
    }
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    const response = await fetch(API_URL + '/posts/' + post_id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    });

    if (response.ok) {
      window.location.href = '/';
    }
  };

  const handleClickPost = () => {
    if (pathname !== '/post/' + post_id) {
      router.push('/post/' + post_id);
    }
  };

  const handleClickUser = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pathname !== '/user/' + poster_id) {
      router.push('/user/' + poster_id);
    }
  };

  const canDelete = user && (user.user_id === poster_id || user.is_admin);

  return (
    <Card
      withBorder
      style={{
        cursor: pathname === '/post/' + post_id ? 'default' : 'pointer',
        width: '100%'
      }}
      onClick={handleClickPost}
    >
      <Group justify='space-between' style={{ marginBottom: '20px' }}>
        <Group align='center'>
          <Tooltip label={username || 'Unknown User'} withArrow>
            <Avatar src={profile_picture ? API_URL + profile_picture : undefined} radius='xl' size='lg' onClick={handleClickUser} style={{ cursor: pathname === '/user/' + poster_id ? 'default' : 'pointer' }}>
              {!profile_picture && username?.charAt(0).toUpperCase()}
            </Avatar>
          </Tooltip>
          <Stack>
            <Title
              order={3}
              onClick={handleClickUser}
              style={{
                cursor: pathname === '/user/' + poster_id ? 'default' : 'pointer'
              }}
            >
              {username || 'Unknown User'}
            </Title>
            <Text size='xs' c='dimmed'>
              {new Date(created_at).toLocaleString()}
            </Text>
          </Stack>
        </Group>
        <Tooltip label={category === 'G' ? 'Games' : category === 'F' ? 'Film/TV' : category === 'M' ? 'Music' : 'Unknown'} withArrow>
          <Badge color='blue' size='lg' radius='sm'>
            {categoryIcons[category] || '❓'}
          </Badge>
        </Tooltip>
      </Group>
      <Text fw={600} size='lg' style={{ margin: '10px' }}>
        {title}
      </Text>
      <Text size='md' c='dimmed' style={{ margin: '10px' }}>
        {body}
      </Text>
      {image_url && <Image src={API_URL + image_url} alt={title} className={styles.image} />}
      <Group justify='space-between' align='center'>
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
          <Tooltip label='Delete Post' withArrow>
            <ActionIcon variant='light' color='red' radius='xl' size='xl' onClick={handleDeleteClick}>
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <Group>
          <Tooltip label='Comments' withArrow>
            <ActionIcon variant='light' color='gray' radius='xl' size='xl'>
              <IconMessageCircle size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size='sm' c='dimmed'>
            {reply_count}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
