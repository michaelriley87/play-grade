'use client';

import { useState } from 'react';
import { Chip, TextInput, Button, Transition } from '@mantine/core';

export default function Filters() {
  const categoryOptions = ['🎮 Games', '🎥 Film/TV', '🎵 Music'];
  const viewOptions = ['All Users', 'Followed Users'];
  const ageOptions = ['Today', 'Week', 'Month', 'Year', 'All'];
  const sortOptions = ['Newest', 'Most Liked', 'Most Comments'];

  const [selectedFilters, setSelectedFilters] = useState<string[]>(categoryOptions);
  const [view, setView] = useState(viewOptions[0]);
  const [ageRange, setAgeRange] = useState(ageOptions[4]);
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  const handleFilterChange = (values: string[]) => {
    if (values.length === 0) {
      setSelectedFilters(categoryOptions.filter((option) => !selectedFilters.includes(option)));
    } else {
      setSelectedFilters(values);
    }

    if (values.length > 0) {
      setShowAdditionalOptions(true);
    }
  };

  const handleUpdateResults = () => {
    setShowAdditionalOptions(false);
  };

  return (
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

      {/* Transition Container */}
      <div style={{ overflow: 'hidden' }}>
        <Transition
          mounted={showAdditionalOptions}
          transition="slide-down"
          duration={300}
          timingFunction="ease-in-out"
        >
          {(styles) => (
            <div style={{ ...styles, paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* View Options */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                <Chip.Group multiple={false} value={view} onChange={setView}>
                  {viewOptions.map((option) => (
                    <Chip key={option} value={option}>
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
                placeholder="Search by query..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />

              {/* Update Results Button */}
              <Button fullWidth onClick={handleUpdateResults}>
                Update Results
              </Button>
            </div>
          )}
        </Transition>
      </div>
    </div>
  );
}
