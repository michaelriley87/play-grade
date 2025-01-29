'use client';

import { Card, Stack, Pagination } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { PostData, FeedProps } from '@/types/interfaces';
import Post from './post';

const API_URL = 'http://127.0.0.1:5000';

export default function Feed({ filters, posterId }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);

      // Construct query parameters
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '5'
      });

      if (posterId) {
        queryParams.append('posterId', posterId.toString());
      } else if (filters) {
        queryParams.append('categories', filters.categories?.join(',') || '');
        queryParams.append('users', filters.users || '');
        queryParams.append('ageRange', filters.ageRange || '');
        queryParams.append('sortBy', filters.sortBy || '');
        queryParams.append('searchQuery', filters.searchQuery || '');
      }

      const response = await fetch(`${API_URL}/posts?${queryParams.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, [filters, posterId, token, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, posterId]);

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
