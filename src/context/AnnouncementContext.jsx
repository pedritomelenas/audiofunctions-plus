import React, { createContext, useContext, useState } from 'react';

const AnnouncementContext = createContext();

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncement must be used within an AnnouncementProvider');
  }
  return context;
};

export const AnnouncementProvider = ({ children }) => {
  const [announcement, setAnnouncement] = useState('');

  const announce = (message) => {
    setAnnouncement(message);
    // Clear announcement after delay to allow for new announcements
    setTimeout(() => setAnnouncement(''), 100);
  };

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      {children}
      
      {/* Global screenreader announcement region */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          left: '-10000px',
          width: '1px',
          height: '1px',
          overflow: 'hidden'
        }}
      >
        {announcement}
      </div>
    </AnnouncementContext.Provider>
  );
};