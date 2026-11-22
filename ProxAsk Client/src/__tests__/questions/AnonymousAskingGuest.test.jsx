import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AskQuestionPage from '../../pages/AskQuestionPage';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import dialogService from '../../service/dialogService';
import api from '../../service/AuthService';

vi.mock('../../service/AuthService', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../../service/dialogService', () => ({
  default: {
    showUnauthenticatedAskPubliclyModal: vi.fn(),
  },
}));

describe('Public Profile & Anonymous Question Submission for Guests', () => {
  const mockShowSuccess = vi.fn();
  const mockShowError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAskPage = ({ currentUser = null } = {}) => {
    return render(
      <MemoryRouter initialEntries={['/ask/sarah_chen']}>
        <NotificationContext.Provider value={{ showSuccess: mockShowSuccess, showError: mockShowError }}>
          <AuthContext.Provider value={{ user: currentUser }}>
            <AskQuestionPage />
          </AuthContext.Provider>
        </NotificationContext.Provider>
      </MemoryRouter>
    );
  };

  it('defaults to Anonymous Mode enabled for visitors and guests', () => {
    renderAskPage({ currentUser: null });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox.checked).toBe(true);
    expect(screen.getAllByText(/Ask Anonymously/i)[0]).toBeDefined();
  });

  it('triggers SweetAlert modal when guest tries to turn off anonymity', async () => {
    dialogService.showUnauthenticatedAskPubliclyModal.mockResolvedValue('cancel');

    renderAskPage({ currentUser: null });
    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(dialogService.showUnauthenticatedAskPubliclyModal).toHaveBeenCalled();
    });

    // When guest selects cancel, anonymity remains preserved
    expect(checkbox.checked).toBe(true);
  });
});
