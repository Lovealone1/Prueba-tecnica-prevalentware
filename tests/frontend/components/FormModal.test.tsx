import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormModal, type FormField } from '@/components/ui/FormModal';

describe('FormModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const fields: FormField[] = [
    {
      name: 'email',
      label: 'Email',
      type: 'text',
      required: true,
      placeholder: 'user@example.com',
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      options: [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'USER', label: 'User' },
      ],
    },
  ];

  // Test 1: FormModal does not render when open is false
  it('should not render when open is false', () => {
    const { container } = render(
      <FormModal
        open={false}
        title="Test Form"
        fields={fields}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  // Test 2: FormModal renders when open is true
  it('should render when open is true', () => {
    render(
      <FormModal
        open={true}
        title="Test Form"
        fields={fields}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Test Form')).toBeInTheDocument();
  });

  // Test 3: FormModal renders all form fields
  it('should render all form fields', () => {
    render(
      <FormModal
        open={true}
        title="Test Form"
        fields={fields}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  // Test 4: FormModal calls onClose when cancel button clicked
  it('should call onClose when cancel button clicked', () => {
    render(
      <FormModal
        open={true}
        title="Test Form"
        fields={fields}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 5: FormModal does not submit if required fields are empty
  it('should not submit if required fields are empty', () => {
    render(
      <FormModal
        open={true}
        title="Test Form"
        fields={fields}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  // Test 6: FormModal uses initial values
  it('should use initial values', () => {
    const initialValues = {
      email: 'test@example.com',
      role: 'ADMIN',
    };

    render(
      <FormModal
        open={true}
        title="Test Form"
        fields={fields}
        initialValues={initialValues}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const emailInput = screen.getByDisplayValue('test@example.com');
    expect(emailInput).toBeInTheDocument();
  });

  // Test 7: FormModal shows description if provided
  it('should render description when provided', () => {
    render(
      <FormModal
        open={true}
        title="Test Form"
        description="This is a test description"
        fields={fields}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  // Test 8: FormModal disables buttons when loading is true
  it('should disable buttons when loading', () => {
    render(
      <FormModal
        open={true}
        title="Test Form"
        fields={fields}
        loading={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const submitButton = screen.getByText('Guardar') as HTMLButtonElement;
    const cancelButton = screen.getByText('Cancelar') as HTMLButtonElement;

    expect(submitButton.disabled).toBe(true);
    expect(cancelButton.disabled).toBe(true);
  });

  // Test 9: FormModal allows custom button text
  it('should use custom button text', () => {
    render(
      <FormModal
        open={true}
        title="Test Form"
        fields={fields}
        submitText="Enviar"
        cancelText="Volver"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Enviar')).toBeInTheDocument();
    expect(screen.getByText('Volver')).toBeInTheDocument();
  });
});
