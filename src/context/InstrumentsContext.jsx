import React, { createContext, useContext, useState, useEffect } from 'react';
import { createInstruments } from '../config/instruments';

const InstrumentsContext = createContext();

export const useInstruments = () => {
  const context = useContext(InstrumentsContext);
  if (!context) {
    throw new Error('useInstruments must be used within an InstrumentsProvider');
  }
  return context;
};

export const InstrumentsProvider = ({ children }) => {
  const [availableInstruments, setAvailableInstruments] = useState([]);

  useEffect(() => {
    // Initialize available instruments
    const instruments = createInstruments();
    setAvailableInstruments(instruments);
  }, []);

  const getInstrumentByName = (name) => {
    return availableInstruments.find(inst => inst.name === name);
  };

  return (
    <InstrumentsContext.Provider 
      value={{ 
        availableInstruments,
        getInstrumentByName
      }}
    >
      {children}
    </InstrumentsContext.Provider>
  );
}; 