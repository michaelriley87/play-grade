'use client';

import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Post from './post';

const API_URL = 'http://127.0.0.1:5000';

interface FeedProps {
  filters: {
    categories: string[];
    users: string;
    ageRange: string;
    sortBy: string;
    searchQuery: string;
  };
}

interface PostData {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  likes: number;
}

export default function Feed({ filters }: FeedProps) {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        console.log('Query Parameters:', queryParams.toString());

        const response = await fetch(`${API_URL}/posts?${queryParams.toString()}`);
        const data = await response.json();

        if (response.ok) {
          setPosts(data);
        } else {
          toast.error(data.error || 'Failed to retrieve posts');
        }
      } catch {
        toast.error('An error occurred while fetching posts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [filters]);

  if (isLoading) return <div>Loading...</div>;
  if (!isLoading && posts.length === 0) return <div>No posts found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <ToastContainer position="bottom-center" />
      {posts.map((post) => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  );
}
