'use client';

import { useState } from 'react';
import { Chip, TextInput, Button } from '@mantine/core';

export default function Filters() {
  const categoryOptions = ['🎮 Games', '🎥 Film/TV', '🎵 Music'];
  const viewOptions = ['All Users', 'Followed Users'];
  const ageOptions = ['Today', 'Week', 'Month', 'Year', 'All'];
  const sortOptions = ['Newest', 'Most Liked', 'Most Comments'];
  const [selectedFilters, setSelectedFilters] = useState(categoryOptions);
  const [view, setView] = useState(viewOptions[0]);
  const [ageRange, setAgeRange] = useState(ageOptions[4]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleFilterChange = (values: string[]) => {
    if (values.length === 0) {
      setSelectedFilters(categoryOptions.filter((option) => !selectedFilters.includes(option)));
    } else {
      setSelectedFilters(values);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Category Filters */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Chip.Group multiple value={selectedFilters} onChange={handleFilterChange}>
          {categoryOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>

      {/* View Options */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Chip.Group multiple={false} value={view} onChange={setView}>
          {viewOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>

      {/* Age Range */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Chip.Group multiple={false} value={ageRange} onChange={setAgeRange}>
          {ageOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>

      {/* Sort By */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <Chip.Group multiple={false} value={sortBy} onChange={setSortBy}>
          {sortOptions.map((option) => (
            <Chip key={option} value={option}>
              {option}
            </Chip>
          ))}
        </Chip.Group>
      </div>

      {/* Search Textbox */}
      <TextInput
        placeholder="Search by query..."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.currentTarget.value)}
      />

      {/* Update Results Button */}
      <Button>
        Update Results
      </Button>
    </div>
  );
}
