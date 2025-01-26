'use client';

import { Container, Stack, Text, Loader } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackButton from '@/components/back-button';
import Header from '@/components/header';
import Post from '@/components/post';
import Reply from '@/components/reply';
import { useAuth } from '@/context/auth-context';
import { PostData, ReplyData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

export default function PostPage() {
  const { post_id } = useParams<{ post_id: string }>();
  const { token } = useAuth();
  const [post, setPost] = useState<PostData | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndReplies = async () => {
      const response = await fetch(API_URL + '/posts/' + post_id, {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
        setReplies(data.replies);
      }
      setLoading(false);
    };
    fetchPostAndReplies();
  }, [post_id, token]);

  if (loading) {
    return (
      <Container size='sm'>
        <Loader size='lg' />
      </Container>
    );
  }

  if (!post) {
    return (
      <Container size='sm' style={{ paddingTop: '20px' }}>
        <Header />
        <Stack align='center'>
          <Text>Post not found.</Text>
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
        <Stack align='start' style={{ width: '100%', marginBottom: '20px' }}>
          {replies.map(reply => (
            <Reply key={reply.reply_id} {...reply} />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
