import React, { createContext, useContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('proxask_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('proxask_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'light' || newTheme === 'dark') {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme: setSpecificTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
