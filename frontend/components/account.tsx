'use client';

import styles from '@/styles/components.module.css';
import { Avatar, Button, Card, Stack, FileInput, TextInput, PasswordInput, Title, Divider, Flex, Anchor, Transition, Text, Box, Loader, Image } from '@mantine/core';
import imageCompression from 'browser-image-compression';
import { IconEdit, IconTrash, IconLogout } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { UserData } from '@/types/interfaces';
import { API_URL } from '@/config';
import { ToastContainer, toast } from 'react-toastify';

export default function Account({ onClose }: { onClose: () => void }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState<'profilePicture' | 'username' | 'password' | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { user, token, setToken } = useAuth();
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [previewProfilePicture, setPreviewProfilePicture] = useState<string | null>(null);
  const MAX_FILE_SIZE_MB = 1;
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

  // handle profile picture change and compression
  const handleProfilePictureChange = async (file: File | null) => {
    if (!file) {
      setNewProfilePicture(null);
      setPreviewProfilePicture(null);
      return;
    }
    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(file, options);
        setNewProfilePicture(compressedFile);
        setPreviewProfilePicture(URL.createObjectURL(compressedFile));
      } catch (err) {
        toast.error('Failed to compress image');
      }
    } else {
      setNewProfilePicture(file);
      setPreviewProfilePicture(URL.createObjectURL(file));
    }
  };

  // call to update profile picture
  const handleUpdateProfilePicture = async () => {
    if (!newProfilePicture || !user || !token) {
      toast.error('Please select a valid image.');
      return;
    }
    const formData = new FormData();
    formData.append('image', newProfilePicture);
    try {
      const response = await fetch(API_URL + '/users/' + user.user_id + '/profile-picture', {
        method: 'PATCH',
        headers: { Authorization: 'Bearer ' + token },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Profile picture updated successfully.');
        setUserData(prev => (prev ? { ...prev, profile_picture: data.profile_picture } : prev));
        setOpenForm(null);
      } else {
        toast.error(data.error || 'Failed to update profile picture.');
      }
    } catch (err) {
      toast.error('Error updating profile picture.');
    }
  };

  // call to update username
  const handleUpdateUsername = async () => {
    if (!newUsername || !user || !token) {
      toast.error('Username cannot be empty.');
      return;
    }
    try {
      const response = await fetch(API_URL + '/users/' + user.user_id + '/username', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: newUsername })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Username updated successfully.');
        setUserData(prev => (prev ? { ...prev, username: newUsername } : prev));
        setNewUsername('');
        setOpenForm(null);
      } else {
        toast.error(data.error || 'Failed to update username.');
      }
    } catch (err) {
      toast.error('Error updating username.');
    }
  };

  // call to update password
  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !user || !token) {
      toast.error('All fields are required.');
      return;
    }
    try {
      const response = await fetch(API_URL + '/users/' + user.user_id + '/password', {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setOpenForm(null);
      } else {
        toast.error(data.error || 'Failed to update password.');
      }
    } catch (err) {
      toast.error('Error updating password.');
    }
  };

  // manage toggling between account change options
  const toggleForm = (form: 'profilePicture' | 'username' | 'password') => {
    setOpenForm(prev => (prev === form ? null : form));
  };
  return (
    <Card withBorder className={styles.card}>
      <Stack className={styles.stack}>
        {loading ? (
          <Loader size='lg' className={styles.loader} />
        ) : !userData ? (
          <Flex className={styles.flex}>
            <Text>Failed to load account data.</Text>
          </Flex>
        ) : (
          <>
            <Flex direction='column' align='center'>
              <Anchor href={'/user/' + user?.user_id}>
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
            <Flex justify='space-between' align='center' onClick={() => toggleForm('profilePicture')} style={{ cursor: 'pointer' }}>
              <Text>Change Profile Picture</Text>
              <Button size='compact-md'>
                <IconEdit size={14} />
              </Button>
            </Flex>
            <Transition mounted={openForm === 'profilePicture'} transition='slide-down' duration={300}>
              {styles => (
                <Box style={styles}>
                  <Stack>
                    <FileInput label='Upload new profile picture' placeholder='Choose file' accept='image/*' onChange={handleProfilePictureChange} />
                    {previewProfilePicture && <Image src={previewProfilePicture} alt='Profile Picture Preview' />}
                    <Button size='compact-md' onClick={handleUpdateProfilePicture}>
                      Submit
                    </Button>
                  </Stack>
                </Box>
              )}
            </Transition>
            <Flex justify='space-between' align='center' onClick={() => toggleForm('username')} style={{ cursor: 'pointer' }}>
              <Text>Change Username</Text>
              <Button size='compact-md'>
                <IconEdit size={14} />
              </Button>
            </Flex>
            <Transition mounted={openForm === 'username'} transition='slide-down' duration={300}>
              {styles => (
                <Box style={styles}>
                  <Stack>
                    <TextInput placeholder='New username' value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                    <Button size='compact-md' onClick={handleUpdateUsername}>
                      Submit
                    </Button>
                  </Stack>
                </Box>
              )}
            </Transition>
            <Flex justify='space-between' align='center' onClick={() => toggleForm('password')} style={{ cursor: 'pointer' }}>
              <Text>Change Password</Text>
              <Button size='compact-md'>
                <IconEdit size={14} />
              </Button>
            </Flex>
            <Transition mounted={openForm === 'password'} transition='slide-down' duration={300}>
              {styles => (
                <Box style={styles}>
                  <Stack>
                    <PasswordInput placeholder='Current password' value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                    <PasswordInput placeholder='New password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <Button size='compact-md' onClick={handleUpdatePassword}>
                      Submit
                    </Button>
                  </Stack>
                </Box>
              )}
            </Transition>
            <Flex justify='space-between' align='center' onClick={handleDeleteAccount} style={{ cursor: 'pointer' }}>
              <Text>Delete Account</Text>
              <Button color='red' size='compact-md'>
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
              <IconLogout size={14} style={{ marginRight: '8px' }} />
              Logout
            </Button>
          </>
        )}
        <ToastContainer position='bottom-center' />
      </Stack>
    </Card>
  );
}
