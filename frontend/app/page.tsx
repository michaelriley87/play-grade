'use client';

import { useState, useEffect } from 'react';
import { Container, Stack } from '@mantine/core';
import PostFeed from '@/components/post-feed';
import Header from '@/components/header';
import ControlPanel from '@/components/control-panel';
import { Filters } from '@/types/interfaces';

export default function HomePage() {
  const defaultFilters: Filters = {
    categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
    users: 'All Users',
    ageRange: 'All',
    sortBy: 'Newest',
    searchQuery: ''
  };

  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== 'undefined') {
      const storedFilters = localStorage.getItem('filters');
      return storedFilters ? JSON.parse(storedFilters) : defaultFilters;
    }
    return defaultFilters;
  });

  useEffect(() => {
    localStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);

  const handleUpdateFilters = (newFilters: Filters) => {
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
