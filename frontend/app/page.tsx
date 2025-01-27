'use client';

import { Container, Stack } from '@mantine/core';
import { useState } from 'react';
import PostFeed from '@/components/post-feed';
import Header from '@/components/header';
import ControlPanel from '@/components/control-panel';

export default function HomePage() {
  const [filters, setFilters] = useState({
    categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
    users: 'All Users',
    ageRange: 'All',
    sortBy: 'Newest',
    searchQuery: ''
  });

  const handleUpdateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <Container style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
      <Stack align='center' style={{ width: '750px' }}>
        <Header />
        <ControlPanel filters={filters} onUpdateFilters={handleUpdateFilters} />
        <PostFeed filters={filters} />
      </Stack>
    </Container>
  );
}
