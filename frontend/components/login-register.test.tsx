import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginRegister from './login-register';
import { renderWithMantine } from '@/test/render';

const authMocks = vi.hoisted(() => ({ setToken: vi.fn() }));
const toastMocks = vi.hoisted(() => ({ error: vi.fn(), success: vi.fn() }));

vi.mock('@/context/auth-context', () => ({
  useAuth: () => ({ user: null, token: null, setToken: authMocks.setToken })
}));

vi.mock('react-toastify', () => ({
  ToastContainer: () => null,
  toast: toastMocks
}));

describe('LoginRegister', () => {
  beforeEach(() => {
    authMocks.setToken.mockReset();
    toastMocks.error.mockReset();
    toastMocks.success.mockReset();
  });

  it('validates required login fields before calling the API', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderWithMantine(<LoginRegister />);

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(toastMocks.error).toHaveBeenCalledWith('All fields are required');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('logs in and stores the returned token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'signed-token' })
    });
    vi.stubGlobal('fetch', fetchMock);
    renderWithMantine(<LoginRegister />);

    const panel = screen.getByRole('tabpanel');
    fireEvent.change(within(panel).getByLabelText('Email'), { target: { value: 'alice@example.test' } });
    fireEvent.change(within(panel).getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.click(within(panel).getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(authMocks.setToken).toHaveBeenCalledWith('signed-token'));
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/users/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'alice@example.test', password: 'Password123!' })
      })
    );
    expect(toastMocks.success).toHaveBeenCalledWith('Login successful!');
  });

  it('registers a new account and returns to the login tab', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user_id: 1 }) });
    vi.stubGlobal('fetch', fetchMock);
    renderWithMantine(<LoginRegister />);

    fireEvent.click(screen.getByRole('tab', { name: 'Register' }));
    const panel = screen.getByRole('tabpanel');
    fireEvent.change(within(panel).getByLabelText('Username'), { target: { value: 'alice' } });
    fireEvent.change(within(panel).getByLabelText('Email'), { target: { value: 'alice@example.test' } });
    fireEvent.change(within(panel).getByLabelText('Password'), { target: { value: 'Password123!' } });
    fireEvent.click(within(panel).getByRole('button', { name: 'Register' }));

    await waitFor(() => expect(toastMocks.success).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/users/register',
      expect.objectContaining({
        body: JSON.stringify({ username: 'alice', email: 'alice@example.test', password: 'Password123!' })
      })
    );
    expect(screen.getByRole('tab', { name: 'Login' })).toHaveAttribute('aria-selected', 'true');
  });
});
