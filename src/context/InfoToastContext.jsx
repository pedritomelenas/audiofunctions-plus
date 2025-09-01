import React, { createContext, useContext, useState } from 'react';
import InfoToast from '../components/ui/dialogs/InfoToast';

const InfoToastContext = createContext();

export const useInfoToast = () => {
  const context = useContext(InfoToastContext);
  if (!context) {
    throw new Error('useInfoToast must be used within an InfoToastProvider');
  }
  return context;
};

export const InfoToastProvider = ({ children }) => {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [timeout, setToastTimeout] = useState(10000);

  const showInfoToast = (message, timeout = 10000) => {
    setMessage(message);
    setToastTimeout(timeout);
    setIsVisible(true);
  };

  const hideInfoToast = () => {
    setIsVisible(false);
  };

  return (
    <InfoToastContext.Provider value={{ showInfoToast, hideInfoToast }}>
      {children}
      <InfoToast 
        message={message}
        isVisible={isVisible}
        onClose={hideInfoToast}
        timeout={timeout}
      />
    </InfoToastContext.Provider>
  );
};