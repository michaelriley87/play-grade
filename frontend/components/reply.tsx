'use client';

import {
  Avatar,
  Card,
  Text,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
  Anchor,
} from '@mantine/core';
import { IconThumbUp } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ReplyProps } from '@/types/interfaces';

export default function Reply({
  replier_id,
  body,
  username,
  profile_picture,
  like_count,
  created_at,
}: ReplyProps) {
  const API_URL = 'http://127.0.0.1:5000';
  const router = useRouter();

  return (
    <Card withBorder style={{ width: '100%' }}>
      <Group align="flex-start">
        {/* Profile picture linking to user's profile */}
        <Anchor
          href={`/user/${replier_id}`}
          style={{ textDecoration: 'none' }}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/user/${replier_id}`);
          }}
        >
          <Avatar
            src={profile_picture ? `${API_URL}/${profile_picture}` : null}
            alt={username || 'User'}
            radius="xl"
            size="md"
          />
        </Anchor>
        <Stack style={{ flexGrow: 1 }}>
          <Group align="center" justify="space-between">
            {/* Username linking to user's profile */}
            <Anchor
              href={`/user/${replier_id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/user/${replier_id}`);
              }}
            >
              <Text>{username || 'Unknown User'}</Text>
            </Anchor>
            <Text size="xs" c="dimmed">
              {new Date(created_at).toLocaleString()}
            </Text>
          </Group>
          <Text size="sm" c="dimmed">
            {body}
          </Text>
        </Stack>
      </Group>
      <Group justify="flex-start" style={{ marginTop: '1rem' }}>
        <Tooltip label="Like" withArrow>
          <ActionIcon
            variant="light"
            color="blue"
            radius="xl"
            onClick={(e) => e.stopPropagation()}
          >
            <IconThumbUp size={18} />
          </ActionIcon>
        </Tooltip>
        <Text size="sm" c="dimmed">
          {like_count}
        </Text>
      </Group>
    </Card>
  );
}
