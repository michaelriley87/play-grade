import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import User from './user';
import { renderWithMantine } from '@/test/render';

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: { user_id: 1, is_admin: false }, token: 'test-token', setToken: vi.fn() })
}));

describe('User', () => {
  it('follows and unfollows another user', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    renderWithMantine(<User userData={{ user_id: 2, username: 'bob', is_following: false }} />);

    fireEvent.click(screen.getByRole('button', { name: 'Follow' }));
    await screen.findByRole('button', { name: 'Unfollow' });
    expect(fetchMock).toHaveBeenLastCalledWith('http://api.test/follows', expect.objectContaining({ method: 'POST', body: JSON.stringify({ followee_id: 2 }) }));

    fireEvent.click(screen.getByRole('button', { name: 'Unfollow' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Follow' })).toBeInTheDocument());
    expect(fetchMock).toHaveBeenLastCalledWith('http://api.test/follows', expect.objectContaining({ method: 'DELETE', body: JSON.stringify({ followee_id: 2 }) }));
  });

  it('does not show a follow button on the current user profile', () => {
    renderWithMantine(<User userData={{ user_id: 1, username: 'alice', is_following: false }} />);

    expect(screen.queryByRole('button', { name: 'Follow' })).not.toBeInTheDocument();
  });
});
