import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '@/components/ui/Modal';

describe('Modal Component', () => {
  // Test 1: Modal does not render when open is false
  it('should not render when open is false', () => {
    const { container } = render(
      <Modal
        open={false}
        title="Test Modal"
        onClose={() => {}}
      >
        <p>Content</p>
      </Modal>
    );

    expect(container.firstChild).toBeNull();
  });

  // Test 2: Modal renders when open is true
  it('should render when open is true', () => {
    render(
      <Modal
        open={true}
        title="Test Modal"
        onClose={() => {}}
      >
        <p>Test Content</p>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  // Test 3: Modal shows description if provided
  it('should render description when provided', () => {
    render(
      <Modal
        open={true}
        title="Test"
        description="This is a description"
        onClose={() => {}}
      >
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  // Test 4: Calls onClose when close button is clicked
  it('should call onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();
    render(
      <Modal
        open={true}
        title="Test"
        onClose={mockOnClose}
      >
        <p>Content</p>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Cerrar');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 5: Calls onClose when backdrop is clicked
  it('should call onClose when backdrop is clicked', async () => {
    const mockOnClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal
        open={true}
        title="Test"
        onClose={mockOnClose}
      >
        <p>Content</p>
      </Modal>
    );

    const backdrop = screen.getByLabelText('Cerrar modal');
    await user.click(backdrop);

    expect(mockOnClose).toHaveBeenCalled();
  });

  // Test 6: Modal renders footer when provided
  it('should render footer when provided', () => {
    render(
      <Modal
        open={true}
        title="Test"
        onClose={() => {}}
        footer={<button>Save</button>}
      >
        <p>Content</p>
      </Modal>
    );

    expect(screen.getByText('Save')).toBeInTheDocument();
  });
});
