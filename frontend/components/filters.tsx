import { useState, useEffect } from 'react';
import {
  Card,
  Chip,
  TextInput,
  Button,
  Stack,
  Title,
  Group,
} from '@mantine/core';
import { useAuth } from '@/context/AuthContext';

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

export default function Filters({
  currentFilters,
  onUpdateFilters,
  onClose,
}: FiltersProps) {
  const categoryOptions = ['🎮 Games', '🎥 Film/TV', '🎵 Music'];
  const userOptions = ['All Users', 'Followed Users'];
  const ageOptions = ['Today', 'Week', 'Month', 'Year', 'All'];
  const sortOptions = ['Newest', 'Most Liked', 'Most Comments'];

  const { user } = useAuth();

  const [selectedFilters, setSelectedFilters] = useState<string[]>(
    currentFilters.categories
  );
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
    if (values.length === 0) {
      const remainingCategories = categoryOptions.filter(
        (option) => !selectedFilters.includes(option)
      );
      setSelectedFilters(remainingCategories);
    } else {
      setSelectedFilters(values);
    }
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
    <Card withBorder style={{ width: '100%' }}>
      <Stack>
        {/* Category Filters */}
        <Group justify="center">
          <Chip.Group
            multiple
            value={selectedFilters}
            onChange={handleFilterChange}
          >
            {categoryOptions.map((option) => (
              <Chip key={option} value={option}>
                {option}
              </Chip>
            ))}
          </Chip.Group>
        </Group>

        {/* User Options */}
        <Group justify="center">
          <Chip.Group multiple={false} value={users} onChange={setUsers}>
            {userOptions.map((option) => (
              <Chip
                key={option}
                value={option}
                disabled={option === 'Followed Users' && !user}
              >
                {option}
              </Chip>
            ))}
          </Chip.Group>
        </Group>

        {/* Age Range */}
        <Group justify="center">
          <Chip.Group multiple={false} value={ageRange} onChange={setAgeRange}>
            {ageOptions.map((option) => (
              <Chip key={option} value={option}>
                {option}
              </Chip>
            ))}
          </Chip.Group>
        </Group>

        {/* Sort By */}
        <Group justify="center">
          <Chip.Group multiple={false} value={sortBy} onChange={setSortBy}>
            {sortOptions.map((option) => (
              <Chip key={option} value={option}>
                {option}
              </Chip>
            ))}
          </Chip.Group>
        </Group>

        {/* Search Textbox */}
        <TextInput
          label="Search"
          placeholder="Search by query..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
        />

        {/* Update Results Button */}
        <Button fullWidth onClick={handleUpdateResults}>
          Update Results
        </Button>
      </Stack>
    </Card>
  );
}
