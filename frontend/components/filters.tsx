'use client';

import { useState, useEffect } from 'react';
import { Chip, TextInput, Button } from '@mantine/core';

interface FiltersProps {
  currentFilters: {
    categories: string[];
    users: string;
    ageRange: string;
    sortBy: string;
    searchQuery: string;
  };
  onUpdateFilters: (filters: FiltersProps['currentFilters']) => void;
  onClose: () => void;
}

export default function Filters({ currentFilters, onUpdateFilters, onClose }: FiltersProps) {
  const categoryOptions = ['🎮 Games', '🎥 Film/TV', '🎵 Music'];
  const viewOptions = ['All Users', 'Followed Users'];
  const ageOptions = ['Today', 'Week', 'Month', 'Year', 'All'];
  const sortOptions = ['Newest', 'Most Liked', 'Most Comments'];

  const [selectedFilters, setSelectedFilters] = useState<string[]>(currentFilters.categories);
  const [users, setUsers] = useState(currentFilters.users);
  const [ageRange, setAgeRange] = useState(currentFilters.ageRange);
  const [sortBy, setSortBy] = useState(currentFilters.sortBy);
  const [searchQuery, setSearchQuery] = useState(currentFilters.searchQuery);

  useEffect(() => {
    setSelectedFilters(currentFilters.categories);
    setUsers(currentFilters.users);
    setAgeRange(currentFilters.ageRange);
    setSortBy(currentFilters.sortBy);
    setSearchQuery(currentFilters.searchQuery);
  }, [currentFilters]);

  const handleFilterChange = (values: string[]) => {
    setSelectedFilters(values.length === 0 ? categoryOptions : values);
  };

  const handleUpdateResults = () => {
    onUpdateFilters({
      categories: selectedFilters,
      users,
      ageRange,
      sortBy,
      searchQuery,
    });
    onClose();
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '10px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Category Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Chip.Group multiple value={selectedFilters} onChange={handleFilterChange}>
            {categoryOptions.map((option) => (
              <Chip key={option} value={option}>
                {option}
              </Chip>
            ))}
          </Chip.Group>
        </div>

        <div style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {/* View Options */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Chip.Group multiple={false} value={users} onChange={setUsers}>
              {viewOptions.map((option) => (
                <Chip
                  key={option}
                  value={option}
                  disabled={option === 'Followed Users' && !localStorage.getItem('token')}
                >
                  {option}
                </Chip>
              ))}
            </Chip.Group>
          </div>

          {/* Age Range */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Chip.Group multiple={false} value={ageRange} onChange={setAgeRange}>
              {ageOptions.map((option) => (
                <Chip key={option} value={option}>
                  {option}
                </Chip>
              ))}
            </Chip.Group>
          </div>

          {/* Sort By */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
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
            label="Search"
            placeholder="Search by query..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
          />

          {/* Update Results Button */}
          <Button fullWidth onClick={handleUpdateResults} style={{ marginTop: '10px' }}>
            Update Results
          </Button>
        </div>
      </div>
    </div>
  );
}
