'use client';

import styles from '@/styles/pages.module.css';
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

  // call to fetch post and reply data for post page
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
    // called if logged out or logged in and user_id is defined
    if (!token || (token && user?.user_id !== undefined)) {
      fetchPostAndReplies();
    }
  }, [post_id, token, user?.user_id]);

  return (
    <Container className={styles.page}>
      <Stack className={styles.pageContent}>
        <Header />
        <BackButton />
        {loading ? (
          <Loader size='lg' className={styles.loader} />
        ) : post ? (
          <>
            <Post {...post} />
            <ReplyFeed replies={replies} />
            <CreateReply postId={post_id} />
          </>
        ) : (
          <Text>Post not found.</Text>
        )}
      </Stack>
    </Container>
  );
}
