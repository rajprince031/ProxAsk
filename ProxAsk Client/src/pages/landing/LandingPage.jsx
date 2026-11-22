import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Sparkles, 
  Share2, 
  UserCheck, 
  ArrowRight, 
  HelpCircle, 
  Sun, 
  Moon, 
  Lock, 
  Users,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Card from '../../components/common/Card';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [interactiveQuestion, setInteractiveQuestion] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [demoSent, setDemoSent] = useState(false);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!interactiveQuestion.trim()) return;
    setDemoSent(true);
  };

  return (
    <div className="px-landing">
      {/* Top Navbar */}
      <header className="px-landing__header">
        <div className="px-landing__header-container">
          <Link to="/" className="px-landing__brand">
            <div className="px-landing__brand-badge font-mono">P</div>
            <span className="px-landing__brand-name">Prox<span className="px-landing__brand-accent">Ask</span></span>
          </Link>

          <nav className="px-landing__nav">
            <a href="#features" className="px-landing__nav-link">Features</a>
            <a href="#how-it-works" className="px-landing__nav-link">How It Works</a>
            <Link to="/explore" className="px-landing__nav-link">Explore</Link>
          </nav>

          <div className="px-landing__actions">
            <button
              type="button"
              className="px-landing__theme-toggle"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {isAuthenticated ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                rightIcon={<ArrowRight size={14} />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <div className="px-landing__auth-btns">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-landing__hero">
        <div className="px-landing__hero-container">
          <div className="px-landing__hero-badge-wrap">
            <Badge variant="orange" size="md" icon={<Sparkles size={12} />}>
              Privacy-First Social Q&amp;A
            </Badge>
          </div>

          <h1 className="px-landing__hero-title">
            Ask Freely. Answer Honestly. <br />
            <span className="px-landing__hero-gradient">Connect Authentically.</span>
          </h1>

          <p className="px-landing__hero-subtitle">
            ProxAsk gives you a personal space where friends, colleagues, and followers can ask you questions —
            anonymously or openly. Share your link, receive curious queries, and publish thoughtful answers.
          </p>

          <div className="px-landing__hero-ctas">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
              rightIcon={<ArrowRight size={16} />}
            >
              {isAuthenticated ? 'Open Feed' : 'Create Your Ask Page'}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/explore')}
              leftIcon={<Users size={16} />}
            >
              Discover People
            </Button>
          </div>

          {/* Interactive Hero Demo Card */}
          <div className="px-landing__demo-wrapper">
            <Card className="px-landing__demo-card">
              <div className="px-landing__demo-header">
                <div className="px-landing__demo-target">
                  <Avatar name="Sarah Connor" username="sarah" size="md" />
                  <div>
                    <div className="px-landing__demo-name">Sarah Connor</div>
                    <div className="px-landing__demo-username font-mono">@sarah</div>
                  </div>
                </div>
                <Badge variant={isAnonymous ? 'anonymous' : 'teal'}>
                  {isAnonymous ? '🔒 Anonymous Mode' : 'Public Mode'}
                </Badge>
              </div>

              {demoSent ? (
                <div className="px-landing__demo-success animate-fade-in">
                  <CheckCircle2 size={32} color="var(--brand-orange)" />
                  <p className="px-landing__demo-success-title">Question Delivered!</p>
                  <p className="px-landing__demo-success-desc">
                    In a real flow, Sarah receives this in her inbox and can publish her answer to her public feed.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => { setDemoSent(false); setInteractiveQuestion(''); }}>
                    Try Another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleDemoSubmit} className="px-landing__demo-form">
                  <textarea
                    className="px-textarea px-landing__demo-input"
                    rows={3}
                    placeholder="Ask Sarah anything... (e.g., What's the best advice you received early in your career?)"
                    value={interactiveQuestion}
                    onChange={(e) => setInteractiveQuestion(e.target.value)}
                  />

                  <div className="px-landing__demo-footer">
                    <label className="px-landing__demo-toggle">
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                      />
                      <span>Ask Anonymously</span>
                    </label>

                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!interactiveQuestion.trim()}
                    >
                      Send Question
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Pillars / Features */}
      <section id="features" className="px-landing__features">
        <div className="px-landing__section-container">
          <div className="px-landing__section-header">
            <Badge variant="teal" size="sm">Core Architecture</Badge>
            <h2 className="px-landing__section-title">Designed for Trust, Curated for Quality</h2>
            <p className="px-landing__section-desc">
              Every detail in ProxAsk is built to balance genuine curiosity with sender security and recipient control.
            </p>
          </div>

          <div className="px-landing__features-grid">
            <Card hoverable className="px-landing__feature-card">
              <div className="px-landing__feature-icon px-landing__feature-icon--orange">
                <Lock size={20} />
              </div>
              <h3 className="px-landing__feature-title">True Anonymous Privacy</h3>
              <p className="px-landing__feature-text">
                When you choose anonymous mode, your account identity is never recorded against the question.
                Speak openly without social friction.
              </p>
            </Card>

            <Card hoverable className="px-landing__feature-card">
              <div className="px-landing__feature-icon px-landing__feature-icon--teal">
                <Share2 size={20} />
              </div>
              <h3 className="px-landing__feature-title">Personal Ask Link</h3>
              <p className="px-landing__feature-text">
                Your profile URL is simple and memorable. Drop it in your bio or social stories to gather
                questions from anyone on the web.
              </p>
            </Card>

            <Card hoverable className="px-landing__feature-card">
              <div className="px-landing__feature-icon px-landing__feature-icon--orange">
                <UserCheck size={20} />
              </div>
              <h3 className="px-landing__feature-title">Verified Follow Graph</h3>
              <p className="px-landing__feature-text">
                Follow friends and creators to build your personal network. See real answers to real questions
                in an algorithm-free chronological stream.
              </p>
            </Card>

            <Card hoverable className="px-landing__feature-card">
              <div className="px-landing__feature-icon px-landing__feature-icon--teal">
                <Shield size={20} />
              </div>
              <h3 className="px-landing__feature-title">Full Recipient Control</h3>
              <p className="px-landing__feature-text">
                You decide what gets answered and what stays private. Delete questions anytime with a single
                click; you are always in control of your space.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-landing__steps">
        <div className="px-landing__section-container">
          <div className="px-landing__section-header">
            <Badge variant="orange" size="sm">Workflow</Badge>
            <h2 className="px-landing__section-title">How ProxAsk Works</h2>
          </div>

          <div className="px-landing__steps-grid">
            <div className="px-landing__step-item">
              <div className="px-landing__step-number font-mono">01</div>
              <h4 className="px-landing__step-title">Claim Your Handle</h4>
              <p className="px-landing__step-desc">
                Register with email verification and customize your profile bio, website, and avatar.
              </p>
            </div>

            <div className="px-landing__step-item">
              <div className="px-landing__step-number font-mono">02</div>
              <h4 className="px-landing__step-title">Share Your Link</h4>
              <p className="px-landing__step-desc">
                Copy your dedicated link and invite questions from friends, colleagues, or your audience.
              </p>
            </div>

            <div className="px-landing__step-item">
              <div className="px-landing__step-number font-mono">03</div>
              <h4 className="px-landing__step-title">Answer &amp; Share</h4>
              <p className="px-landing__step-desc">
                Review received queries, post detailed answers, and grow your audience and network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer banner */}
      <section className="px-landing__cta-banner">
        <div className="px-landing__section-container">
          <div className="px-landing__cta-box">
            <h2 className="px-landing__cta-title">Ready for Honest Conversations?</h2>
            <p className="px-landing__cta-desc">
              Join ProxAsk today. Start asking and receiving questions in seconds.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/signup')}
              rightIcon={<ArrowRight size={16} />}
            >
              Get Started for Free
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-landing__footer">
        <div className="px-landing__footer-container">
          <div className="px-landing__footer-brand">
            <span className="font-mono" style={{ color: 'var(--brand-orange)', fontWeight: 700 }}>PROXASK</span>
            <p className="px-landing__footer-copy">© {new Date().getFullYear()} ProxAsk. All rights reserved.</p>
          </div>
          <div className="px-landing__footer-links">
            <Link to="/explore">Explore</Link>
            <Link to="/login">Sign In</Link>
            <Link to="/signup">Register</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer">Open Source</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
