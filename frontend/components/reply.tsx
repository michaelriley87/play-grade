'use client';

import { Avatar, Card, Text, Group, Stack, ActionIcon, Tooltip, Anchor, Image } from '@mantine/core';
import { IconThumbUp, IconTrash } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { ReplyProps } from '@/types/interfaces';
import { useAuth } from '@/context/auth-context';

const API_URL = 'http://127.0.0.1:5000';

export default function Reply({ reply_id, replier_id, body, username, profile_picture, like_count, created_at, image_url }: ReplyProps) {
  const { user, token } = useAuth();
  const router = useRouter();

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm('Are you sure you want to delete this reply?');
    if (!confirmed || !token) return;

    const response = await fetch(`${API_URL}/replies/${reply_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
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
    <Card withBorder style={{ width: '100%' }}>
      <Group align='flex-start'>
        <Anchor
          href={'/user/' + replier_id}
          style={{ textDecoration: 'none' }}
          onClick={e => {
            e.stopPropagation();
            router.push('/user/' + replier_id);
          }}
        >
          <Avatar src={profile_picture ? API_URL + profile_picture : undefined} alt={username || 'User'} radius='xl' size='md'>
            {!profile_picture && username?.charAt(0).toUpperCase()}
          </Avatar>
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
          {image_url && (
            <Image src={API_URL + image_url} alt='Reply Image' radius='md' style={{ marginTop: '10px' }} />
          )}
        </Stack>
      </Group>
      <Group justify='space-between' align='center' style={{ marginTop: '20px' }}>
        <Group>
          <Tooltip label='Like' withArrow>
            <ActionIcon variant='light' color='blue' radius='xl' onClick={e => e.stopPropagation()}>
              <IconThumbUp size={18} />
            </ActionIcon>
          </Tooltip>
          <Text size='sm' c='dimmed'>
            {like_count}
          </Text>
        </Group>
        {canDelete && (
          <Tooltip label='Delete Reply' withArrow>
            <ActionIcon variant='light' color='red' radius='xl' onClick={handleDeleteClick}>
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <div style={{ width: '50px' }} />
      </Group>
    </Card>
  );
}
