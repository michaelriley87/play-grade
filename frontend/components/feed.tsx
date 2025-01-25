'use client';

import { useEffect, useState } from 'react';
import { Stack, Pagination } from '@mantine/core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Post from './post';
import { useAuth } from '@/context/AuthContext';
import { PostData, FeedProps } from '@/types/interfaces';

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

      try {
        const queryParams = new URLSearchParams({
          categories: filters.categories?.join(',') || '',
          users: filters.users || '',
          ageRange: filters.ageRange || '',
          sortBy: filters.sortBy || '',
          searchQuery: filters.searchQuery || '',
          posterId: filters.posterId || '',
          page: currentPage.toString(),
          limit: '5',
        });

        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const response = await fetch(
          `${API_URL}/posts?${queryParams.toString()}`,
          { headers }
        );

        const data = await response.json();

        if (response.ok) {
          setPosts(data.posts);
          setTotalPages(data.totalPages);
        } else {
          toast.error(data.error || 'Failed to retrieve posts');
        }
      } catch (error) {
        toast.error('An error occurred while fetching posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [filters, token, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  if (isLoading) return <div>Loading...</div>;
  if (posts.length === 0) return <div>No posts found.</div>;

  return (
    <Stack align="center" justify="center">
      <ToastContainer position="bottom-center" />
      {posts.map((post) => (
        <Post key={post.post_id} {...post} />
      ))}
      <Pagination
        total={totalPages}
        value={currentPage}
        onChange={setCurrentPage}
        withControls
        withEdges
      />
    </Stack>
  );
}
