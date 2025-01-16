'use client';

import { useState, useEffect } from 'react';
import Post from './post';
import { Pagination } from '@mantine/core';

type PostData = {
  id: number;
  username: string;
  profileImage: string;
  title: string;
  content: string;
  postImage?: string;
  likes: number;
  comments: number;
};

export default function Feed() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      const response = await fetch(`/api/posts?page=${currentPage}&limit=${postsPerPage}`);
      const data = await response.json();
      setPosts(data.posts);
    };

    fetchPosts();
  }, [currentPage]);

  return (
    <div>
      {posts.map((post) => (
        <Post
          key={post.id}
          username={post.username}
          profileImage={post.profileImage}
          title={post.title}
          content={post.content}
          postImage={post.postImage}
          likes={post.likes}
          comments={post.comments}
        />
      ))}

      {/* Pagination */}
      <Pagination
        total={10} // Total number of pages
        value={currentPage}
        onChange={setCurrentPage}
        style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}
      />
    </div>
  );
}
