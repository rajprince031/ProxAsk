import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, HelpCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const homeRoute = isAuthenticated ? '/dashboard' : '/';
  const homeLabel = isAuthenticated ? 'Go to Dashboard' : 'Back to Home';

  return (
    <div className="px-notfound" data-testid="not-found-page">
      {/* Top Header */}
      <header className="px-notfound__header">
        <Link to={homeRoute} className="px-notfound__brand" aria-label="ProxAsk Home">
          <div className="px-notfound__badge font-mono">P</div>
          <span className="px-notfound__name">
            Prox<span className="px-notfound__accent">Ask</span>
          </span>
        </Link>

        <button
          type="button"
          className="px-notfound__theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </header>

      {/* Center Body */}
      <main className="px-notfound__body">
        <div className="px-notfound__card">
          <div className="px-notfound__code-badge font-mono">
            <HelpCircle size={14} />
            <span>404 ERROR</span>
          </div>

          <h1 className="px-notfound__title">Page Not Found</h1>
          <p className="px-notfound__desc">
            The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
          </p>

          <div className="px-notfound__actions">
            <Link
              to={homeRoute}
              className="px-notfound__btn px-notfound__btn--primary"
            >
              <Home size={16} />
              <span>{homeLabel}</span>
            </Link>

            <button
              type="button"
              className="px-notfound__btn px-notfound__btn--secondary"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(homeRoute);
                }
              }}
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
