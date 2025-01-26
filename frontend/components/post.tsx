'use client';

import { Avatar, Card, Text, Group, Image, Stack, Title, ActionIcon, Tooltip, Badge, Anchor } from '@mantine/core';
import { IconThumbUp, IconMessageCircle, IconTrash } from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { PostProps } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

const categoryIcons: { [key: string]: string } = {
  G: '🎮',
  F: '🎥',
  M: '🎵'
};

export default function Post({
  post_id,
  poster_id,
  title,
  body,
  category,
  created_at,
  like_count,
  reply_count,
  image_url,
  username,
  profile_picture
}: PostProps) {
  const { user, token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }

    try {
      const response = await fetch(API_URL + '/posts/' + post_id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      });

      if (response.ok) {
        window.location.href = '/';
      } else {
        const err = await response.json();
        console.error('Failed to delete the post:', err);
      }
    } catch (err) {
      console.error('Error during delete request:', err);
    }
  };

  const handleClick = () => {
    if (pathname === '/post/' + post_id) return;
    router.push('/post/' + post_id);
  };

  const canDelete = user && (Number(user.user_id) === poster_id || user.is_admin);

  return (
    <Card
      withBorder
      style={{
        cursor: pathname === '/post/' + post_id ? 'default' : 'pointer',
        width: '100%'
      }}
      onClick={handleClick}
    >
      <Group justify='space-between' style={{ marginBottom: '1rem' }}>
        <Group align='center'>
          <Anchor href={'/user/' + poster_id} style={{ textDecoration: 'none' }} onClick={e => e.stopPropagation()}>
            <Avatar
              src={profile_picture ? API_URL + profile_picture : undefined}
              alt={username || 'User'}
              radius='xl'
              size='lg'
            >
              {!profile_picture && username?.charAt(0).toUpperCase()}
            </Avatar>
          </Anchor>
          <Stack style={{ marginLeft: '1rem' }}>
            <Anchor
              href={'/user/' + poster_id}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={e => e.stopPropagation()}
            >
              <Title order={3}>{username || 'Unknown User'}</Title>
            </Anchor>
            <Text size='xs' c='dimmed'>
              {new Date(created_at).toLocaleString()}
            </Text>
          </Stack>
        </Group>
        <Badge color='blue' size='lg' radius='sm'>
          {categoryIcons[category] || '❓'}
        </Badge>
      </Group>
      <Text fw={600} size='lg' style={{ marginBottom: '0.5rem' }}>
        {title}
      </Text>
      <Text size='sm' c='dimmed' style={{ marginBottom: '1rem' }}>
        {body}
      </Text>
      {image_url && <Image src={API_URL + image_url} alt={title} radius='md' style={{ marginBottom: '1rem' }} />}
      <Group justify='space-between' align='center'>
        <Group>
          <Tooltip label='Like' withArrow>
            <ActionIcon
              variant='light'
              color='blue'
              radius='xl'
              onClick={e => {
                e.stopPropagation();
              }}
            >
              <IconThumbUp size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size='sm' c='dimmed'>
            {like_count}
          </Text>
        </Group>
        {canDelete && (
          <Tooltip label='Delete Post' withArrow>
            <ActionIcon variant='light' color='red' radius='xl' onClick={handleDeleteClick}>
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <Group>
          <Tooltip label='Comments' withArrow>
            <ActionIcon variant='light' color='blue' radius='xl'>
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
