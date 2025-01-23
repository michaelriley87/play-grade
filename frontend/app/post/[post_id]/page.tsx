'use client';

import Header from '@/components/header';
import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Stack, Loader } from '@mantine/core';
import Post from '@/components/post';
import jwt from 'jsonwebtoken';

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

interface DecodedJWT {
  user_id: string;
  is_admin: boolean;
}

export default function PostPage() {
  const { post_id } = useParams<{ post_id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API_URL}/posts/${post_id}`);
        if (!res.ok) {
          throw new Error('Post not found');
        }
        const data: PostData = await res.json();
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPost();
  }, [post_id, router]);  

  const token = localStorage.getItem('token');
  const currentUser = useMemo(() => {
    if (!token) return null;
    try {
      return jwt.decode(token) as DecodedJWT | null;
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
    }
  }, [token]);

  if (loading) {
    return (
      <Container
        size="sm"
        className="full-height"
      >
        <Loader size="lg" />
      </Container>
    );
  }

  return (
    <Container size="sm" style={{ paddingTop: '20px' }}>
      <Header />
      <Stack align="center">
        {post && <Post {...post} currentUser={currentUser} />}
      </Stack>
    </Container>
  );
}
