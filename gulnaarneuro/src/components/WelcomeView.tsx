import React, { useEffect } from 'react';
import { useNavigate, routes } from '../utils/router';
import { APP_CONFIG } from '../data/config';
import { hasWelcomed, setWelcomed } from '../utils/storage';

export const WelcomeView: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // If the user has already entered before, redirect them straight to dashboard to keep it friction-free
    if (hasWelcomed()) {
      navigate(routes.dashboard());
    }
  }, [navigate]);

  const handleStart = () => {
    setWelcomed();
    navigate(routes.dashboard());
  };

  return (
    <div className="welcome">
      <h1 className="welcome__name">{APP_CONFIG.welcomeGreeting}</h1>
      <p className="welcome__tagline">{APP_CONFIG.welcomeTagline}</p>
      <p className="welcome__message">{APP_CONFIG.welcomeMessage}</p>
      <div className="welcome__cta">
        <button className="btn btn--primary btn--lg" onClick={handleStart}>
          {APP_CONFIG.welcomeCTA}
        </button>
      </div>
    </div>
  );
};
