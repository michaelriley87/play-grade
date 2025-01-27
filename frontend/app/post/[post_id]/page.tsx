'use client';

import { Container, Stack, Text, Loader } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import BackButton from '@/components/back-button';
import Header from '@/components/header';
import Post from '@/components/post';
import ReplyFeed from '@/components/reply-feed';
import CreateReply from '@/components/create-reply';
import { useAuth } from '@/context/auth-context';
import { PostData, ReplyData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

export default function PostPage() {
  const post_id = Number(useParams().post_id);
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
      <Container
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
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
      <Stack align='center' style={{ width: '750px', marginBottom: '20px' }}>
        <Header />
        <BackButton />
        <Post {...post} />
        <ReplyFeed replies={replies} />
        <CreateReply postId={post_id} />
      </Stack>
    </Container>
  );
}
