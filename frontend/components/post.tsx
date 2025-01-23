'use client';

import {
  Avatar,
  Card,
  Text,
  Group,
  Image,
  Stack,
  ActionIcon,
  Tooltip,
  Badge,
} from '@mantine/core';
import { useRouter, usePathname } from 'next/navigation';
import { IconThumbUp, IconMessageCircle, IconTrash } from '@tabler/icons-react';
import jwt from 'jsonwebtoken';

const API_URL = 'http://127.0.0.1:5000';

const categoryIcons: { [key: string]: string } = {
  G: '🎮',
  F: '🎥',
  M: '🎵',
};

interface DecodedJWT {
  user_id: string;
  is_admin: boolean;
}

interface PostProps {
  post_id: number;
  poster_id: number;
  title: string;
  body: string;
  category: string;
  created_at: string;
  like_count: number;
  reply_count: number;
  image_url?: string;
  user?: {
    username: string;
    profile_picture_url?: string;
  };
}

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
  user,
}: PostProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );
    if (!confirmed) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }

    fetch(`${API_URL}/posts/${post_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          console.log(`Post ${post_id} deleted successfully.`);
          window.location.href = '/';
        } else {
          response
            .json()
            .then((err) => console.error('Failed to delete the post:', err));
        }
      })
      .catch((err) => console.error('Error during delete request:', err));
  };

  const handleClick = () => {
    if (pathname === `/post/${post_id}`) return;
    router.push(`/post/${post_id}`);
  };

  const token = localStorage.getItem('token');
  let currentUser: DecodedJWT | null = null;

  if (token) {
    try {
      const decoded = jwt.decode(token) as DecodedJWT | null;
      currentUser = decoded as DecodedJWT;
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }

  const canDelete =
    currentUser &&
    (Number(currentUser.user_id) === poster_id || currentUser.is_admin);

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        cursor: pathname === `/post/${post_id}` ? 'default' : 'pointer',
      }}
      onClick={handleClick}
    >
      <Group justify="space-between" style={{ marginBottom: '1rem' }}>
        <Group align="center">
          <Avatar
            src={
              user?.profile_picture_url
                ? API_URL + user.profile_picture_url
                : null
            }
            alt={user?.username || 'User'}
            radius="xl"
          />
          <Stack style={{ marginLeft: '1rem' }}>
            <Text fw={500}>{user?.username || 'Unknown User'}</Text>
            <Text size="xs" c="dimmed">
              {new Date(created_at).toLocaleString()}
            </Text>
          </Stack>
        </Group>
        <Badge color="blue" size="lg" radius="sm">
          {categoryIcons[category] || '❓'}
        </Badge>
      </Group>

      <Text fw={600} size="lg" style={{ marginBottom: '0.5rem' }}>
        {title}
      </Text>
      <Text size="sm" c="dimmed" style={{ marginBottom: '1rem' }}>
        {body}
      </Text>

      {image_url && (
        <Image
          src={API_URL + image_url}
          alt={title}
          radius="md"
          style={{ marginBottom: '1rem' }}
        />
      )}

      <Group justify="space-between" align="center">
        <Group>
          <Tooltip label="Like" withArrow>
            <ActionIcon
              variant="light"
              color="blue"
              radius="xl"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <IconThumbUp size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm" c="dimmed">
            {like_count}
          </Text>
        </Group>
        {canDelete && (
          <Tooltip label="Delete Post" withArrow>
            <ActionIcon
              variant="light"
              color="red"
              radius="xl"
              onClick={handleDeleteClick}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <Group>
          <Tooltip label="Comments" withArrow>
            <ActionIcon variant="light" color="blue" radius="xl">
              <IconMessageCircle size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm" c="dimmed">
            {reply_count}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
