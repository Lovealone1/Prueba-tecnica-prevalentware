import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/components/providers/AuthProvider';
import { fetchMe } from '@/server/services/auth/me';
import type { Me } from '@/types/auth';

// Mock de la función fetchMe
vi.mock('@/server/services/auth/me', () => ({
  fetchMe: vi.fn().mockResolvedValue(null),
}));

// Componente de prueba que usa el hook
function TestComponent() {
  const { me, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {me ? (
        <div data-testid="user-info">{me.name} - {me.email}</div>
      ) : (
        <div>Not logged in</div>
      )}
    </div>
  );
}

describe('AuthProvider & useAuth', () => {
  // Test 1: AuthProvider renders without initial data
  it('should render AuthProvider with children', () => {
    render(
      <AuthProvider>
        <div>Test Child</div>
      </AuthProvider>
    );

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  // Test 2: AuthProvider uses initial data
  it('should use initialMe data', async () => {
    const initialUser: Me = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'USER',
    };

    vi.mocked(fetchMe).mockResolvedValueOnce(initialUser);

    render(
      <AuthProvider initialMe={initialUser}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-info')).toHaveTextContent('john@example.com');
    });
  });

  // Test 3: useAuth shows "Not logged in" message when no user
  it('should show not logged in message when no user', async () => {
    render(
      <AuthProvider initialMe={null}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });

  // Test 4: useAuth throws error if used outside AuthProvider
  it('should throw error when useAuth used outside AuthProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow();

    spy.mockRestore();
  });

  // Test 5: AuthProvider handles multiple users
  it('should handle different users', async () => {
    const user1: Me = {
      id: '1',
      name: 'User One',
      email: 'user1@example.com',
      role: 'ADMIN',
    };

    vi.mocked(fetchMe).mockResolvedValueOnce(user1);

    const { unmount } = render(
      <AuthProvider initialMe={user1}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('User One');
    });

    unmount();

    const user2: Me = {
      id: '2',
      name: 'User Two',
      email: 'user2@example.com',
      role: 'USER',
    };

    vi.mocked(fetchMe).mockResolvedValueOnce(user2);

    render(
      <AuthProvider initialMe={user2}>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-info')).toHaveTextContent('User Two');
    });
  });
});
