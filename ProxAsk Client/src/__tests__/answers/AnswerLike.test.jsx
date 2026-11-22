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
  },
}));

const sampleAnsweredQuestion = {
  id: 'q-99',
  content: 'How do you test async UI interactions in React 19?',
  receiverUsername: 'sarah_chen',
  isAnonymous: false,
  answer: {
    id: 'ans-99',
    content: 'Using waitFor with React Testing Library and userEvent.',
    createdAt: new Date().toISOString(),
    likesCount: 10,
    isLiked: false,
  },
};

const renderQuestionWithLike = (currentUser) => {
  return render(
    <NotificationContext.Provider value={{ showSuccess: vi.fn(), showError: vi.fn() }}>
      <AuthContext.Provider value={{ user: currentUser }}>
        <MemoryRouter>
          <QuestionCard question={sampleAnsweredQuestion} />
        </MemoryRouter>
      </AuthContext.Provider>
    </NotificationContext.Provider>
  );
};

describe('Answer Heart / Like Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heart icon and initial like count', () => {
    renderQuestionWithLike({ username: 'john_doe' });

    const likeBtn = screen.getByTestId('like-answer-btn');
    expect(likeBtn).toBeDefined();
    expect(likeBtn.textContent).toContain('10');
  });

  it('toggles liked state and increments like count when authenticated user clicks heart', async () => {
    renderQuestionWithLike({ username: 'john_doe' });

    const likeBtn = screen.getByTestId('like-answer-btn');
    fireEvent.click(likeBtn);

    // Heart filled and count increments to 11
    await waitFor(() => {
      expect(likeBtn.textContent).toContain('11');
      expect(likeBtn.getAttribute('aria-label')).toBe('Unlike answer');
    });

    // Clicking again decrements back to 10
    fireEvent.click(likeBtn);
    await waitFor(() => {
      expect(likeBtn.textContent).toContain('10');
      expect(likeBtn.getAttribute('aria-label')).toBe('Like answer');
    });
  });

  it('triggers SweetAlert2 Join Conversation dialog when unauthenticated visitor clicks heart', async () => {
    renderQuestionWithLike(null); // Guest / unauthenticated

    const likeBtn = screen.getByTestId('like-answer-btn');
    fireEvent.click(likeBtn);

    await waitFor(() => {
      expect(dialogService.showUnauthenticatedLikeModal).toHaveBeenCalled();
    });
  });
});
