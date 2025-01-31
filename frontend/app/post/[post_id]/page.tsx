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
import { API_URL } from '@/config';

export default function PostPage() {
  const post_id = Number(useParams().post_id);
  const { token, user } = useAuth();
  const [post, setPost] = useState<PostData | null>(null);
  const [replies, setReplies] = useState<ReplyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndReplies = async () => {
      const queryParams = user?.user_id ? '?userId=' + user.user_id : '';
      const response = await fetch(API_URL + '/posts/' + post_id + queryParams, {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setPost(data.post);
        setReplies(data.replies);
      }
      setLoading(false);
    };

    if (!token || (token && user?.user_id !== undefined)) {
      fetchPostAndReplies();
    }
  }, [post_id, token, user?.user_id]);

  if (loading) {
    return (
      <Container style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
        <Stack align='center' style={{ width: '750px', marginBottom: '20px' }}>
          <Header />
          <BackButton />
          <Loader size='lg' />
        </Stack>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
        <Stack align='center' style={{ width: '750px', marginBottom: '20px' }}>
          <Header />
          <BackButton />
          <Text>Post not found.</Text>
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
