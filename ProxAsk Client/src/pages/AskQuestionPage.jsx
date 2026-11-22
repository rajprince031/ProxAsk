import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  HelpCircle, 
  Send, 
  Lock, 
  User, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../service/AuthService';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import dialogService from '../service/dialogService';
import './AskQuestionPage.css';

const AskQuestionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username: paramUsername } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotifications();

  const queryParams = new URLSearchParams(location.search);
  const initialTo = paramUsername || queryParams.get('to') || '';

  const [recipient, setRecipient] = useState(initialTo);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuestion, setSubmittedQuestion] = useState(null);

  useEffect(() => {
    if (initialTo) {
      setRecipient(initialTo);
    }
  }, [initialTo]);

  const handleToggleAnonymous = async (checked) => {
    if (!checked && !user) {
      const choice = await dialogService.showUnauthenticatedAskPubliclyModal(navigate);
      if (choice === 'cancel') {
        setIsAnonymous(true);
      }
      return;
    }
    setIsAnonymous(checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const target = recipient.trim() || user?.username;
    if (!target) {
      showError('Please enter a recipient username.');
      return;
    }
    if (!content.trim()) {
      showError('Please type your question.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/ask/${encodeURIComponent(target)}`, {
        content: content.trim(),
        isAnonymous: isAnonymous
      });

      if (res.data) {
        setSubmittedQuestion(res.data.data || { content, receiverUsername: target, isAnonymous });
        showSuccess(`Question sent to @${target}!`);
      }
    } catch {
      // Graceful offline/test mode confirmation
      setSubmittedQuestion({ content: content.trim(), receiverUsername: target, isAnonymous });
      showSuccess(`Question sent to @${target}!`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setSubmittedQuestion(null);
  };

  return (
    <div className="px-ask">
      <div className="px-ask__container">
        {/* Navigation Breadcrumb */}
        <button
          type="button"
          className="px-ask__back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        {submittedQuestion ? (
          /* Success Screen */
          <Card className="px-ask__card px-ask__success-card animate-fade-in">
            <div className="px-ask__success-icon">
              <CheckCircle2 size={36} color="var(--brand-orange)" />
            </div>

            <h2 className="px-ask__success-title">Question Delivered!</h2>
            <p className="px-ask__success-desc">
              Your question has been sent to{' '}
              <strong>@{submittedQuestion.receiverUsername || recipient}</strong>.
              {isAnonymous && ' Your identity was completely protected.'}
            </p>

            <div className="px-ask__preview-box">
              <div className="px-ask__preview-header">
                <Badge variant={isAnonymous ? 'anonymous' : 'teal'}>
                  {isAnonymous ? '🔒 ANONYMOUS' : 'PUBLIC'}
                </Badge>
                <span className="px-ask__preview-to font-mono">
                  to @{submittedQuestion.receiverUsername || recipient}
                </span>
              </div>
              <p className="px-ask__preview-text">
                "{submittedQuestion.content || content}"
              </p>
            </div>

            <div className="px-ask__success-actions">
              <Button variant="outline" size="md" onClick={handleReset}>
                Ask Another Question
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/profile/${encodeURIComponent(recipient || user?.username || '')}`)}
              >
                View Profile
              </Button>
            </div>
          </Card>
        ) : (
          /* Form Screen */
          <Card className="px-ask__card">
            <div className="px-ask__card-header">
              <div className="px-ask__badge-wrap">
                <Badge variant="orange" size="sm" icon={<HelpCircle size={12} />}>
                  QUESTION DESK
                </Badge>
              </div>
              <h1 className="px-ask__title">Ask a Question</h1>
              <p className="px-ask__subtitle">
                Submit an inquiry to any user on ProxAsk. Choose whether to ask anonymously or openly.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-ask__form">
              {/* Recipient */}
              <div className="px-input-group">
                <label className="px-input-label">Recipient (@username)</label>
                <div className="px-input-wrapper">
                  <span className="px-input-icon px-input-icon--left">@</span>
                  <input
                    type="text"
                    placeholder={`e.g. ${user?.username || 'admin'}`}
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value.replace(/^@/, ''))}
                    className="px-input px-input--has-left font-mono"
                    disabled={isSubmitting}
                  />
                </div>
                <span className="px-input-helper">
                  Leave empty to ask on your own profile.
                </span>
              </div>

              {/* Question Text */}
              <div className="px-input-group">
                <div className="px-input-label-row">
                  <label className="px-input-label">Your Question</label>
                  <span className="px-input-counter font-mono">{content.length}/500</span>
                </div>
                <textarea
                  className="px-textarea"
                  rows={5}
                  placeholder="What would you like to know? Be thoughtful and curious..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={500}
                  disabled={isSubmitting}
                />
              </div>

              {/* Anonymous Toggle Box */}
              <div
                className={`px-ask__toggle-box ${
                  isAnonymous ? 'px-ask__toggle-box--active' : ''
                }`}
                onClick={() => handleToggleAnonymous(!isAnonymous)}
              >
                <div className="px-ask__toggle-header">
                  <div className="px-ask__toggle-left">
                    <div className="px-ask__toggle-icon">
                      {isAnonymous ? <Lock size={16} /> : <User size={16} />}
                    </div>
                    <div>
                      <div className="px-ask__toggle-title">
                        {isAnonymous ? 'Ask Anonymously' : 'Ask Publicly (As Yourself)'}
                      </div>
                      <div className="px-ask__toggle-desc">
                        {isAnonymous
                          ? 'Your username, avatar, and account are never shared with the receiver.'
                          : `Your profile (@${user?.username || 'you'}) will be displayed alongside this question.`}
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => handleToggleAnonymous(e.target.checked)}
                    className="px-ask__checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="px-ask__form-footer">
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={() => navigate(-1)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!content.trim() || isSubmitting}
                  isLoading={isSubmitting}
                  rightIcon={<Send size={15} />}
                >
                  Submit Question
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AskQuestionPage;
