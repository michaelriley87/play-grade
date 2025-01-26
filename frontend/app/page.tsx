'use client';

import { Button, Transition, Paper, Container, Stack, Box } from '@mantine/core';
import { useState } from 'react';
import Account from '@/components/account';
import CreatePost from '@/components/create-post';
import Feed from '@/components/feed';
import Filters from '@/components/filters';
import Header from '@/components/header';
import LoginRegister from '@/components/login-register';
import { useAuth } from '@/context/auth-context';

export default function HomePage() {
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
    users: 'All Users',
    ageRange: 'All',
    sortBy: 'Newest',
    searchQuery: ''
  });

  const [activeComponent, setActiveComponent] = useState<string>('');

  const handleUpdateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const toggleComponent = (component: string) => {
    setActiveComponent(prev => (prev === component ? '' : component));
  };

  const isActive = (component: string) => activeComponent === component;

  return (
    <Container style={{ width: '100vw', display: 'flex', justifyContent: 'center' }}>
      <Stack align='center' style={{ width: '750px' }}>
        <Header />
        {/* Buttons for toggling components */}
        <Button.Group>
          <Button onClick={() => toggleComponent('createPost')} variant={isActive('createPost') ? 'outline' : 'filled'}>
            Create Post
          </Button>
          <Button onClick={() => toggleComponent('filters')} variant={isActive('filters') ? 'outline' : 'filled'}>
            Filters
          </Button>
          <Button onClick={() => toggleComponent('account')} variant={isActive('account') ? 'outline' : 'filled'}>
            {user ? 'Account' : 'Login'}
          </Button>
        </Button.Group>

        {/* Transition containers */}
        <Box style={{ overflow: 'hidden', width: '100%' }}>
          {/* Create Post */}
          <Transition
            mounted={activeComponent === 'createPost'}
            transition='slide-down'
            duration={300}
            timingFunction='ease-in-out'
          >
            {styles => (
              <Paper style={styles} shadow='md'>
                <CreatePost onClose={() => toggleComponent('')} />
              </Paper>
            )}
          </Transition>

          {/* Filters */}
          <Transition
            mounted={activeComponent === 'filters'}
            transition='slide-down'
            duration={300}
            timingFunction='ease-in-out'
          >
            {styles => (
              <Paper style={styles} shadow='md'>
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
            transition='slide-down'
            duration={300}
            timingFunction='ease-in-out'
          >
            {styles => (
              <Paper style={styles} shadow='md'>
                {user ? <Account /> : <LoginRegister />}
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
