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
import { IconThumbUp, IconMessageCircle } from '@tabler/icons-react';

const API_URL = 'http://127.0.0.1:5000';

const categoryIcons: { [key: string]: string } = {
  G: '🎮', 
  F: '🎥', 
  M: '🎵', 
};

interface PostProps {
  post_id: string;
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
  title,
  body,
  category,
  created_at,
  like_count,
  reply_count,
  image_url,
  user,
}: PostProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
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

      <Group justify="space-between">
        <Group>
          <Tooltip label="Like" withArrow>
            <ActionIcon variant="light" color="blue" radius="xl">
              <IconThumbUp size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size="sm" c="dimmed">
            {like_count}
          </Text>
        </Group>
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
