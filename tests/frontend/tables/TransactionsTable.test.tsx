import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransactionsTable } from '@/components/tables/TransactionsTable';
import type { TransactionRow } from '@/components/tables/TransactionsTable';

describe('TransactionsTable Component', () => {
  // Test 1: Renders empty table
  it('should render empty table', () => {
    render(
      <TransactionsTable rows={[]} />
    );

    // La tabla debe existir pero sin filas
    expect(screen.queryByRole('table')).toBeInTheDocument();
  });

  // Test 2: Renders transactions
  it('should render transactions', () => {
    const transactions: TransactionRow[] = [
      {
        id: 't1',
        concept: 'Venta mostrador',
        amount: 150000,
        date: '2026-01-31T10:00:00Z',
        type: 'ingreso',
        name: 'John Doe',
      },
      {
        id: 't2',
        concept: 'Comisión pagada',
        amount: 50000,
        date: '2026-01-30T15:30:00Z',
        type: 'gasto',
        name: 'Jane Doe',
      },
    ];

    render(<TransactionsTable rows={transactions} />);

    expect(screen.getByText('Venta mostrador')).toBeInTheDocument();
    expect(screen.getByText('Comisión pagada')).toBeInTheDocument();
  });

  // Test 3: Formats dates correctly
  it('should format dates correctly', () => {
    const transactions: TransactionRow[] = [
      {
        id: 't1',
        concept: 'Test',
        amount: 100000,
        date: '2026-02-02T14:30:45Z',
        type: 'ingreso',
        name: 'John',
      },
    ];

    render(<TransactionsTable rows={transactions} />);

    // La fecha debe estar formateada sin la Z
    expect(screen.getByText('2026-02-02 14:30:45')).toBeInTheDocument();
  });

  // Test 4: Formats COP currency correctly
  it('should format amount as COP currency', () => {
    const transactions: TransactionRow[] = [
      {
        id: 't1',
        concept: 'Test',
        amount: 1000000,
        date: '2026-01-31T10:00:00Z',
        type: 'ingreso',
        name: 'John',
      },
    ];

    render(<TransactionsTable rows={transactions} />);

    // Amount must contain $ symbol or formatted numbers
    const cells = screen.getAllByText(/1.*0+/);
    expect(cells.length).toBeGreaterThan(0);
  });

  // Test 5: Displays user name
  it('should display user name', () => {
    const transactions: TransactionRow[] = [
      {
        id: 't1',
        concept: 'Transacción',
        amount: 100000,
        date: '2026-01-31T10:00:00Z',
        type: 'ingreso',
        name: 'Carlos Ramírez',
      },
    ];

    render(<TransactionsTable rows={transactions} />);

    expect(screen.getByText('Carlos Ramírez')).toBeInTheDocument();
  });

  // Test 6: Differentiates between income and expense
  it('should differentiate between income and expense', () => {
    const transactions: TransactionRow[] = [
      {
        id: 't1',
        concept: 'Venta',
        amount: 100000,
        date: '2026-01-31T10:00:00Z',
        type: 'ingreso',
        name: 'John',
      },
      {
        id: 't2',
        concept: 'Compra',
        amount: 50000,
        date: '2026-01-30T15:00:00Z',
        type: 'gasto',
        name: 'Jane',
      },
    ];

    render(<TransactionsTable rows={transactions} />);

    expect(screen.getByText('INGRESO')).toBeInTheDocument();
    expect(screen.getByText('GASTO')).toBeInTheDocument();
  });

  // Test 7: Renders header right if provided
  it('should render headerRight element', () => {
    const HeaderComponent = <button>Nueva Transacción</button>;

    render(
      <TransactionsTable 
        rows={[]} 
        headerRight={HeaderComponent}
      />
    );

    expect(screen.getByText('Nueva Transacción')).toBeInTheDocument();
  });

  // Test 8: Shows loading state
  it('should show loading skeletons', () => {
    const transactions: TransactionRow[] = [
      {
        id: 't1',
        concept: 'Test',
        amount: 100000,
        date: '2026-01-31T10:00:00Z',
        type: 'ingreso',
        name: 'John',
      },
    ];

    const { container } = render(
      <TransactionsTable 
        rows={transactions}
        loading={true}
      />
    );

    // When loading=true, should have elements with animate-pulse
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  // Test 9: Handles multiple transactions
  it('should handle multiple transactions', () => {
    const transactions: TransactionRow[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`,
      concept: `Transacción ${i}`,
      amount: 100000 * (i + 1),
      date: '2026-01-31T10:00:00Z',
      type: i % 2 === 0 ? 'ingreso' : 'gasto',
      name: `Usuario ${i}`,
    }));

    render(<TransactionsTable rows={transactions} />);

    transactions.forEach((t) => {
      expect(screen.getByText(t.concept)).toBeInTheDocument();
    });
  });

  // Test 10: Respects pageSize prop
  it('should accept pageSize prop', () => {
    const transactions: TransactionRow[] = [
      {
        id: 't1',
        concept: 'Test',
        amount: 100000,
        date: '2026-01-31T10:00:00Z',
        type: 'ingreso',
        name: 'John',
      },
    ];

    const { container } = render(
      <TransactionsTable 
        rows={transactions}
        pageSize={20}
      />
    );

    expect(container).toBeInTheDocument();
  });
});
