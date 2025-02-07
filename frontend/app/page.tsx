'use client';

import styles from '@/styles/pages.module.css';
import { useState, useEffect } from 'react';
import { Container, Stack } from '@mantine/core';
import PostFeed from '@/components/post-feed';
import Header from '@/components/header';
import ControlPanel from '@/components/control-panel';
import { Filters } from '@/types/interfaces';

export default function HomePage() {
  // manage homepage feed filter state
  const defaultFilters: Filters = {
    categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
    users: 'All Users',
    ageRange: 'All',
    sortBy: 'Newest',
    searchQuery: ''
  };

  // restore previous filter state from local storage if available
  const [filters, setFilters] = useState<Filters>(() => {
    if (typeof window !== 'undefined') {
      const storedFilters = localStorage.getItem('filters');
      return storedFilters ? JSON.parse(storedFilters) : defaultFilters;
    }
    return defaultFilters;
  });

  // store filter state in local storage if changed
  useEffect(() => {
    localStorage.setItem('filters', JSON.stringify(filters));
  }, [filters]);

  // update filter state if filters changed in filters.tsx
  const handleUpdateFilters = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  return (
    <Container className={styles.page}>
      <Stack className={styles.pageContent}>
        <Header />
        <ControlPanel filters={filters} onUpdateFilters={handleUpdateFilters} />
        <PostFeed filters={filters} />
      </Stack>
    </Container>
  );
}
