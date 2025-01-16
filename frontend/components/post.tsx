'use client';

import { useState } from 'react';
import { Card, Text, Group, Avatar, ActionIcon } from '@mantine/core';
import { IconHeart, IconMessageCircle } from '@tabler/icons-react';

type PostProps = {
  username: string;
  profileImage: string;
  title: string;
  content: string;
  postImage?: string;
  likes: number;
  comments: number;
};

export default function Post({ username, profileImage, title, content, likes = 0, comments = 0, postImage }: PostProps) {
  const [likeCount, setLikeCount] = useState(likes);
  const [isLiked, setIsLiked] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <Card>
      {/* Header */}
      <Group>
        <Avatar src={profileImage} radius="xl" />
        <Text fw={500}>{username}</Text>
      </Group>

      {/* Title */}
      <Text fw={700} style={{ marginTop: '10px' }}>
        {title}
      </Text>

      {/* Content */}
      <Text style={{ marginTop: '10px' }}>{content}</Text>

      {/* Image */}
      {postImage && <img src={postImage} alt="Post" style={{ marginTop: '10px', maxWidth: '100%' }} />}

      {/* Footer: Actions */}
      <Group justify="space-between" style={{ marginTop: '10px' }}>
        <Group>
          <ActionIcon
            variant={isLiked ? 'filled' : 'light'}
            color="red"
            onClick={toggleLike}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <IconHeart size={20} />
          </ActionIcon>
          <Text>{likeCount}</Text>
        </Group>
        <Group>
          <ActionIcon variant="light" title="Comment">
            <IconMessageCircle size={20} />
          </ActionIcon>
          <Text>{comments}</Text>
        </Group>
      </Group>
    </Card>
  );
}
