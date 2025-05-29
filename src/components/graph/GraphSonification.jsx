import React, { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useGraphContext } from "../../context/GraphContext";
import { useInstruments } from "../../context/InstrumentsContext";

const GraphSonification = () => {
  const { 
    cursorCoords, 
    isAudioEnabled, 
    graphBounds,
    functionDefinitions 
  } = useGraphContext();
  
  const { getInstrumentByName } = useInstruments();
  const instrumentsRef = useRef(new Map()); // Map to store instrument references
  const channelsRef = useRef(new Map()); // Map to store channel references

  // Initialize channels for all functions
  useEffect(() => {
    // Create or update channels for each function
    functionDefinitions.forEach(func => {
      const functionId = func.id;
      if (!channelsRef.current.has(functionId)) {
        const channel = new Tone.Channel({
          pan: 0,
          mute: !func.isActive,
          volume: 0
        }).toDestination();
        
        channelsRef.current.set(functionId, channel);
      } else {
        // Update existing channel's mute state
        const channel = channelsRef.current.get(functionId);
        if (channel) {
          channel.mute = !func.isActive;
        }
      }
    });

    // Clean up unused channels
    Array.from(channelsRef.current.keys()).forEach(functionId => {
      if (!functionDefinitions.find(func => func.id === functionId)) {
        if (channelsRef.current.get(functionId)) {
          channelsRef.current.get(functionId).dispose();
        }
        channelsRef.current.delete(functionId);
      }
    });

    return () => {
      channelsRef.current.forEach(channel => channel.dispose());
      channelsRef.current.clear();
    };
  }, [functionDefinitions]);

  // Manage instruments and their connections
  useEffect(() => {
    const activeFunctions = functionDefinitions.filter(func => func.isActive);
    
    // Clean up unused instruments
    Array.from(instrumentsRef.current.keys()).forEach(functionId => {
      if (!functionDefinitions.find(func => func.id === functionId)) {
        if (instrumentsRef.current.get(functionId)) {
          instrumentsRef.current.get(functionId).dispose();
        }
        instrumentsRef.current.delete(functionId);
      }
    });

    // Set up instruments for active functions
    activeFunctions.forEach(func => {
      if (!instrumentsRef.current.has(func.id)) {
        const instrument = getInstrumentByName(func.instrument);
        if (instrument) {
          instrumentsRef.current.set(func.id, instrument.instrument);
          
          // Connect to channel
          const channel = channelsRef.current.get(func.id);
          if (channel) {
            instrument.instrument.connect(channel);
            
            // Special case for organ
            if (func.instrument === 'organ') {
              instrument.instrument.start();
            }
          }
        }
      }
    });

    Tone.start();

    return () => {
      instrumentsRef.current.forEach(instrument => {
        if (instrument.dispose) {
          instrument.dispose();
        }
      });
      instrumentsRef.current.clear();
    };
  }, [functionDefinitions, getInstrumentByName]);

  // Handle sound generation based on cursor position
  useEffect(() => {
    if (!isAudioEnabled) {
      stopAllTones();
      return;
    }

    const activeFunctions = functionDefinitions.filter(func => func.isActive);
    if (activeFunctions.length === 0) return;

    const { x, y } = cursorCoords;
    const pan = calculatePan(x);

    activeFunctions.forEach(func => {
      const instrument = instrumentsRef.current.get(func.id);
      const channel = channelsRef.current.get(func.id);
      const instrumentConfig = getInstrumentByName(func.instrument);
      
      if (instrument && channel && instrumentConfig) {
        const frequency = calculateFrequency(y, instrumentConfig);
        if (frequency) {
          startTone(func.id, frequency, pan);
        } else {
          stopTone(func.id);
        }
      }
    });

  }, [cursorCoords, isAudioEnabled, functionDefinitions, getInstrumentByName]);

  const calculateFrequency = (y, instrumentConfig) => {
    if (y === null || y === undefined || !instrumentConfig) return null;
    
    const { frequencyRange } = instrumentConfig;
    const normalizedY = (y - graphBounds.yMin)/(graphBounds.yMax-graphBounds.yMin);
    return frequencyRange.min + normalizedY * (frequencyRange.max - frequencyRange.min);
  };

  const calculatePan = (x) => {
    if (x === null || x === undefined) return 0;
    const pan = -1 + 2*(x - graphBounds.xMin)/(graphBounds.xMax-graphBounds.xMin);
    if (pan > 1) return 1;
    if (pan < -1) return -1;
    return pan;
  };

  const startTone = (functionId, frequency, pan) => {
    const instrument = instrumentsRef.current.get(functionId);
    const channel = channelsRef.current.get(functionId);
    
    if (instrument && channel) {
      // Get the current time from Tone.js
      const now = Tone.now();
      
      // Add a tiny offset based on the functionId to prevent simultaneous triggers
      // Using the last character of functionId to create a small offset
      const offset = parseInt(functionId.slice(-1), 10) * 0.01;
      
      instrument.triggerAttack(frequency, now + offset);
      channel.pan.value = pan;
    }
  };

  const stopTone = (functionId) => {
    const instrument = instrumentsRef.current.get(functionId);
    if (instrument) {
      instrument.triggerRelease();
    }
  };

  const stopAllTones = () => {
    instrumentsRef.current.forEach((instrument, functionId) => {
      stopTone(functionId);
    });
  };

  return null;
};

export default GraphSonification;