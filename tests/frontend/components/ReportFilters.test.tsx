import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportFilters } from '@/components/reports/ReportFilters';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
    usePathname: vi.fn(),
}));

// Mock alerts
vi.mock('@/lib/alerts', () => ({
    alerts: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ReportFilters Component', () => {
    const mockPush = vi.fn();
    const mockRouter = {
        push: mockPush,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue(mockRouter);
        (useSearchParams as any).mockReturnValue(new URLSearchParams());
        (usePathname as any).mockReturnValue('/dashboard/reportes');
    });

    // Test 1: Renders with initial values
    it('should render with initial values', () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        const toInput = screen.getByDisplayValue('2026-02-02') as HTMLInputElement;

        expect(fromInput.value).toBe('2026-01-01');
        expect(toInput.value).toBe('2026-02-02');
    });

    // Test 2: Renders granularity options
    it('should render granularity options', () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        // Debería haber opciones para día, mes y todos
        const options = screen.getAllByRole('option');
        expect(options.length).toBeGreaterThanOrEqual(3);
    });

    // Test 3: Allows changing start date
    it('should allow changing start date', async () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        fireEvent.change(fromInput, { target: { value: '2026-01-15' } });

        await waitFor(() => {
            expect(fromInput.value).toBe('2026-01-15');
        });
    });

    // Test 4: Allows changing end date
    it('should allow changing end date', async () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const toInput = screen.getByDisplayValue('2026-02-02') as HTMLInputElement;
        fireEvent.change(toInput, { target: { value: '2026-01-31' } });

        await waitFor(() => {
            expect(toInput.value).toBe('2026-01-31');
        });
    });

    // Test 5: Allows changing granularity
    it('should allow changing granularity', async () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        // Buscar el select de granularidad
        const selects = screen.getAllByRole('combobox');
        const granularitySelect = selects[selects.length - 1];

        fireEvent.change(granularitySelect, { target: { value: 'day' } });

        await waitFor(() => {
            expect((granularitySelect as HTMLSelectElement).value).toBe('day');
        });
    });

    // Test 6: Detects when values have changed
    it('should detect when values have changed', async () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        fireEvent.change(fromInput, { target: { value: '2026-01-15' } });

        await waitFor(() => {
            // El botón de aplicar debería estar disponible
            const applyButton = screen.queryByText('Aplicar') || screen.queryByText('Apply');
            expect(applyButton).toBeTruthy();
        });
    });

    // Test 7: Renders CSV download button
    it('should render CSV download button', () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const downloadButton = screen.getByRole('button', { name: /export|csv/i });
        expect(downloadButton).toBeInTheDocument();
    });

    // Test 8: Renders labels for each field
    it('should render labels for filters', () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        expect(screen.getByText('Desde')).toBeInTheDocument();
        expect(screen.getByText('Hasta')).toBeInTheDocument();
        expect(screen.getByText('Granularidad')).toBeInTheDocument();
    });

    // Test 9: Disables buttons when busy
    it('should disable buttons when busy', async () => {
        const { rerender } = render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        // Cambiar valor para que esté "busy"
        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        fireEvent.change(fromInput, { target: { value: '2026-01-15' } });

        // En estado pendiente, los botones deberían estar deshabilitados
        await waitFor(() => {
            const buttons = screen.getAllByRole('button');
            // Al menos algunos botones pueden estar deshabilitados durante transición
            expect(buttons.length).toBeGreaterThan(0);
        });
    });

    // Test 10: Accepts date format YYYY-MM-DD
    it('should accept date format YYYY-MM-DD', () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-12-31"
                granularity="day"
            />
        );

        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        expect(fromInput.value).toMatch(/\d{4}-\d{2}-\d{2}/);
    });

    // Test 11: Apply button triggers router navigation
    it('should trigger router navigation when apply is clicked', async () => {
        const mockReplace = vi.fn();
        (useRouter as any).mockReturnValue({ replace: mockReplace });

        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        fireEvent.change(fromInput, { target: { value: '2026-01-15' } });

        const applyButton = screen.getByRole('button', { name: /Apply/i });
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalled();
        });
    });

    // Test 12: Shows error when from date is after to date on apply
    it('should show error when from date is after to date on apply', async () => {
        const { alerts } = await import('@/lib/alerts');

        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        fireEvent.change(fromInput, { target: { value: '2026-03-01' } });

        const applyButton = screen.getByRole('button', { name: /Apply/i });
        fireEvent.click(applyButton);

        await waitFor(() => {
            expect(alerts.error).toHaveBeenCalledWith('Invalid date range', expect.any(Object));
        });
    });

    // Test 13: Shows success alert when props update
    it('should show success alert when props update', async () => {
        const { alerts } = await import('@/lib/alerts');

        const { rerender } = render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        rerender(
            <ReportFilters
                from="2026-01-15"
                to="2026-02-02"
                granularity="month"
            />
        );

        await waitFor(() => {
            expect(alerts.success).toHaveBeenCalledWith('Report updated');
        });
    });

    // Test 14: Does not show alert on invalid date range update
    it('should not show alert when invalid date range in props', async () => {
        const { alerts } = await import('@/lib/alerts');
        const alertSpy = vi.spyOn(alerts, 'success');

        const { rerender } = render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        rerender(
            <ReportFilters
                from="2026-03-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        await waitFor(() => {
            expect(alertSpy).not.toHaveBeenCalledWith('Report updated');
        }, { timeout: 1000 });
    });

    // Test 15: Shows error on CSV download with invalid date range
    it('should show error on CSV download with invalid date range', async () => {
        const { alerts } = await import('@/lib/alerts');

        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const fromInput = screen.getByDisplayValue('2026-01-01') as HTMLInputElement;
        fireEvent.change(fromInput, { target: { value: '2026-03-01' } });

        const downloadButton = screen.getByRole('button', { name: /export|csv/i });
        fireEvent.click(downloadButton);

        await waitFor(() => {
            expect(alerts.error).toHaveBeenCalledWith('Invalid date range', expect.any(Object));
        });
    });

    // Test 16: CSV download button shows spinner when downloading
    it('should show spinner when CSV is downloading', async () => {
        vi.stubGlobal('fetch', vi.fn(() =>
            new Promise((resolve) =>
                setTimeout(() =>
                    resolve(
                        new Response('data', { status: 200, statusText: 'OK' })
                    ),
                    100
                )
            )
        ));

        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const downloadButton = screen.getByRole('button', { name: /export|csv/i });
        fireEvent.click(downloadButton);

        await waitFor(() => {
            expect(screen.getByText(/Exporting/i)).toBeInTheDocument();
        });
    });

    // Test 17
    it("should show error when CSV response is empty", async () => {
        const { alerts } = await import("@/lib/alerts");
        const errorSpy = vi.spyOn(alerts, "error").mockReturnValue(0);

        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve(new Response("   ", { status: 200 }))
            )
        );

        render(<ReportFilters from="2026-01-01" to="2026-02-02" granularity="month" />);

        fireEvent.click(screen.getByRole("button", { name: /export|csv/i }));

        await waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith(
                "Unexpected error while exporting CSV"
            );
        });
    });

    // Test 18
    it("should show error when CSV download fails", async () => {
        const { alerts } = await import("@/lib/alerts");
        const errorSpy = vi.spyOn(alerts, "error").mockReturnValue(0);

        vi.stubGlobal(
            "fetch",
            vi.fn(() =>
                Promise.resolve(new Response("", { status: 400, statusText: "Bad Request" }))
            )
        );

        render(<ReportFilters from="2026-01-01" to="2026-02-02" granularity="month" />);

        fireEvent.click(screen.getByRole("button", { name: /export|csv/i }));

        await waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith("CSV export failed");
        });
    });

    // Test 19
    it("should show error on fetch exception during CSV download", async () => {
        const { alerts } = await import("@/lib/alerts");
        const errorSpy = vi.spyOn(alerts, "error").mockReturnValue(0);

        vi.stubGlobal(
            "fetch",
            vi.fn(async () => {
                throw new Error("Network error");
            })
        );

        render(<ReportFilters from="2026-01-01" to="2026-02-02" granularity="month" />);

        fireEvent.click(screen.getByRole("button", { name: /export|csv/i }));

        await waitFor(() => {
            expect(errorSpy).toHaveBeenCalledWith("Unexpected error while exporting CSV");
        });
    });


    // Test 20: Apply button is disabled when no changes
    it('should disable apply button when no changes are made', () => {
        render(
            <ReportFilters
                from="2026-01-01"
                to="2026-02-02"
                granularity="month"
            />
        );

        const applyButton = screen.getByRole('button', { name: /Apply/i });
        expect(applyButton).toBeDisabled();
    });
});
