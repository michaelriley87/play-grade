import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Filters from './filters';
import { renderWithMantine } from '@/test/render';
import type { Filters as FilterValues } from '@/types/interfaces';

const currentFilters: FilterValues = {
  categories: ['🎮 Games', '🎥 Film/TV', '🎵 Music'],
  users: 'All Users',
  ageRange: 'All',
  sortBy: 'Newest',
  searchQuery: ''
};

describe('Filters', () => {
  it('submits the edited search query and closes the panel', () => {
    const onUpdateFilters = vi.fn();
    const onClose = vi.fn();
    renderWithMantine(<Filters currentFilters={currentFilters} onUpdateFilters={onUpdateFilters} onClose={onClose} />);

    fireEvent.change(screen.getByLabelText('Search'), { target: { value: 'zelda' } });
    fireEvent.click(screen.getByRole('button', { name: 'Update Results' }));

    expect(onUpdateFilters).toHaveBeenCalledWith({ ...currentFilters, searchQuery: 'zelda' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('disables followed-user filtering for guests', () => {
    renderWithMantine(<Filters currentFilters={currentFilters} onUpdateFilters={vi.fn()} onClose={vi.fn()} />);

    expect(screen.getByRole('radio', { name: 'Followed Users' })).toBeDisabled();
  });
});
