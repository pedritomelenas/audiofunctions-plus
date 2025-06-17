import React, { useEffect, useRef } from "react";
import * as Tone from "tone";
import { useGraphContext } from "../../context/GraphContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { 
  getActiveFunctions,
  getFunctionById,
  isFunctionActiveN,
  getFunctionInstrumentN,
  getFunctionIndexById
} from "../../utils/graphObjectOperations";

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
    functionDefinitions.forEach((func, index) => {
      const functionId = func.id;
      if (!channelsRef.current.has(functionId)) {
        const channel = new Tone.Channel({
          pan: 0,
          mute: !isFunctionActiveN(functionDefinitions, index),
          volume: 0
        }).toDestination();
        
        channelsRef.current.set(functionId, channel);
      } else {
        // Update existing channel's mute state
        const channel = channelsRef.current.get(functionId);
        if (channel) {
          channel.mute = !isFunctionActiveN(functionDefinitions, index);
        }
      }
    });

    // Clean up unused channels
    Array.from(channelsRef.current.keys()).forEach(functionId => {
      if (!getFunctionById(functionDefinitions, functionId)) {
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
    const activeFunctions = getActiveFunctions(functionDefinitions);
    
    // Clean up unused instruments
    Array.from(instrumentsRef.current.keys()).forEach(functionId => {
      if (!getFunctionById(functionDefinitions, functionId)) {
        if (instrumentsRef.current.get(functionId)) {
          instrumentsRef.current.get(functionId).dispose();
        }
        instrumentsRef.current.delete(functionId);
      }
    });

    // Set up instruments for active functions
    activeFunctions.forEach(func => {
      if (!instrumentsRef.current.has(func.id)) {
        const functionIndex = getFunctionIndexById(functionDefinitions, func.id);
        const instrument = getInstrumentByName(getFunctionInstrumentN(functionDefinitions, functionIndex));
        if (instrument) {
          instrumentsRef.current.set(func.id, instrument.instrument);
          
          // Connect to channel
          const channel = channelsRef.current.get(func.id);
          if (channel) {
            instrument.instrument.connect(channel);
            
            // Special case for organ
            if (getFunctionInstrumentN(functionDefinitions, functionIndex) === 'organ') {
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

  // Handle sound generation based on cursor positions
  useEffect(() => {
    if (!isAudioEnabled) {
      stopAllTones();
      return;
    }

    const activeFunctions = getActiveFunctions(functionDefinitions);
    if (activeFunctions.length === 0) return;

    // Create a map of function IDs to their cursor coordinates
    const coordsMap = new Map(cursorCoords.map(coord => [coord.functionId, coord]));

    // Process each active function
    activeFunctions.forEach(func => {
      const coords = coordsMap.get(func.id);
      const instrument = instrumentsRef.current.get(func.id);
      const channel = channelsRef.current.get(func.id);
      const functionIndex = getFunctionIndexById(functionDefinitions, func.id);
      const instrumentConfig = getInstrumentByName(getFunctionInstrumentN(functionDefinitions, functionIndex));
      
      if (instrument && channel && instrumentConfig) {
        if (coords) {
          // We have coordinates for this function
          const frequency = calculateFrequency(parseFloat(coords.y), instrumentConfig);
          const pan = calculatePan(parseFloat(coords.x));
          
          if (frequency) {
            startTone(func.id, frequency, pan);
          } else {
            stopTone(func.id);
          }
        } else {
          // No coordinates for this function, stop its sound
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