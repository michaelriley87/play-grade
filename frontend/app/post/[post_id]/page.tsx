'use client';

import Header from '@/components/header';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Stack, Loader } from '@mantine/core';
import Post from '@/components/post';
import Reply from '@/components/reply';
import BackButton from '@/components/back-button';
import { useAuth } from '@/context/auth-context';
import { PostData, ReplyData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

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
            Authorization: `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error('Post not found');
        }
        const data = await res.json();
        setPost(data.post);
        setReplies(data.replies);
      } catch (error) {
        console.error('Error fetching post and replies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndReplies();
  }, [post_id, router, token]);

  if (loading) {
    return (
      <Container size='sm' className='full-height'>
        <Loader size='lg' />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container size='sm' style={{ paddingTop: '20px' }}>
        <Header />
        <Stack align='center'>
          <p>Post not found.</p>
          <BackButton />
        </Stack>
      </Container>
    );
  }

  return (
    <Container style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
      <Stack align='center' style={{ width: '750px' }}>
        <Header />
        <BackButton />
        <Post {...post} />
        <Stack align='start' style={{ width: '100%', marginBottom: '1rem' }}>
          {replies.map(reply => (
            <Reply key={reply.reply_id} {...reply} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
