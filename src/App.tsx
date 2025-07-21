import React, { useState, useEffect } from 'react';
import { CourtProvider } from './context/CourtContext';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { OverviewPage } from './pages/OverviewPage';
import { PlayingPage } from './pages/PlayingPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Notification system for 5-minute warnings
  useEffect(() => {
    const checkNotifications = () => {
      const now = new Date();
      const minutes = now.getMinutes();
      
      // Check at :55 of each hour for 5-minute warnings
      if (minutes === 55) {
        // In a real application, you would check for upcoming bookings
        // and show notifications. For demo purposes, we'll just log.
        console.log('Checking for upcoming sessions...');
      }
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'overview':
        return <OverviewPage />;
      case 'playing':
        return <PlayingPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <CourtProvider>
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
        <main>
          {renderCurrentPage()}
        </main>
      </div>
    </CourtProvider>
  );
}

export default App;