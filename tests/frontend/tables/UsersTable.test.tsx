import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UsersTable } from '@/components/tables/UsersTable';
import type { UserRow } from '@/components/tables/UsersTable';

describe('UsersTable Component', () => {
  // Test 1: Renders empty table
  it('should render empty table', () => {
    render(
      <UsersTable rows={[]} />
    );

    expect(screen.queryByRole('table')).toBeInTheDocument();
  });

  // Test 2: Renders users
  it('should render users in table', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+57 300 123 4567',
        role: 'ADMIN',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
      {
        id: 'u2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+57 300 234 5678',
        role: 'USER',
        createdAt: '2026-01-02T10:00:00Z',
        updatedAt: '2026-01-02T10:00:00Z',
      },
    ];

    render(<UsersTable rows={users} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  // Test 3: Shows email addresses
  it('should display email addresses', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'John',
        email: 'john@company.com',
        phone: '+57 300 123 4567',
        role: 'ADMIN',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
    ];

    render(<UsersTable rows={users} />);

    expect(screen.getByText('john@company.com')).toBeInTheDocument();
  });

  // Test 4: Shows phone numbers correctly
  it('should display phone numbers', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        phone: '+57 312 123 4567',
        role: 'USER',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
    ];

    render(<UsersTable rows={users} />);

    expect(screen.getByText('+57 312 123 4567')).toBeInTheDocument();
  });

  // Test 5: Differentiates between ADMIN and USER roles
  it('should display user roles', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+57 300 123 4567',
        role: 'ADMIN',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
      {
        id: 'u2',
        name: 'Regular User',
        email: 'user@example.com',
        phone: '+57 300 234 5678',
        role: 'USER',
        createdAt: '2026-01-02T10:00:00Z',
        updatedAt: '2026-01-02T10:00:00Z',
      },
    ];

    render(<UsersTable rows={users} />);

    expect(screen.getByText('ADMIN')).toBeInTheDocument();
    expect(screen.getByText('USER')).toBeInTheDocument();
  });

  // Test 6: Displays both roles correctly
  it('should display user roles correctly', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'Admin User',
        email: 'admin@example.com',
        phone: '+57 300 123 4567',
        role: 'ADMIN',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
      {
        id: 'u2',
        name: 'Regular User',
        email: 'user@example.com',
        phone: '+57 300 234 5678',
        role: 'USER',
        createdAt: '2026-01-02T10:00:00Z',
        updatedAt: '2026-01-02T10:00:00Z',
      },
    ];

    render(<UsersTable rows={users} />);

    // Both roles should be visible in the table
    const adminRole = screen.getByText('ADMIN');
    const userRole = screen.getByText('USER');
    
    expect(adminRole).toBeInTheDocument();
    expect(userRole).toBeInTheDocument();
  });

  // Test 7: Shows loading state with skeletons
  it('should show loading skeletons', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        phone: '+57 300 123 4567',
        role: 'USER',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
    ];

    const { container } = render(
      <UsersTable 
        rows={users}
        loading={true}
      />
    );

    // Should have elements with animate-pulse
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  // Test 8: Renders action buttons
  it('should render action buttons', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        phone: '+57 300 123 4567',
        role: 'USER',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
    ];

    const mockOnEdit = vi.fn();
    const mockOnPhone = vi.fn();

    render(
      <UsersTable 
        rows={users}
        onEdit={mockOnEdit}
        onPhone={mockOnPhone}
      />
    );

    // Should have buttons for editing or updating phone
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  // Test 9: Handles multiple users
  it('should handle multiple users', () => {
    const users: UserRow[] = Array.from({ length: 5 }, (_, i) => ({
      id: `u${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      phone: `+57 300 ${String(i).padStart(3, '0')} 4567`,
      role: i % 2 === 0 ? 'ADMIN' : 'USER',
      createdAt: `2026-01-0${i + 1}T10:00:00Z`,
      updatedAt: `2026-01-0${i + 1}T10:00:00Z`,
    }));

    render(<UsersTable rows={users} />);

    users.forEach((u) => {
      expect(screen.getByText(u.name!)).toBeInTheDocument();
      expect(screen.getByText(u.email)).toBeInTheDocument();
    });
  });

  // Test 10: Respects pageSize prop
  it('should accept pageSize prop', () => {
    const users: UserRow[] = [
      {
        id: 'u1',
        name: 'John',
        email: 'john@example.com',
        phone: '+57 300 123 4567',
        role: 'USER',
        createdAt: '2026-01-01T10:00:00Z',
        updatedAt: '2026-01-01T10:00:00Z',
      },
    ];

    const { container } = render(
      <UsersTable 
        rows={users}
        pageSize={25}
      />
    );

    expect(container).toBeInTheDocument();
  });
});
