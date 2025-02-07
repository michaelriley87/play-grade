'use client';

import styles from '@/styles/components.module.css';
import { Avatar, Button, Card, Container, Stack, TextInput, PasswordInput, Title, Divider, Flex, Anchor, Transition, Text, Box, Loader } from '@mantine/core';
import { IconEdit, IconTrash, IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { UserData } from '@/types/interfaces';
import { API_URL } from '@/config';

export default function Account({ onClose }: { onClose: () => void }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState<'displayPicture' | 'username' | 'password' | null>(null);
  const [newDisplayPicture, setNewDisplayPicture] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { user, token, setToken } = useAuth();
  const router = useRouter();

  // call to fetch user data for account settings
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }
      const response = await fetch(API_URL + '/users/' + user.user_id, { headers: { Authorization: 'Bearer ' + token } });
      const data = await response.json();
      if (response.ok) setUserData(data);
      setLoading(false);
    };
    fetchUserData();
  }, [user, token]);

  // delete local jwt token to log out user
  const handleLogout = () => {
    setToken(null);
    router.push('/');
  };

  // call to delete user account
  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(API_URL + '/users/' + user?.user_id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
        if (response.ok) {
          alert('Account deleted successfully.');
          handleLogout();
        } else {
          alert('Failed to delete account.');
        }
      } catch {
        alert('An error occurred while deleting your account.');
      }
    }
  };

  // manage toggling between account change options
  const toggleForm = (form: 'displayPicture' | 'username' | 'password') => {
    setOpenForm(prev => (prev === form ? null : form));
  };
  
  return (
    <Card withBorder className={styles.card}>
      <Stack className={styles.stack}>
        {loading ? (
          <Loader size="lg" className={styles.loader} />
        ) : !userData ? (
          <Flex className='flex'>
            <Text>Failed to load account data.</Text>
          </Flex>
        ) : (
          <>
            <Flex direction="column" align="center">
              <Anchor href={'/user/' + user?.user_id}>
                <Avatar
                  src={userData.profile_picture ? API_URL + userData.profile_picture : undefined}
                  alt="Profile Picture"
                  radius="xl"
                  size={80}
                >
                  {!userData.profile_picture && userData.username.charAt(0).toUpperCase()}
                </Avatar>
              </Anchor>
              <Anchor href={'/user/' + user?.user_id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Title order={4} style={{ margin: 0, textAlign: 'center' }}>
                  {userData.username}
                </Title>
              </Anchor>
              <Anchor href={'/user/' + user?.user_id} style={{ textDecoration: 'underline', color: '#007bff' }}>
                View Profile
              </Anchor>
            </Flex>
            <Divider my="sm" />
            <Flex justify="space-between" align="center">
              <Text>Change Display Picture</Text>
              <Button size="compact-md" onClick={() => toggleForm('displayPicture')}>
                <IconEdit size={14} />
              </Button>
            </Flex>
            <Transition mounted={openForm === 'displayPicture'} transition="slide-down" duration={300}>
              {(styles) => (
                <Box style={styles}>
                  <Stack>
                    <TextInput placeholder="New display picture URL" value={newDisplayPicture} onChange={(e) => setNewDisplayPicture(e.target.value)} />
                    <Button size="compact-md">Submit</Button>
                  </Stack>
                </Box>
              )}
            </Transition>
            <Flex justify="space-between" align="center">
              <Text>Change Username</Text>
              <Button size="compact-md" onClick={() => toggleForm('username')}>
                <IconEdit size={14} />
              </Button>
            </Flex>
            <Transition mounted={openForm === 'username'} transition="slide-down" duration={300}>
              {(styles) => (
                <Box style={styles}>
                  <Stack>
                    <TextInput placeholder="New username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                    <Button size="compact-md">Submit</Button>
                  </Stack>
                </Box>
              )}
            </Transition>
            <Flex justify="space-between" align="center">
              <Text>Change Password</Text>
              <Button size="compact-md" onClick={() => toggleForm('password')}>
                <IconEdit size={14} />
              </Button>
            </Flex>
            <Transition mounted={openForm === 'password'} transition="slide-down" duration={300}>
              {(styles) => (
                <Box style={styles}>
                  <Stack>
                    <PasswordInput placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                    <Button size="compact-md">Submit</Button>
                  </Stack>
                </Box>
              )}
            </Transition>
            <Flex justify="space-between" align="center">
              <Text>Delete Account</Text>
              <Button color="red" size="compact-md" onClick={handleDeleteAccount}>
                <IconTrash size={14} />
              </Button>
            </Flex>
            <Divider my="sm" />
            <Button
              color="red"
              style={{ width: '100%' }}
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              <IconLogout size={14} style={{ marginRight: '8px' }} /> Logout
            </Button>
          </>
        )}
      </Stack>
    </Card>
  );
}
