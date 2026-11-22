import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuestionCard from '../../components/question/QuestionCard';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import dialogService from '../../service/dialogService';

vi.mock('../../service/dialogService', () => ({
  default: {
    confirmDeleteQuestion: vi.fn(),
    confirmDeleteAnswer: vi.fn(),
    showUnauthenticatedLikeModal: vi.fn(),
    confirmAction: vi.fn(),
  },
}));

const mockOnDeleteQuestion = vi.fn();
const mockOnDeleteAnswer = vi.fn();

const sampleQuestion = {
  id: 'q-42',
  content: 'How do you structure microservices in Spring Boot?',
  receiverUsername: 'alex_architect',
  sender: {
    username: 'curious_dev',
    firstName: 'Curious',
    lastName: 'Dev',
  },
  isAnonymous: false,
  createdAt: new Date().toISOString(),
  answer: {
    id: 'ans-42',
    content: 'Domain-driven design boundaries with separate build pipelines.',
    createdAt: new Date().toISOString(),
    likesCount: 5,
  },
};

const renderQuestionCard = (currentUser) => {
  return render(
    <NotificationContext.Provider value={{ showSuccess: vi.fn(), showError: vi.fn() }}>
      <AuthContext.Provider value={{ user: currentUser }}>
        <MemoryRouter>
          <QuestionCard
            question={sampleQuestion}
            onDeleteQuestion={mockOnDeleteQuestion}
            onDeleteAnswer={mockOnDeleteAnswer}
          />
        </MemoryRouter>
      </AuthContext.Provider>
    </NotificationContext.Provider>
  );
};

describe('QuestionCard — Delete Authorization Security Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders delete buttons when logged in as the content owner (receiver)', () => {
    const receiverUser = { username: 'alex_architect', role: 'ROLE_USER' };
    renderQuestionCard(receiverUser);

    // Both question and answer delete buttons should be present in the DOM
    expect(screen.getByTestId('delete-question-btn')).toBeDefined();
    expect(screen.getByTestId('delete-answer-btn')).toBeDefined();
  });

  it('renders delete buttons when logged in as an ADMIN', () => {
    const adminUser = { username: 'super_admin', role: 'ROLE_ADMIN' };
    renderQuestionCard(adminUser);

    expect(screen.getByTestId('delete-question-btn')).toBeDefined();
    expect(screen.getByTestId('delete-answer-btn')).toBeDefined();
  });

  it('STRICTLY hides delete buttons from the question sender', () => {
    const senderUser = { username: 'curious_dev', role: 'ROLE_USER' };
    renderQuestionCard(senderUser);

    // Neither question nor answer delete button must exist
    expect(screen.queryByTestId('delete-question-btn')).toBeNull();
    expect(screen.queryByTestId('delete-answer-btn')).toBeNull();
  });

  it('STRICTLY hides delete buttons from a random third-party user', () => {
    const bystanderUser = { username: 'random_visitor', role: 'ROLE_USER' };
    renderQuestionCard(bystanderUser);

    expect(screen.queryByTestId('delete-question-btn')).toBeNull();
    expect(screen.queryByTestId('delete-answer-btn')).toBeNull();
  });

  it('STRICTLY hides delete buttons from an unauthenticated visitor (null user)', () => {
    renderQuestionCard(null);

    expect(screen.queryByTestId('delete-question-btn')).toBeNull();
    expect(screen.queryByTestId('delete-answer-btn')).toBeNull();
  });

  it('calls dialogService.confirmDeleteQuestion and proceeds only when confirmed', async () => {
    dialogService.confirmDeleteQuestion.mockResolvedValueOnce(true);
    const receiverUser = { username: 'alex_architect', role: 'ROLE_USER' };
    renderQuestionCard(receiverUser);

    const deleteBtn = screen.getByTestId('delete-question-btn');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(dialogService.confirmDeleteQuestion).toHaveBeenCalled();
      expect(mockOnDeleteQuestion).toHaveBeenCalledWith('q-42');
    });
  });

  it('aborts deletion when user cancels the SweetAlert confirmation dialog', async () => {
    dialogService.confirmDeleteQuestion.mockResolvedValueOnce(false);
    const receiverUser = { username: 'alex_architect', role: 'ROLE_USER' };
    renderQuestionCard(receiverUser);

    const deleteBtn = screen.getByTestId('delete-question-btn');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(dialogService.confirmDeleteQuestion).toHaveBeenCalled();
      expect(mockOnDeleteQuestion).not.toHaveBeenCalled();
    });
  });
});
