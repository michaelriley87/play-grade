'use client';

import Header from '@/components/header';
import Filters from '@/components/filters';
import Feed from '@/components/feed';
import { useState } from 'react';

export default function HomePage() {
  const [filters, setFilters] = useState({
    categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
    users: 'All Users',
    ageRange: 'All',
    sortBy: 'Newest',
    searchQuery: '',
  });

  const handleUpdateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div style={{ width: '550px', margin: '0 auto' }}>
        <Header />
        <Filters onUpdateFilters={handleUpdateFilters} />
        <Feed filters={filters} />
      </div>
    </div>
  );
}
