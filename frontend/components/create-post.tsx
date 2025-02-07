'use client';

import styles from '@/styles/components.module.css';
import { Card, TextInput, Textarea, Button, FileInput, Image, Chip, Stack, Group, Text, Tooltip } from '@mantine/core';
import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '@/context/auth-context';
import 'react-toastify/dist/ReactToastify.css';
import { CreatePostProps } from '@/types/interfaces';
import { API_URL } from '@/config';

export default function CreatePost({ onClose }: CreatePostProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { token } = useAuth();
  const router = useRouter();
  const categoryOptions = ['🎮 Games', '🎥 Film/TV', '🎵 Music'];
  const MAX_FILE_SIZE_MB = 1;

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setImage(null);
      setImagePreview(null);
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
        setImage(compressedFile);
        setImagePreview(URL.createObjectURL(compressedFile));
      } catch (err) {
        toast.error('Failed to compress image');
      }
    } else {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!title || !category || !body || !image) {
      toast.error('Title, category, body, and image are required');
      return;
    }
    if (!token) {
      toast.error('You must be logged in to create a post');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category!);
      formData.append('body', body);
      formData.append('image', image);
      const response = await fetch(API_URL + '/posts', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Post created successfully!');
        router.push('/post/' + data.post_id);
        setTitle('');
        setCategory(null);
        setBody('');
        setImage(null);
        setImagePreview(null);
        onClose();
      } else {
        toast.error(data.error || 'An error occurred');
      }
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  return (
    <Card withBorder className={styles.card}>
      <Stack className={styles.stack}>
        <TextInput label='Title' placeholder='Enter title (max 100 characters)' maxLength={100} value={title} onChange={e => setTitle(e.target.value)} />
        <Stack>
          <Text size='sm'>Select Category</Text>
          <Chip.Group multiple={false} value={category} onChange={(value: string) => setCategory(value)}>
            <Group justify='center'>
              {categoryOptions.map(option => (
                <Chip key={option} value={option}>
                  {option}
                </Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>
        <Textarea label='Body' placeholder='Enter body content (max 300 characters)' maxLength={300} value={body} onChange={e => setBody(e.target.value)} />
        <FileInput label='Upload an image' placeholder='Choose file' accept='image/*' onChange={handleImageChange} />
        {imagePreview && <Image src={imagePreview} alt='Image Preview' className={styles.image} />}
        <Tooltip label={!token ? 'Please log in to create a post' : undefined} withArrow disabled={!!token}>
          <Button onClick={handleSubmit} fullWidth disabled={!token}>
            Create Post
          </Button>
        </Tooltip>
      </Stack>
      <ToastContainer position='bottom-center' />
    </Card>
  );
}
