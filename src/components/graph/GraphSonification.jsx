import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useGraphContext } from "../../context/GraphContext";
import { useInstruments } from "../../context/InstrumentsContext";
import { useDialog } from "../../context/DialogContext";
import { GLOBAL_FREQUENCY_RANGE, InstrumentFrequencyType } from "../../config/instruments";
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
  const { isEditFunctionDialogOpen } = useDialog();
  const instrumentsRef = useRef(new Map()); // Map to store instrument references
  const channelsRef = useRef(new Map()); // Map to store channel references
  const lastPitchClassesRef = useRef(new Map()); // Map to store last pitch class for discrete instruments
  const pinkNoiseRef = useRef(null); // Reference to pink noise synthesizer
  const [forceRecreate, setForceRecreate] = useState(false); // State to force recreation of sonification pipeline

  // Initialize pink noise synthesizer
  useEffect(() => {
    if (!pinkNoiseRef.current) {
      pinkNoiseRef.current = new Tone.Noise("pink").toDestination();
      pinkNoiseRef.current.volume.value = -36; // dB - low volume background sound
    }

    return () => {
      if (pinkNoiseRef.current) {
        pinkNoiseRef.current.dispose();
        pinkNoiseRef.current = null;
      }
    };
  }, []);

  // Initialize channels for all functions
  useEffect(() => {
    // Check if we need to force recreation of the entire pipeline
    if (forceRecreate) {
      console.log("Forcing recreation of channels");
      
      // Dispose all existing channels
      channelsRef.current.forEach(channel => {
        channel.dispose();
      });
      channelsRef.current.clear();
    }

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
  }, [functionDefinitions, forceRecreate]);

  // Manage instruments and their connections
  useEffect(() => {
    // Check if we need to force recreation of the entire pipeline
    if (forceRecreate) {
      console.log("Forcing recreation of sonification pipeline");
      
      // Dispose all existing instruments
      instrumentsRef.current.forEach(instrument => {
        if (instrument.dispose) {
          instrument.dispose();
        }
      });
      instrumentsRef.current.clear();
      
      // Clear last pitch classes
      lastPitchClassesRef.current.clear();
      
      // Reset the flag
      setForceRecreate(false);
    }

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
        const instrumentConfig = getInstrumentByName(getFunctionInstrumentN(functionDefinitions, functionIndex));
        if (instrumentConfig && instrumentConfig.createInstrument) {
          const instrument = instrumentConfig.createInstrument();
          instrumentsRef.current.set(func.id, instrument);
          
          // Connect to channel
          const channel = channelsRef.current.get(func.id);
          if (channel) {
            instrument.connect(channel);
            
            // Special case for organ
            if (getFunctionInstrumentN(functionDefinitions, functionIndex) === 'organ') {
              instrument.start();
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
  }, [functionDefinitions, getInstrumentByName, forceRecreate]);

  // Handle sound generation based on cursor positions
  useEffect(() => {
    // Pause sonification when edit dialog is open to prevent crashes from invalid functions
    if (isEditFunctionDialogOpen) {
      stopAllTones();
      stopPinkNoise();
      return;
    }

    if (!isAudioEnabled) {
      stopAllTones();
      stopPinkNoise();
      return;
    }

    const activeFunctions = getActiveFunctions(functionDefinitions);
    if (activeFunctions.length === 0) {
      stopPinkNoise();
      return;
    }

    // Create a map of function IDs to their cursor coordinates
    const coordsMap = new Map(cursorCoords.map(coord => [coord.functionId, coord]));

    // Check if any active function has a value below 0
    let hasNegativeValue = false;
    activeFunctions.forEach(func => {
      const coords = coordsMap.get(func.id);
      if (coords && parseFloat(coords.y) < 0) {
        hasNegativeValue = true;
      }
    });

    // Control pink noise based on negative values
    if (hasNegativeValue) {
      startPinkNoise();
    } else {
      stopPinkNoise();
    }

    // Process each active function
    activeFunctions.forEach(func => {
      try {
        const coords = coordsMap.get(func.id);
        const instrument = instrumentsRef.current.get(func.id);
        const channel = channelsRef.current.get(func.id);
        const functionIndex = getFunctionIndexById(functionDefinitions, func.id);
        const instrumentConfig = getInstrumentByName(getFunctionInstrumentN(functionDefinitions, functionIndex));
        
        if (instrument && channel && instrumentConfig) {
          if (coords) {
            if(parseFloat(coords.y) < graphBounds.yMin || parseFloat(coords.y) > graphBounds.yMax) {
              // If y coordinate is out of bounds, stop the sound
              // we should play an earcon here
              stopTone(func.id);
              return;
            }
            // We have coordinates for this function
            const pan = calculatePan(parseFloat(coords.x));
            
            if (instrumentConfig.instrumentType === InstrumentFrequencyType.discretePitchClassBased) {
              // Handle discrete pitch class-based sonification
              handleDiscreteSonification(func.id, parseFloat(coords.y), pan, instrumentConfig);
            } else {
              // Handle continuous frequency-based sonification
              const frequency = calculateFrequency(parseFloat(coords.y));
              if (frequency) {
                startTone(func.id, frequency, pan);
              } else {
                stopTone(func.id);
              }
            }
          } else {
            // No coordinates for this function, stop its sound
            stopTone(func.id);
          }
        }
      } catch (error) {
        console.warn(`Error processing function ${func.id} for sonification:`, error);
        // Stop the tone for this function to prevent further errors
        stopTone(func.id);
      }
    });

  }, [cursorCoords, isAudioEnabled, functionDefinitions, getInstrumentByName, isEditFunctionDialogOpen]);

  // Clean up sonification when edit dialog closes
  useEffect(() => {
    let timeoutId = null;
    
    if (!isEditFunctionDialogOpen && isAudioEnabled) {
      // When edit dialog closes, force recreation of the entire sonification pipeline
      console.log("Sonification resumed: Edit function dialog closed - forcing pipeline recreation");
      
      // Stop all current tones and clear references immediately
      stopAllTones();
      stopPinkNoise();
      
      // Force recreation with a small delay to ensure state updates are complete
      timeoutId = setTimeout(() => {
        setForceRecreate(true);
      }, 50);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isEditFunctionDialogOpen, isAudioEnabled]);

  const calculateFrequency = (y) => {
    if (y === null || y === undefined) return null;
    
    const normalizedY = (y - graphBounds.yMin)/(graphBounds.yMax-graphBounds.yMin);
    return GLOBAL_FREQUENCY_RANGE.min + normalizedY * (GLOBAL_FREQUENCY_RANGE.max - GLOBAL_FREQUENCY_RANGE.min);
  };

  const calculatePan = (x) => {
    if (x === null || x === undefined) return 0;
    const pan = -1 + 2*(x - graphBounds.xMin)/(graphBounds.xMax-graphBounds.xMin);
    if (pan > 1) return 1;
    if (pan < -1) return -1;
    return pan;
  };

  const handleDiscreteSonification = (functionId, y, pan, instrumentConfig) => {
    try {
      if (!instrumentConfig.availablePitchClasses || instrumentConfig.availablePitchClasses.length === 0) {
        return;
      }

      // Map y value to pitch class index
      const normalizedY = (y - graphBounds.yMin) / (graphBounds.yMax - graphBounds.yMin);
      const pitchClassIndex = Math.floor(normalizedY * instrumentConfig.availablePitchClasses.length);
      const clampedIndex = Math.max(0, Math.min(pitchClassIndex, instrumentConfig.availablePitchClasses.length - 1));
      const currentPitchClass = instrumentConfig.availablePitchClasses[clampedIndex];

      // Get the last pitch class for this function
      const lastPitchClass = lastPitchClassesRef.current.get(functionId);

      // Only trigger sound if pitch class has changed
      if (currentPitchClass !== lastPitchClass) {
        // Convert pitch class to frequency
        const frequency = Tone.Frequency(currentPitchClass).toFrequency();
        
        // Stop any current sound
        stopTone(functionId);
        
        // Start new sound
        startTone(functionId, frequency, pan);
        
        // Update the last pitch class
        lastPitchClassesRef.current.set(functionId, currentPitchClass);
      }
    } catch (error) {
      console.warn(`Error in discrete sonification for function ${functionId}:`, error);
      // Stop the tone for this function to prevent further errors
      stopTone(functionId);
    }
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
      
      // Ensure the start time is in the future to prevent "Start time must be strictly greater than previous start time" error
      const startTime = Math.max(now + offset, now + 0.001);
      
      try {
        instrument.triggerAttack(frequency, startTime);
        channel.pan.value = pan;
      } catch (error) {
        console.warn(`Error starting tone for function ${functionId}:`, error);
        // Fallback: try to start immediately
        try {
          instrument.triggerAttack(frequency);
          channel.pan.value = pan;
        } catch (fallbackError) {
          console.error(`Fallback error starting tone for function ${functionId}:`, fallbackError);
        }
      }
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

  const startPinkNoise = () => {
    if (pinkNoiseRef.current && pinkNoiseRef.current.state === "stopped") {
      pinkNoiseRef.current.start();
    }
  };

  const stopPinkNoise = () => {
    if (pinkNoiseRef.current && pinkNoiseRef.current.state === "started") {
      pinkNoiseRef.current.stop();
    }
  };

  // Add a visual indicator when sonification is paused during editing
  if (isEditFunctionDialogOpen && isAudioEnabled) {
    console.log("Sonification paused: Edit function dialog is open");
  }

  return null;
};

export default GraphSonification;