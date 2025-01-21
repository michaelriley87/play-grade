'use client';

import Header from '@/components/header';
import Filters from '@/components/filters';
import Feed from '@/components/feed';
import CreatePost from '@/components/create-post';
import LoginRegister from '@/components/login-register';
import Account from '@/components/account';
import { useState, useEffect } from 'react';
import { Button, Transition } from '@mantine/core';

export default function HomePage() {
  const [filters, setFilters] = useState({
    categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
    users: 'All Users',
    ageRange: 'All',
    sortBy: 'Newest',
    searchQuery: '',
  });

  const [activeComponent, setActiveComponent] = useState<string>(''); // Use empty string
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setHasToken(!!token); // Update token presence
  }, []);

  const handleUpdateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const toggleComponent = (component: string) => {
    setActiveComponent((prev) => (prev === component ? '' : component)); // Empty string instead of null
  };

  const isActive = (component: string) => activeComponent === component;

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <div style={{ width: '550px', margin: '0 auto' }}>
        <Header />

        {/* Buttons for toggling components */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px',
          }}
        >
          <Button
            onClick={() => toggleComponent('createPost')}
            variant={isActive('createPost') ? 'outline' : 'filled'}
            style={{
              borderRadius: '20px',
              padding: '5px 15px',
              fontSize: '14px',
            }}
          >
            Create Post
          </Button>
          <Button
            onClick={() => toggleComponent('filters')}
            variant={isActive('filters') ? 'outline' : 'filled'}
            style={{
              borderRadius: '20px',
              padding: '5px 15px',
              fontSize: '14px',
            }}
          >
            Filters
          </Button>
          <Button
            onClick={() => toggleComponent('account')}
            variant={isActive('account') ? 'outline' : 'filled'}
            style={{
              borderRadius: '20px',
              padding: '5px 15px',
              fontSize: '14px',
            }}
          >
            Account
          </Button>
        </div>

        {/* Transition containers */}
        <div style={{ overflow: 'hidden' }}>
          {/* Create Post */}
          <Transition
            mounted={activeComponent === 'createPost'}
            transition="slide-down"
            duration={300}
            timingFunction="ease-in-out"
          >
            {(styles) => (
              <div style={{ ...styles }}>
                <CreatePost onClose={() => toggleComponent('')} />
              </div>
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
              <div style={{ ...styles }}>
                <Filters
                  currentFilters={filters}
                  onUpdateFilters={handleUpdateFilters}
                  onClose={() => toggleComponent('')}
                />
              </div>
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
              <div style={{ ...styles }}>
                {hasToken ? (
                  <Account onClose={() => toggleComponent('')} />
                ) : (
                  <LoginRegister onClose={() => toggleComponent('')} />
                )}
              </div>
            )}
          </Transition>
        </div>

        {/* Feed */}
        <Feed filters={filters} />
      </div>
    </div>
  );
}
