'use client';

import styles from '@/styles/components.module.css';
import { Card, Textarea, Button, FileInput, Image, Stack, Tooltip } from '@mantine/core';
import imageCompression from 'browser-image-compression';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '@/context/auth-context';
import 'react-toastify/dist/ReactToastify.css';
import { CreateReplyProps } from '@/types/interfaces';
import { API_URL } from '@/config';

export default function CreateReply({ postId }: CreateReplyProps) {
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const MAX_FILE_SIZE_MB = 1;

  const { token } = useAuth();

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
    if (!body) {
      toast.error('Reply body is required');
      return;
    }
    if (!token) {
      toast.error('You must be logged in to create a reply');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('post_id', postId.toString());
      formData.append('body', body);
      if (image) {
        formData.append('image_url', image);
      }
      const response = await fetch(API_URL + '/replies', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token
        },
        body: formData
      });
      if (response.ok) {
        toast.success('Reply created successfully!');
        setBody('');
        setImage(null);
        setImagePreview(null);
        window.location.reload();
      } else {
        const data = await response.json();
        toast.error(data.error || 'An error occurred');
      }
    } catch (err) {
      toast.error('Failed to create reply');
    }
  };

  return (
    <Card withBorder className={styles.card}>
      <Stack className={styles.stack}>
        <Textarea label='Reply' placeholder='Enter your reply (max 300 characters)' maxLength={300} value={body} onChange={e => setBody(e.target.value)} />
        <FileInput label='Upload an optional image' placeholder='Choose file' accept='image/*' onChange={handleImageChange} />
        {imagePreview && <Image src={imagePreview} alt='Image Preview' className={styles.image} />}
        <Tooltip label={!token ? 'Please log in to create a reply' : undefined} withArrow disabled={!!token}>
          <Button onClick={handleSubmit} fullWidth disabled={!token}>
            Create Reply
          </Button>
        </Tooltip>
      </Stack>
      <ToastContainer position='bottom-center' />
    </Card>
  );
}
