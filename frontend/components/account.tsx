'use client';

import React, { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Stack,
  TextInput,
  PasswordInput,
  Title,
  Divider,
  Flex,
  Anchor,
} from '@mantine/core';
import { IconEdit, IconTrash, IconLogout } from '@tabler/icons-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = 'http://127.0.0.1:5000';

interface UserData {
  username: string;
  profile_picture?: string;
}

export default function Account({ onClose }: { onClose: () => void }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editDisplayPicture, setEditDisplayPicture] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const [editPassword, setEditPassword] = useState(false);

  const [newDisplayPicture, setNewDisplayPicture] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { user, token, setToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/users/${user.user_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setUserData(data);
        } else {
          console.error(data.error || 'Failed to retrieve user data');
        }
      } catch (error) {
        console.error('An error occurred while fetching user data', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, token]);

  const handleLogout = () => {
    setToken(null);
    router.push('/');
  };

  const toggleEditField = (
    field: 'displayPicture' | 'username' | 'password'
  ) => {
    if (field === 'displayPicture') setEditDisplayPicture(!editDisplayPicture);
    if (field === 'username') setEditUsername(!editUsername);
    if (field === 'password') setEditPassword(!editPassword);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!userData) return <div>Failed to load user data.</div>;

  return (
    <Card withBorder style={{ width: '100%' }}>
      <Stack
        gap="md"
        style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}
      >
        {/* Profile Info Section */}
        <Flex direction="column" align="center" style={{ gap: '8px' }}>
          <Anchor
            href={`/user/${user?.user_id}`}
            style={{ textDecoration: 'none' }}
          >
            <Avatar
              src={
                userData.profile_picture
                  ? `${API_URL}${userData.profile_picture}`
                  : undefined
              }
              alt="Profile Picture"
              radius="xl"
              size={80}
            >
              {!userData.profile_picture &&
                userData.username.charAt(0).toUpperCase()}
            </Avatar>
          </Anchor>
          <Anchor
            href={`/user/${user?.user_id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Title order={4} style={{ margin: 0, textAlign: 'center' }}>
              {userData.username}
            </Title>
          </Anchor>
        </Flex>

        <Divider my="sm" />

        {/* Change Display Picture */}
        <Flex justify="space-between" align="center" gap="sm">
          <span>Change Display Picture</span>
          <Button
            size="compact-md"
            onClick={() => toggleEditField('displayPicture')}
          >
            <IconEdit size={14} />
          </Button>
        </Flex>
        {editDisplayPicture && (
          <Stack gap="xs">
            <TextInput
              placeholder="New display picture URL"
              value={newDisplayPicture}
              onChange={(e) => setNewDisplayPicture(e.target.value)}
            />
            <Button size="compact-md">Submit</Button>
          </Stack>
        )}

        {/* Change Username */}
        <Flex justify="space-between" align="center" gap="sm">
          <span>Change Username</span>
          <Button size="compact-md" onClick={() => toggleEditField('username')}>
            <IconEdit size={14} />
          </Button>
        </Flex>
        {editUsername && (
          <Stack gap="xs">
            <TextInput
              placeholder="New username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
            <Button size="compact-md">Submit</Button>
          </Stack>
        )}

        {/* Change Password */}
        <Flex justify="space-between" align="center" gap="sm">
          <span>Change Password</span>
          <Button size="compact-md" onClick={() => toggleEditField('password')}>
            <IconEdit size={14} />
          </Button>
        </Flex>
        {editPassword && (
          <Stack gap="xs">
            <PasswordInput
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button size="compact-md">Submit</Button>
          </Stack>
        )}

        <Divider my="sm" />

        {/* Account Actions */}
        <Button color="red" variant="outline" style={{ width: '100%' }}>
          <IconTrash size={14} style={{ marginRight: '8px' }} />
          Delete Account
        </Button>
        <Button color="red" style={{ width: '100%' }} onClick={handleLogout}>
          <IconLogout size={14} style={{ marginRight: '8px' }} />
          Logout
        </Button>
      </Stack>
    </Card>
  );
}
