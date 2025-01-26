'use client';

import { Card, Stack, Pagination } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { PostData, FeedProps } from '@/types/interfaces';
import Post from './post';

const API_URL = 'http://127.0.0.1:5000';

export default function Feed({ filters = {} }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const response = await fetch(
        API_URL +
          '/posts?categories=' +
          (filters.categories?.join(',') || '') +
          '&users=' +
          (filters.users || '') +
          '&ageRange=' +
          (filters.ageRange || '') +
          '&sortBy=' +
          (filters.sortBy || '') +
          '&searchQuery=' +
          (filters.searchQuery || '') +
          '&posterId=' +
          (filters.posterId?.toString() || '') +
          '&page=' +
          currentPage +
          '&limit=5',
        {
          headers: token ? { Authorization: `Bearer ` + token } : {}
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, [filters, token, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        Loading...
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card shadow='sm' padding='lg' radius='md' withBorder>
        No Posts found.
      </Card>
    );
  }

  return (
    <Stack align='center' justify='center' style={{ width: '100%' }}>
      {posts.map(post => (
        <Post key={post.post_id} {...post} />
      ))}
      <Pagination total={totalPages} value={currentPage} onChange={setCurrentPage} style={{ margin: '20px' }} />
    </Stack>
  );
}
