'use client';

import { Box, Button, Transition, Paper } from '@mantine/core';
import { useState } from 'react';
import Account from '@/components/account';
import CreatePost from '@/components/create-post';
import Filters from '@/components/filters';
import LoginRegister from '@/components/login-register';
import { useAuth } from '@/context/auth-context';
import { ControlsPanelProps } from '@/types/interfaces';

export default function ControlsPanel({ filters, onUpdateFilters }: ControlsPanelProps) {
  const { user } = useAuth();
  const [activeComponent, setActiveComponent] = useState<string>('');

  const toggleComponent = (component: string) => {
    setActiveComponent(prev => (prev === component ? '' : component));
  };

  const isActive = (component: string) => activeComponent === component;

  return (
    <Box style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
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
        <Transition mounted={activeComponent === 'createPost'} transition='slide-down' duration={300} timingFunction='ease-in-out'>
          {styles => (
            <Paper style={styles} shadow='md'>
              <CreatePost onClose={() => toggleComponent('')} />
            </Paper>
          )}
        </Transition>

        {/* Filters */}
        <Transition mounted={activeComponent === 'filters'} transition='slide-down' duration={300} timingFunction='ease-in-out'>
          {styles => (
            <Paper style={styles} shadow='md'>
              <Filters currentFilters={filters} onUpdateFilters={onUpdateFilters} onClose={() => toggleComponent('')} />
            </Paper>
          )}
        </Transition>

        {/* Account or Login/Register */}
        <Transition mounted={activeComponent === 'account'} transition='slide-down' duration={300} timingFunction='ease-in-out'>
          {styles => (
            <Paper style={styles} shadow='md'>
              {user ? <Account onClose={() => toggleComponent('')} /> : <LoginRegister />}
            </Paper>
          )}
        </Transition>
      </Box>
    </Box>
  );
}
