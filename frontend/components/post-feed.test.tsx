import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PostFeed from './post-feed';
import { renderWithMantine } from '@/test/render';
import type { Filters } from '@/types/interfaces';

const authMocks = vi.hoisted(() => ({ token: 'test-token' }));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: { user_id: 1, is_admin: false }, token: authMocks.token, setToken: vi.fn() })
}));

vi.mock('./post', () => ({
  default: ({ title }: { title: string }) => <article>{title}</article>
}));

const filters: Filters = {
  categories: ['🎮 Games', '🎵 Music'],
  users: 'Followed Users',
  ageRange: 'Week',
  sortBy: 'Most Liked',
  searchQuery: 'zelda'
};

describe('PostFeed', () => {
  it('shows an empty state when no posts are returned', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: [], totalPages: 0 }) }));

    renderWithMantine(<PostFeed filters={filters} />);

    expect(await screen.findByText('No Posts found.')).toBeInTheDocument();
  });

  it('sends filters and authentication and renders returned posts', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        posts: [
          {
            post_id: 7,
            poster_id: 1,
            title: 'Zelda review',
            body: 'Body',
            category: 'G',
            image_url: '/uploads/test.png',
            like_count: 2,
            reply_count: 1,
            created_at: '2026-01-01T00:00:00Z',
            username: 'alice',
            liked: false
          }
        ],
        totalPages: 1
      })
    });
    vi.stubGlobal('fetch', fetchMock);

    renderWithMantine(<PostFeed filters={filters} />);

    expect(await screen.findByText('Zelda review')).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [requestUrl, options] = fetchMock.mock.calls[0];
    const url = new URL(requestUrl);
    expect(url.searchParams.get('categories')).toBe('🎮 Games,🎵 Music');
    expect(url.searchParams.get('users')).toBe('Followed Users');
    expect(url.searchParams.get('ageRange')).toBe('Week');
    expect(url.searchParams.get('sortBy')).toBe('Most Liked');
    expect(url.searchParams.get('searchQuery')).toBe('zelda');
    expect(options.headers).toEqual({ Authorization: 'Bearer test-token' });
  });

  it('requests posts for a profile without homepage filters', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ posts: [], totalPages: 0 }) });
    vi.stubGlobal('fetch', fetchMock);

    renderWithMantine(<PostFeed posterId={12} />);

    await screen.findByText('No Posts found.');
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('posterId')).toBe('12');
    expect(url.searchParams.has('categories')).toBe(false);
  });
});
