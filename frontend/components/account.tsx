'use client';

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

  const handleLogout = () => {
    setToken(null);
    router.push('/');
  };

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

  const toggleForm = (form: 'displayPicture' | 'username' | 'password') => {
    setOpenForm(prev => (prev === form ? null : form));
  };

  if (loading) {
    return (
      <Container
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Loader size='lg' />
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container size='sm' style={{ paddingTop: '20px' }}>
        <Stack align='center'>
          <Text>Failed to load account data.</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Card withBorder style={{ width: '100%' }}>
      <Stack gap='md' style={{ width: '100%', maxWidth: '600px', margin: 'auto' }}>
        <Flex direction='column' align='center' gap='xs'>
          <Anchor href={'/user/' + user?.user_id} style={{ textDecoration: 'none' }}>
            <Avatar src={userData.profile_picture ? API_URL + userData.profile_picture : undefined} alt='Profile Picture' radius='xl' size={80}>
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
        <Divider my='sm' />
        <Flex justify='space-between' align='center' gap='sm'>
          <Text>Change Display Picture</Text>
          <Button size='compact-md' onClick={() => toggleForm('displayPicture')}>
            <IconEdit size={14} />
          </Button>
        </Flex>
        <Transition mounted={openForm === 'displayPicture'} transition='slide-down' duration={300}>
          {styles => (
            <Box style={styles}>
              <Stack gap='xs'>
                <TextInput placeholder='New display picture URL' value={newDisplayPicture} onChange={e => setNewDisplayPicture(e.target.value)} />
                <Button size='compact-md'>Submit</Button>
              </Stack>
            </Box>
          )}
        </Transition>
        <Flex justify='space-between' align='center' gap='sm'>
          <Text>Change Username</Text>
          <Button size='compact-md' onClick={() => toggleForm('username')}>
            <IconEdit size={14} />
          </Button>
        </Flex>
        <Transition mounted={openForm === 'username'} transition='slide-down' duration={300}>
          {styles => (
            <Box style={styles}>
              <Stack gap='xs'>
                <TextInput placeholder='New username' value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                <Button size='compact-md'>Submit</Button>
              </Stack>
            </Box>
          )}
        </Transition>
        <Flex justify='space-between' align='center' gap='sm'>
          <Text>Change Password</Text>
          <Button size='compact-md' onClick={() => toggleForm('password')}>
            <IconEdit size={14} />
          </Button>
        </Flex>
        <Transition mounted={openForm === 'password'} transition='slide-down' duration={300}>
          {styles => (
            <Box style={styles}>
              <Stack gap='xs'>
                <PasswordInput placeholder='New password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <Button size='compact-md'>Submit</Button>
              </Stack>
            </Box>
          )}
        </Transition>
        <Flex justify='space-between' align='center' gap='sm'>
          <Text>Delete Account</Text>
          <Button color='red' size='compact-md' onClick={handleDeleteAccount}>
            <IconTrash size={14} />
          </Button>
        </Flex>
        <Divider my='sm' />
        <Button
          color='red'
          style={{ width: '100%' }}
          onClick={() => {
            handleLogout();
            onClose();
          }}
        >
          <IconLogout size={14} style={{ marginRight: '8px' }} /> Logout
        </Button>
      </Stack>
    </Card>
  );
}
