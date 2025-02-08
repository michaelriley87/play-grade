'use client';

import styles from '@/styles/components.module.css';
import { Stack, Pagination, Container, Loader, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { PostData, FeedProps } from '@/types/interfaces';
import Post from './post';
import { API_URL } from '@/config';

export default function Feed({ filters, posterId }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
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
      const response = await fetch(API_URL + '/posts?' + queryParams.toString(), {
        headers: token ? { Authorization: `Bearer ` + token } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts);
        setTotalPages(data.totalPages);
      }
      setLoading(false);
    };
    fetchPosts();
  }, [filters, posterId, token, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, posterId]);

  if (loading) {
    return (
      <Container
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Loader size='lg' className={styles.loader} />
      </Container>
    );
  }

  if (posts.length === 0) {
    return (
      <Container size='sm' style={{ paddingTop: '20px' }}>
        <Stack align='center'>
          <Text>No Posts found.</Text>
        </Stack>
      </Container>
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
