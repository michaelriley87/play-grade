'use client';

import { useState } from 'react';
import { TextInput, Textarea, Button, FileInput, Image, Chip } from '@mantine/core';
import imageCompression from 'browser-image-compression';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = 'http://127.0.0.1:5000';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const categoryOptions = ['Games', 'Film/TV', 'Music'];

  const handleImageChange = async (file: File | null) => {
    if (!file) {
      setImage(null);
      setImagePreview(null);
      return;
    }

    const MAX_FILE_SIZE_MB = 1;

    if (file.size / 1024 / 1024 > MAX_FILE_SIZE_MB) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
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
    if (!title || !category || !body) {
      toast.error('Title, category, and body are required');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You must be logged in to create a post');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category!);
      formData.append('body', body);
      if (image) {
        formData.append('image', image);
      }

      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Post created successfully!');
        setTitle('');
        setCategory(null);
        setBody('');
        setImage(null);
        setImagePreview(null);
      } else if (response.status === 401) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(data.error || 'An error occurred');
      }
    } catch (err) {
      toast.error('Failed to create post');
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <ToastContainer position="bottom-center" />
      <TextInput
        label="Title"
        placeholder="Enter title (max 100 characters)"
        maxLength={100}
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div style={{ marginTop: '10px' }}>
        <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px', display: 'block' }}>
          Select Category
        </label>
        <Chip.Group
          multiple={false}
          value={category}
          onChange={(value: string) => setCategory(value)}
        >
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {categoryOptions.map((option) => (
              <Chip key={option} value={option}>
                {option}
              </Chip>
            ))}
          </div>
        </Chip.Group>
      </div>

      <Textarea
        label="Body"
        placeholder="Enter body content (max 300 characters)"
        maxLength={300}
        required
        style={{ marginTop: '10px' }}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />

      <FileInput
        label="Upload an image (optional)"
        placeholder="Choose file"
        accept="image/*"
        style={{ marginTop: '10px' }}
        onChange={handleImageChange}
      />

      {imagePreview && (
        <Image
          src={imagePreview}
          alt="Image Preview"
          style={{ marginTop: '10px', maxWidth: '100%', borderRadius: '8px' }}
        />
      )}

      <Button onClick={handleSubmit} style={{ marginTop: '15px' }}>
        Create Post
      </Button>
    </div>
  );
}
