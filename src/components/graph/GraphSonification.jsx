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
import audioSampleManager from "../../utils/audioSamples";

const GraphSonification = () => {
  const { 
    cursorCoords, 
    isAudioEnabled, 
    graphBounds,
    functionDefinitions 
  } = useGraphContext();
  
  // Refs to track previous states for event detection
  const prevCursorCoordsRef = useRef(new Map()); // Track previous cursor positions
  const prevXSignRef = useRef(new Map()); // Track previous x coordinate signs for y-axis intersection
  const boundaryTriggeredRef = useRef(new Map()); // Track if boundary event was recently triggered to avoid spam
  const yAxisTriggeredRef = useRef(new Map()); // Track if y-axis intersection was recently triggered
  const prevBoundaryStateRef = useRef(new Map()); // Track previous boundary state for each function
  
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

  // Initialize audio sample manager only
  useEffect(() => {
    const initializeAudioSampleManager = async () => {
      try {
        // Wait for Tone.js to be fully initialized
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await audioSampleManager.initialize();
        console.log("Audio sample manager initialized (samples will load on-demand)");
      } catch (error) {
        console.error("Failed to initialize audio sample manager:", error);
      }
    };

    initializeAudioSampleManager();

    return () => {
      // Cleanup audio sample manager
      audioSampleManager.dispose();
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
            // Check for chart boundary events
            checkChartBoundaryEvents(func.id, coords).catch(error => 
              console.warn(`Error in chart boundary event check for function ${func.id}:`, error)
            );
            
            // Check for y-axis intersection events
            checkYAxisIntersectionEvents(func.id, coords).catch(error => 
              console.warn(`Error in y-axis intersection event check for function ${func.id}:`, error)
            );
            
            // Check for discontinuity/NaN events
            checkDiscontinuityEvents(func.id, coords).catch(error => 
              console.warn(`Error in discontinuity event check for function ${func.id}:`, error)
            );
            
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
              handleDiscreteSonification(func.id, parseFloat(coords.y), pan, instrumentConfig, coords.mouseY);
            } else {
              // Handle continuous frequency-based sonification
              const frequency = calculateFrequency(parseFloat(coords.y));
              if (frequency) {
                startTone(func.id, frequency, pan, coords.mouseY);
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

  // Clean up tracking refs when functions change
  useEffect(() => {
    // Clean up tracking refs for functions that no longer exist
    const currentFunctionIds = new Set(functionDefinitions.map(func => func.id));
    
    // Clean up prevCursorCoordsRef
    Array.from(prevCursorCoordsRef.current.keys()).forEach(functionId => {
      if (!currentFunctionIds.has(functionId)) {
        prevCursorCoordsRef.current.delete(functionId);
      }
    });
    
    // Clean up prevXSignRef
    Array.from(prevXSignRef.current.keys()).forEach(functionId => {
      if (!currentFunctionIds.has(functionId)) {
        prevXSignRef.current.delete(functionId);
      }
    });
    
    // Clean up boundaryTriggeredRef (now handles boundary-specific keys)
    Array.from(boundaryTriggeredRef.current.keys()).forEach(key => {
      const functionId = key.split('_')[0]; // Extract functionId from boundary key
      if (!currentFunctionIds.has(functionId)) {
        boundaryTriggeredRef.current.delete(key);
      }
    });
    
    // Clean up prevBoundaryStateRef
    Array.from(prevBoundaryStateRef.current.keys()).forEach(functionId => {
      if (!currentFunctionIds.has(functionId)) {
        prevBoundaryStateRef.current.delete(functionId);
      }
    });
    
    // Clean up yAxisTriggeredRef
    Array.from(yAxisTriggeredRef.current.keys()).forEach(functionId => {
      if (!currentFunctionIds.has(functionId)) {
        yAxisTriggeredRef.current.delete(functionId);
      }
    });
  }, [functionDefinitions]);

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

  const calculateVolume = (functionY, mouseY, graphBounds) => {
    if (mouseY === null || mouseY === undefined) {
      return 0; // Default volume when no mouse Y is available
    }
    
    // Calculate distance between function value and mouse Y
    const distance = Math.abs(functionY - mouseY);
    const maxDistance = graphBounds.yMax - graphBounds.yMin;
    
    // Normalize distance (0 = on the function, 1 = maximum distance)
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    // Convert to volume: closer = louder, farther = quieter
    // Use a less steep curve for discrete sonification - linear instead of exponential
    const volume = 1 - normalizedDistance;
    
    // Convert to dB: volume of 1 = 0 dB (full volume), volume of 0 = -30 dB (quieter but not silent)
    const volumeDB = (volume - 1) * 30;
    
    return volumeDB;
  };

  const handleDiscreteSonification = (functionId, y, pan, instrumentConfig, mouseY) => {
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
        
        // Start new sound with the actual function Y value for volume calculation
        startTone(functionId, frequency, pan, mouseY, y);
        
        // Update the last pitch class
        lastPitchClassesRef.current.set(functionId, currentPitchClass);
      }
    } catch (error) {
      console.warn(`Error in discrete sonification for function ${functionId}:`, error);
      // Stop the tone for this function to prevent further errors
      stopTone(functionId);
    }
  };

  const startTone = (functionId, frequency, pan, mouseY = null, functionY = null) => {
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
        
        // Apply volume control based on mouse distance (only when mouseY is available)
        if (mouseY !== null && mouseY !== undefined) {
          // Use provided functionY if available (for discrete sonification), otherwise calculate from frequency
          const actualFunctionY = functionY !== null ? functionY : (frequency - GLOBAL_FREQUENCY_RANGE.min) / (GLOBAL_FREQUENCY_RANGE.max - GLOBAL_FREQUENCY_RANGE.min) * (graphBounds.yMax - graphBounds.yMin) + graphBounds.yMin;
          const volumeDB = calculateVolume(actualFunctionY, parseFloat(mouseY), graphBounds);
          channel.volume.value = volumeDB;
        } else {
          // Reset to default volume when no mouse Y is available
          channel.volume.value = 0;
        }
      } catch (error) {
        console.warn(`Error starting tone for function ${functionId}:`, error);
        // Fallback: try to start immediately
        try {
          instrument.triggerAttack(frequency);
          channel.pan.value = pan;
          
          // Apply volume control in fallback as well
          if (mouseY !== null && mouseY !== undefined) {
            // Use provided functionY if available (for discrete sonification), otherwise calculate from frequency
            const actualFunctionY = functionY !== null ? functionY : (frequency - GLOBAL_FREQUENCY_RANGE.min) / (GLOBAL_FREQUENCY_RANGE.max - GLOBAL_FREQUENCY_RANGE.min) * (graphBounds.yMax - graphBounds.yMin) + graphBounds.yMin;
            const volumeDB = calculateVolume(actualFunctionY, parseFloat(mouseY), graphBounds);
            channel.volume.value = volumeDB;
          } else {
            channel.volume.value = 0;
          }
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

  // Event detection functions
  const checkChartBoundaryEvents = async (functionId, coords) => {
    const x = parseFloat(coords.x);
    const y = parseFloat(coords.y);
    const tolerance = 0.02; // Same tolerance as in GraphView
    
    // Check if cursor is at any of the four boundaries (cursor is clamped, so it can't go beyond)
    const isAtLeftBoundary = Math.abs(x - (graphBounds.xMin + tolerance)) < 0.001;
    const isAtRightBoundary = Math.abs(x - (graphBounds.xMax - tolerance)) < 0.001;
    const isAtBottomBoundary = Math.abs(y - (graphBounds.yMin + tolerance)) < 0.001;
    const isAtTopBoundary = Math.abs(y - (graphBounds.yMax - tolerance)) < 0.001;
    
    // Get previous boundary state for this function
    const prevState = prevBoundaryStateRef.current.get(functionId) || {
      left: false, right: false, bottom: false, top: false
    };
    
    // Create a boundary key for this specific boundary
    let boundaryKey = null;
    if (isAtLeftBoundary) boundaryKey = `${functionId}_left`;
    else if (isAtRightBoundary) boundaryKey = `${functionId}_right`;
    else if (isAtBottomBoundary) boundaryKey = `${functionId}_bottom`;
    else if (isAtTopBoundary) boundaryKey = `${functionId}_top`;
    
    console.log(`Boundary check for function ${functionId}: boundaryKey=${boundaryKey}, x=${x}, y=${y}, prevState=`, prevState);
    
    if (boundaryKey) {
      // Check if we haven't recently triggered this specific boundary to avoid spam
      const lastTriggered = boundaryTriggeredRef.current.get(boundaryKey);
      const now = Date.now();
      
      if (!lastTriggered || (now - lastTriggered) > 200) { // 200ms cooldown for responsive feedback
        await playAudioSample("chart_border", { volume: -15 });
        boundaryTriggeredRef.current.set(boundaryKey, now);
        console.log(`Chart boundary event triggered for function ${functionId} at boundary: ${boundaryKey}`);
      }
    }
    
    // Update the previous boundary state
    prevBoundaryStateRef.current.set(functionId, {
      left: isAtLeftBoundary,
      right: isAtRightBoundary,
      bottom: isAtBottomBoundary,
      top: isAtTopBoundary
    });
  };

  const checkYAxisIntersectionEvents = async (functionId, coords) => {
    const x = parseFloat(coords.x);
    const prevXSign = prevXSignRef.current.get(functionId);
    const currentXSign = Math.sign(x);
    
    // Check if we crossed the y-axis (x coordinate sign changed)
    // Only trigger if we have a valid previous sign (not null/undefined) and signs are different
    if (prevXSign !== null && prevXSign !== undefined && prevXSign !== currentXSign && currentXSign !== 0) {
      const lastTriggered = yAxisTriggeredRef.current.get(functionId);
      const now = Date.now();
      
      if (!lastTriggered || (now - lastTriggered) > 300) { // 300ms cooldown
        await playAudioSample("y_axis_intersection", { volume: -12 });
        yAxisTriggeredRef.current.set(functionId, now);
        console.log(`Y-axis intersection event triggered for function ${functionId}`);
      }
    }
    
    // Update the previous x sign
    prevXSignRef.current.set(functionId, currentXSign);
  };

  const checkDiscontinuityEvents = async (functionId, coords) => {
    const y = parseFloat(coords.y);
    
    // Check if the function value is NaN, undefined, null, or infinite (discontinuity)
    if (isNaN(y) || y === undefined || y === null || !isFinite(y)) {
      // Check if we haven't recently triggered this event to avoid spam
      const lastTriggered = boundaryTriggeredRef.current.get(`${functionId}_discontinuity`);
      const now = Date.now();
      
      if (!lastTriggered || (now - lastTriggered) > 200) { // 200ms cooldown for discontinuities
        await playAudioSample("no_y", { volume: -10 });
        boundaryTriggeredRef.current.set(`${functionId}_discontinuity`, now);
        console.log(`Discontinuity event triggered for function ${functionId} at x=${coords.x}, y=${y}`);
      }
    }
  };

  // Helper function to play audio samples
  const playAudioSample = async (sampleName, options = {}) => {
    try {
      await audioSampleManager.playSample(sampleName, options);
    } catch (error) {
      console.warn(`Failed to play audio sample ${sampleName}:`, error);
    }
  };

  // Example function to demonstrate how to play samples during sonification
  // You can call this function when specific events occur
  const triggerSampleEvent = async (eventType) => {
    try {
      switch (eventType) {
        case 'chart_border':
          await playAudioSample('chart_border', { volume: -15 });
          break;
        case 'no_y':
          await playAudioSample('no_y', { volume: -10 });
          break;
        case 'y_axis_intersection':
          await playAudioSample('y_axis_intersection', { volume: -12 });
          break;
        default:
          console.log(`Unknown event type: ${eventType}`);
      }
    } catch (error) {
      console.warn(`Failed to trigger sample event ${eventType}:`, error);
    }
  };

  return null;
};

export default GraphSonification;