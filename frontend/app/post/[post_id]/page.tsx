'use client';

import Header from '@/components/header';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Stack, Loader } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import Post from '@/components/post';
import Reply from '@/components/reply';
import { useAuth } from '@/context/AuthContext';

const API_URL = 'http://127.0.0.1:5000';

interface PostData {
  post_id: number;
  poster_id: number;
  title: string;
  body: string;
  category: string;
  image_url?: string;
  like_count: number;
  reply_count: number;
  created_at: string;
  username: string;
  profile_picture?: string;
}

interface ReplyData {
  reply_id: number;
  post_id: number;
  replier_id: number;
  body: string;
  image_url?: string;
  like_count: number;
  created_at: string;
  username: string;
  profile_picture?: string;
}

export default function PostPage() {
  const { post_id } = useParams<{ post_id: string }>();
  const router = useRouter();
  const { user, token } = useAuth();
  const [post, setPost] = useState<PostData | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndReplies = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${post_id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error('Post not found');
        }
        const data = await res.json();
        setPost(data.post);
        setReplies(data.replies);
      } catch (error) {
        console.error('Error fetching post and replies:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [post_id, router, token]);

  if (loading) {
    return (
      <Container size="sm" className="full-height">
        <Loader size="lg" />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container size="sm" style={{ paddingTop: '20px' }}>
        <Header />
        <Stack align="center" style={{ marginBottom: '1rem' }}>
          <Button
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => router.push('/')}
          >
            Home
          </Button>
        </Stack>
        <Stack align="center">
          <p>Post not found.</p>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="sm" style={{ paddingTop: '20px' }}>
      <Header />
      <Stack align="center" style={{ marginBottom: '1rem' }}>
        <Button
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => router.push('/')}
        >
          Home
        </Button>
      </Stack>
      <Stack align="center">
        <Post {...post} />
        <Stack align="start" style={{ width: '100%', marginBottom: '1rem' }}>
          {replies.map((reply) => (
            <Reply key={reply.reply_id} {...reply} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
