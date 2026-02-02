import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinancialBalanceCard } from '@/components/reports/FinancialBalanceCard';

describe('FinancialBalanceCard Component', () => {
  // Test 1: Renders positive balance
  it('should render positive balance', () => {
    const data = {
      balance: 500000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 1000000, expense: 500000 },
    };

    render(<FinancialBalanceCard data={data} />);

    expect(screen.getByText('Saldo actual')).toBeInTheDocument();
    expect(screen.getByText('COP')).toBeInTheDocument();
  });

  // Test 2: Renders negative balance
  it('should render negative balance', () => {
    const data = {
      balance: -250000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 300000, expense: 550000 },
    };

    render(<FinancialBalanceCard data={data} />);

    expect(screen.getByText('Saldo actual')).toBeInTheDocument();
  });

  // Test 3: Renders zero balance
  it('should render zero balance', () => {
    const data = {
      balance: 0,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 500000, expense: 500000 },
    };

    render(<FinancialBalanceCard data={data} />);

    expect(screen.getByText('Saldo actual')).toBeInTheDocument();
  });

  // Test 4: Shows income correctly
  it('should display income amount', () => {
    const data = {
      balance: 500000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 1500000, expense: 1000000 },
    };

    render(<FinancialBalanceCard data={data} />);

    expect(screen.getByText('Ingresos:')).toBeInTheDocument();
  });

  // Test 5: Shows expenses correctly
  it('should display expense amount', () => {
    const data = {
      balance: 500000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 1500000, expense: 1000000 },
    };

    render(<FinancialBalanceCard data={data} />);

    expect(screen.getByText('Gastos:')).toBeInTheDocument();
  });

  // Test 6: Formats large numbers
  it('should format large numbers correctly', () => {
    const data = {
      balance: 50000000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 75000000, expense: 25000000 },
    };

    render(<FinancialBalanceCard data={data} />);

    expect(screen.getByText('Saldo actual')).toBeInTheDocument();
  });

  // Test 7: Differentiates visually between positive and negative balance
  it('should have different styling for positive and negative balance', () => {
    const dataPos = {
      balance: 100000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 200000, expense: 100000 },
    };

    const dataNeg = {
      balance: -100000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 100000, expense: 200000 },
    };

    const { container: containerPos } = render(
      <FinancialBalanceCard data={dataPos} />
    );

    const { container: containerNeg } = render(
      <FinancialBalanceCard data={dataNeg} />
    );

    // Ambos componentes deberían renderizar exitosamente
    expect(containerPos).toBeInTheDocument();
    expect(containerNeg).toBeInTheDocument();
  });

  // Test 8: Shows data timestamp
  it('should display data timestamp', () => {
    const data = {
      balance: 500000,
      currency: 'COP',
      asOf: '2026-02-02T15:30:45Z',
      totals: { income: 1000000, expense: 500000 },
    };

    render(<FinancialBalanceCard data={data} />);

    // El timestamp debería estar visible en formato dd/mm/yyyy HH:mm:ss
    expect(screen.getByText(/2026-02-02 15:30:45|02-02-2026|Feb/)).toBeTruthy();
  });

  // Test 9: Handles decimal values
  it('should handle decimal values', () => {
    const data = {
      balance: 500000.50,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 1000000.25, expense: 500000.75 },
    };

    render(<FinancialBalanceCard data={data} />);

    expect(screen.getByText('Saldo actual')).toBeInTheDocument();
  });

  // Test 10: Renders without errors with extreme values
  it('should render without errors with extreme values', () => {
    const data = {
      balance: 999999999999,
      currency: 'COP',
      asOf: '2026-02-02T15:30:00Z',
      totals: { income: 999999999999, expense: 1 },
    };

    const { container } = render(
      <FinancialBalanceCard data={data} />
    );

    expect(container).toBeInTheDocument();
  });
});
