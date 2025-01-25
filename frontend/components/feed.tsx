'use client';

import { useEffect, useState } from 'react';
import { Stack } from '@mantine/core';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Post from './post';
import { useAuth } from '@/context/AuthContext';
import { FeedProps, PostData } from '@/types/interfaces';

const API_URL = 'http://127.0.0.1:5000';

export default function Feed({ filters }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);

      try {
        const queryParams = new URLSearchParams({
          categories: filters.categories.join(','),
          users: filters.users,
          ageRange: filters.ageRange,
          sortBy: filters.sortBy,
          searchQuery: filters.searchQuery,
        });

        const headers: HeadersInit = token
          ? { Authorization: `Bearer ${token}` }
          : {};

        const response = await fetch(
          `${API_URL}/posts?${queryParams.toString()}`,
          {
            headers,
          }
        );

        const data = await response.json();

        if (response.ok) {
          setPosts(data);
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
  }, [filters, token]);

  if (isLoading) return <div>Loading...</div>;
  if (posts.length === 0) return <div>No posts found.</div>;

  return (
    <Stack>
      <ToastContainer position="bottom-center" />
      {posts.map((post) => (
        <Post key={post.post_id} {...post} />
      ))}
    </Stack>
  );
}
