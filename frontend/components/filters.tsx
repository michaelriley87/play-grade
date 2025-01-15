'use client';

import { useState } from 'react';
import { Chip, Button } from '@mantine/core';

export default function Filters() {
  const categoryOptions = ['🎮 Games', '🎥 Film/TV', '🎵 Music'];
  const viewOptions = ['Public Posts', 'Followed Posts'];
  const ageOptions = ['Today', 'Week', 'Month', 'Year', 'All'];
  const sortOptions = ['Newest', 'Most Liked', 'Most Comments'];
  const [selectedFilters, setSelectedFilters] = useState(categoryOptions);
  const [view, setView] = useState(viewOptions[0]);
  const [ageRange, setAgeRange] = useState(ageOptions[4]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);

  const handleFilterChange = (values: string[]) => {
    if (values.length === 0) {
      setSelectedFilters(categoryOptions.filter((option) => !selectedFilters.includes(option)));
    } else {
      setSelectedFilters(values);
    }
  };

  return (
    <div>
      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
        <Chip.Group multiple value={selectedFilters} onChange={handleFilterChange}>
          {categoryOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>

      {/* View Options */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
        <Chip.Group multiple={false} value={view} onChange={setView}>
          {viewOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>

      {/* Age Range */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
        <Chip.Group multiple={false} value={ageRange} onChange={setAgeRange}>
          {ageOptions.map((option) => (
            <Chip key={option} value={option} checked={false}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>

      {/* Sort By */}
      <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
        <Chip.Group multiple={false} value={sortBy} onChange={setSortBy}>
          {sortOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>
    </div>
  );
}
