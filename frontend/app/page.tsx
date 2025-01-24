'use client';

import Header from '@/components/header';
import Filters from '@/components/filters';
import Feed from '@/components/feed';
import CreatePost from '@/components/create-post';
import LoginRegister from '@/components/login-register';
import Account from '@/components/account';
import { useState } from 'react';
import {
  Button,
  Transition,
  Paper,
  Container,
  Stack,
  Box,
} from '@mantine/core';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
    users: 'All Users',
    ageRange: 'All',
    sortBy: 'Newest',
    searchQuery: '',
  });

  const [activeComponent, setActiveComponent] = useState<string>('');

  const handleUpdateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const toggleComponent = (component: string) => {
    setActiveComponent((prev) => (prev === component ? '' : component));
  };

  const isActive = (component: string) => activeComponent === component;

  return (
    <Container size="sm" style={{ height: '100vh', paddingTop: '20px' }}>
      <Header />
      <Stack align="center">
        {/* Buttons for toggling components */}
        <Button.Group>
          <Button
            onClick={() => toggleComponent('createPost')}
            variant={isActive('createPost') ? 'outline' : 'filled'}
          >
            Create Post
          </Button>
          <Button
            onClick={() => toggleComponent('filters')}
            variant={isActive('filters') ? 'outline' : 'filled'}
          >
            Filters
          </Button>
          <Button
            onClick={() => toggleComponent('account')}
            variant={isActive('account') ? 'outline' : 'filled'}
          >
            {user ? 'Account' : 'Login'}
          </Button>
        </Button.Group>

        {/* Transition containers */}
        <Box style={{ overflow: 'hidden', width: '100%' }}>
          {/* Create Post */}
          <Transition
            mounted={activeComponent === 'createPost'}
            transition="slide-down"
            duration={300}
            timingFunction="ease-in-out"
          >
            {(styles) => (
              <Paper style={styles} shadow="md">
                <CreatePost onClose={() => toggleComponent('')} />
              </Paper>
            )}
          </Transition>

          {/* Filters */}
          <Transition
            mounted={activeComponent === 'filters'}
            transition="slide-down"
            duration={300}
            timingFunction="ease-in-out"
          >
            {(styles) => (
              <Paper style={styles} shadow="md">
                <Filters
                  currentFilters={filters}
                  onUpdateFilters={handleUpdateFilters}
                  onClose={() => toggleComponent('')}
                />
              </Paper>
            )}
          </Transition>

          {/* Account or Login/Register */}
          <Transition
            mounted={activeComponent === 'account'}
            transition="slide-down"
            duration={300}
            timingFunction="ease-in-out"
          >
            {(styles) => (
              <Paper style={styles} shadow="md">
                {user ? (
                  <Account onClose={() => toggleComponent('')} />
                ) : (
                  <LoginRegister onClose={() => toggleComponent('')} />
                )}
              </Paper>
            )}
          </Transition>
        </Box>

        {/* Feed */}
        <Feed filters={filters} />
      </Stack>
    </Container>
  );
}
