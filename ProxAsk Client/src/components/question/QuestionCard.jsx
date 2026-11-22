import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Share2, 
  Trash2, 
  CornerDownRight, 
  Send,
  Check,
  Heart,
  Globe,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import dialogService from '../../service/dialogService';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Card from '../common/Card';
import './QuestionCard.css';

// Format relative date (e.g., "2m ago", "1h ago", "Nov 14")
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Recently';
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
};

const QuestionCard = ({
  question,
  onAnswerSubmit,
  onDeleteQuestion,
  onDeleteAnswer,
  onLikeAnswer,
  onVisibilityChange,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const [isAnswering, setIsAnswering] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Visibility state (PUBLIC, FOLLOWERS, PRIVATE)
  const [visibility, setVisibility] = useState(question?.visibility || 'PUBLIC');

  // Like state
  const initialLikes = Number(question?.answer?.likesCount || question?.answer?.likeCount || question?.likesCount || 0);
  const [liked, setLiked] = useState(Boolean(question?.answer?.isLiked || question?.isLiked));
  const [likeCount, setLikeCount] = useState(initialLikes);

  const currentUsername = user?.username ? user.username.toLowerCase() : null;
  const receiverName = question?.receiverUsername || question?.receiver?.username || 'user';
  const isReceiver = Boolean(currentUsername && currentUsername === receiverName.toLowerCase());
  
  const isAdmin = Boolean(
    user?.role === 'ROLE_ADMIN' || 
    user?.roles?.includes('ROLE_ADMIN') ||
    user?.authorities?.some(a => a.authority === 'ROLE_ADMIN')
  );

  // STRICT Delete Authorization: ONLY receiver (content owner) or ADMIN can delete
  const canDeleteQuestion = Boolean((isReceiver || isAdmin) && onDeleteQuestion);
  const canDeleteAnswer = Boolean((isReceiver || isAdmin) && onDeleteAnswer);

  const hasAnswer = Boolean(question?.answer);

  const handleShare = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/profile/${encodeURIComponent(receiverName)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);
      showSuccess('Link copied to clipboard!');
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleDeleteQuestionClick = async () => {
    if (!canDeleteQuestion) return;
    const confirmed = await dialogService.confirmDeleteQuestion();
    if (confirmed) {
      try {
        await onDeleteQuestion(question.id);
        showSuccess('Question deleted successfully.');
      } catch {
        showError('Failed to delete question.');
      }
    }
  };

  const handleDeleteAnswerClick = async () => {
    if (!canDeleteAnswer) return;
    const confirmed = await dialogService.confirmDeleteAnswer();
    if (confirmed) {
      try {
        await onDeleteAnswer(question.id);
        showSuccess('Answer deleted successfully.');
      } catch {
        showError('Failed to delete answer.');
      }
    }
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    // Unauthenticated user -> triggers SweetAlert2 login/signup prompt
    if (!user) {
      await dialogService.showUnauthenticatedLikeModal(navigate);
      return;
    }

    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount(prev => Math.max(0, prev + (nextLiked ? 1 : -1)));

    if (onLikeAnswer) {
      try {
        await onLikeAnswer(question?.answer?.id || question.id, nextLiked);
      } catch {
        // Rollback on failure
        setLiked(!nextLiked);
        setLikeCount(prev => Math.max(0, prev + (nextLiked ? -1 : 1)));
      }
    }
  };

  const handleVisibilityToggle = () => {
    if (!isReceiver && !isAdmin) return;
    const order = ['PUBLIC', 'FOLLOWERS', 'PRIVATE'];
    const nextIdx = (order.indexOf(visibility) + 1) % order.length;
    const nextVal = order[nextIdx];
    setVisibility(nextVal);
    if (onVisibilityChange) {
      onVisibilityChange(question.id, nextVal);
    }
    showSuccess(`Visibility updated to ${nextVal.toLowerCase()}`);
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (onAnswerSubmit) {
        await onAnswerSubmit(question.id, answerContent.trim());
        setAnswerContent('');
        setIsAnswering(false);
      }
    } catch {
      showError('Failed to publish answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`px-qcard ${className}`}>
      {/* Header */}
      <div className="px-qcard__header">
        <div className="px-qcard__author">
          {question?.isAnonymous ? (
            <>
              <div className="px-qcard__anon-avatar" aria-label="Anonymous Sender">
                <Lock size={14} />
              </div>
              <div>
                <div className="px-qcard__author-row">
                  <span className="px-qcard__anon-label">Anonymous</span>
                  <Badge variant="anonymous" size="sm">ANON</Badge>
                </div>
                <span className="px-qcard__time font-mono">
                  {formatRelativeTime(question?.createdAt)}
                </span>
              </div>
            </>
          ) : (
            <>
              <Avatar
                src={question?.sender?.avatar}
                name={`${question?.sender?.firstName || ''} ${question?.sender?.lastName || ''}`}
                username={question?.sender?.username}
                size="sm"
              />
              <div>
                <div className="px-qcard__author-row">
                  <Link
                    to={`/profile/${question?.sender?.username || ''}`}
                    className="px-qcard__author-name"
                  >
                    {question?.sender?.firstName ? `${question.sender.firstName} ${question.sender.lastName || ''}` : `@${question?.sender?.username || 'member'}`}
                  </Link>
                </div>
                <span className="px-qcard__time font-mono">
                  {formatRelativeTime(question?.createdAt)}
                </span>
              </div>
            </>
          )}

          <span className="px-qcard__target-arrow">→</span>
          <Link
            to={`/profile/${encodeURIComponent(receiverName)}`}
            className="px-qcard__target-link font-mono"
          >
            @{receiverName}
          </Link>
        </div>

        {/* Right Actions */}
        <div className="px-qcard__top-actions">
          {/* Visibility indicator */}
          <button
            type="button"
            className="px-qcard__visibility-badge font-mono"
            onClick={handleVisibilityToggle}
            title={isReceiver ? `Click to change visibility (${visibility})` : `Visibility: ${visibility}`}
            disabled={!isReceiver && !isAdmin}
          >
            {visibility === 'PUBLIC' && <Globe size={12} />}
            {visibility === 'FOLLOWERS' && <Users size={12} />}
            {visibility === 'PRIVATE' && <Lock size={12} />}
            <span>{visibility}</span>
          </button>

          <button
            type="button"
            className="px-qcard__icon-btn"
            onClick={handleShare}
            title="Share question link"
            aria-label="Share"
          >
            {isCopied ? <Check size={14} color="var(--success)" /> : <Share2 size={14} />}
          </button>

          {/* Delete Question: STRICTLY rendered ONLY when user is receiver or admin */}
          {canDeleteQuestion && (
            <button
              type="button"
              className="px-qcard__icon-btn px-qcard__icon-btn--danger"
              onClick={handleDeleteQuestionClick}
              title="Delete question"
              aria-label="Delete question"
              data-testid="delete-question-btn"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Question Content */}
      <div className="px-qcard__content">
        <p className="px-qcard__text">{question?.content || question?.question}</p>
      </div>

      {/* Answer Area */}
      {hasAnswer ? (
        <div className="px-qcard__answer-box">
          <div className="px-qcard__answer-header">
            <Avatar
              src={question?.receiver?.avatar}
              name={receiverName}
              username={receiverName}
              size="xs"
            />
            <div className="px-qcard__answer-meta">
              <Link to={`/profile/${encodeURIComponent(receiverName)}`} className="px-qcard__answer-author">
                @{receiverName}
              </Link>
              <span className="px-qcard__time font-mono">
                {formatRelativeTime(question?.answer?.createdAt)}
              </span>
            </div>

            {/* Answer Heart / Like Button */}
            <button
              type="button"
              className={`px-qcard__like-btn ${liked ? 'px-qcard__like-btn--active' : ''}`}
              onClick={handleLikeClick}
              aria-label={liked ? 'Unlike answer' : 'Like answer'}
              title={liked ? 'Liked' : 'Like this answer'}
              data-testid="like-answer-btn"
            >
              <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              <span className="px-qcard__like-count font-mono">{likeCount}</span>
            </button>

            {/* Delete Answer: STRICTLY rendered ONLY when user is receiver or admin */}
            {canDeleteAnswer && (
              <button
                type="button"
                className="px-qcard__answer-delete-btn"
                onClick={handleDeleteAnswerClick}
                title="Delete your answer"
                aria-label="Delete answer"
                data-testid="delete-answer-btn"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <p className="px-qcard__answer-text">
            {question?.answer?.content || question?.answer}
          </p>
        </div>
      ) : (
        <div className="px-qcard__unanswered">
          {isReceiver ? (
            isAnswering ? (
              <form onSubmit={handleSubmitAnswer} className="px-qcard__answer-form animate-fade-in">
                <textarea
                  className="px-textarea px-qcard__answer-input"
                  rows={3}
                  placeholder="Write your public answer..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  autoFocus
                />
                <div className="px-qcard__form-actions">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => { setIsAnswering(false); setAnswerContent(''); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!answerContent.trim()}
                    isLoading={isSubmitting}
                    rightIcon={<Send size={13} />}
                  >
                    Publish Answer
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAnswering(true)}
                leftIcon={<CornerDownRight size={14} />}
                className="px-qcard__answer-trigger"
              >
                Answer Question
              </Button>
            )
          ) : (
            <div className="px-qcard__waiting-pill font-mono">
              <CornerDownRight size={13} />
              <span>Awaiting answer from @{receiverName}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default QuestionCard;
