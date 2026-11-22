import { describe, it, expect, vi, beforeEach } from 'vitest';
import Swal from 'sweetalert2';
import dialogService from '../../service/dialogService';

vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
  },
}));

describe('DialogService (SweetAlert2 GitHub Light Wrapper)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('confirmDeleteQuestion calls Swal.fire with danger styling, showCancelButton: true, showDenyButton: false, and returns true when confirmed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });

    const result = await dialogService.confirmDeleteQuestion();

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete Question?',
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: false,
        confirmButtonText: 'Delete Question',
        cancelButtonText: 'Cancel',
        allowOutsideClick: true,
        allowEscapeKey: true,
        showCloseButton: true,
      })
    );
    expect(result).toBe(true);
  });

  it('confirmDeleteAnswer calls Swal.fire with showDenyButton: false and returns false when cancelled or dismissed', async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false, isDismissed: true });

    const result = await dialogService.confirmDeleteAnswer();

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Delete Answer?',
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: false,
        confirmButtonText: 'Delete Answer',
        cancelButtonText: 'Cancel',
      })
    );
    expect(result).toBe(false);
  });

  it('showUnauthenticatedLikeModal navigates to /login when user clicks Log In (denied/secondary button)', async () => {
    const mockNavigate = vi.fn();
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false, isDenied: true });

    const action = await dialogService.showUnauthenticatedLikeModal(mockNavigate);

    expect(Swal.fire).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Join the conversation',
        text: 'Create an account or log in to like this answer.',
        showCancelButton: true,
        showDenyButton: true,
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/login');
    expect(action).toBe('login');
  });

  it('showUnauthenticatedLikeModal navigates to /signup when user clicks Sign Up (confirmed button)', async () => {
    const mockNavigate = vi.fn();
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true, isDenied: false });

    const action = await dialogService.showUnauthenticatedLikeModal(mockNavigate);

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
    expect(action).toBe('signup');
  });
});
