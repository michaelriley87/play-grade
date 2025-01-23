'use client';

import Header from '@/components/header';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Stack, Loader } from '@mantine/core';
import Post from '@/components/post';

const API_URL = 'http://127.0.0.1:5000';

export default function PostPage() {
  const { post_id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${post_id}`);
        if (!res.ok) {
          throw new Error('Post not found');
        }
        const data = await res.json();
        setPost(data);
      } catch {
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [post_id, router]);

  if (loading) {
    return (
      <Container
        size="sm"
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Loader size="lg" />
      </Container>
    );
  }

  return (
    <Container size="sm" style={{ height: '100vh', paddingTop: '20px' }}>
      <Header />
      <Stack align="center">{post && <Post {...post} />}</Stack>
    </Container>
  );
}
