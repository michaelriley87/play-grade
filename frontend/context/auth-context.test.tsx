import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuth } from './auth-context';
import { renderWithMantine } from '@/test/render';

function encodePart(value: object) {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

const token = `${encodePart({ alg: 'HS256', typ: 'JWT' })}.${encodePart({ user_id: 42, is_admin: true })}.signature`;

function AuthHarness() {
  const { user, token: currentToken, setToken } = useAuth();

  return (
    <>
      <span>{user ? `${user.user_id}:${user.is_admin}` : 'guest'}</span>
      <span>{currentToken || 'no-token'}</span>
      <button onClick={() => setToken(token)}>Log in</button>
      <button onClick={() => setToken(null)}>Log out</button>
    </>
  );
}

describe('AuthProvider', () => {
  it('decodes and persists a token', async () => {
    renderWithMantine(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('42:true')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('token')).toBe(token));
  });

  it('restores a stored token and clears it on logout', async () => {
    localStorage.setItem('token', token);

    renderWithMantine(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    expect(screen.getByText('42:true')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(await screen.findByText('guest')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('token')).toBeNull());
  });

  it('treats a malformed token as an unauthenticated session', () => {
    localStorage.setItem('token', 'not-a-jwt');

    renderWithMantine(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>
    );

    expect(screen.getByText('guest')).toBeInTheDocument();
  });
});
