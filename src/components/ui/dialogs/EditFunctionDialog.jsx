import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Delete, Music, Wind, Zap, Guitar } from "lucide-react";
import { useGraphContext } from "../../../context/GraphContext";
import { useInstruments } from "../../../context/InstrumentsContext"; // Add this import
import { 
  getFunctionCount, 
  getFunctionStringN, 
  getFunctionTypeN,
  getFunctionInstrumentN,
  addFunction,
  removeFunctionN,
  updateFunctionN,
  isFunctionActiveN,
  setFunctionInstrumentN // Add this import
} from "../../../utils/graphObjectOperations";

import {separatingCommas } from "../../../utils/parse.js";

const EditFunctionDialog = ({ isOpen, onClose }) => {
  const { functionDefinitions, setFunctionDefinitions, graphSettings } = useGraphContext();
  const functionDefinitionsBackup = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [focusAfterAction, setFocusAfterAction] = useState(null);

  // Check if dialog should be read-only
  const isReadOnly = graphSettings?.restrictionMode === "read-only";

  // Generate unique ID for new functions
  const generateUniqueId = () => {
    const existingIds = (functionDefinitions || []).map(f => f.id);
    let counter = 1;
    while (existingIds.includes(`f${counter}`)) {
      counter++;
    }
    return `f${counter}`;
  };

  // Announce status changes to screen readers
  const announceStatus = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const addFunctionContainer = () => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    const newFunction = {
      id: generateUniqueId(),
      functionName: `Function ${getFunctionCount(functionDefinitions) + 1}`,
      type: "function",
      functionString: "",
      isActive: true,
      instrument: "clarinet",
      pointOfInterests: [],
      landmarks: []
    };
    
    // Deactivate all existing functions and add the new active function
    const updatedDefinitions = (functionDefinitions || []).map(func => ({ ...func, isActive: false }));
    setFunctionDefinitions(addFunction(updatedDefinitions, newFunction));
    
    announceStatus(`New function added. Total functions: ${getFunctionCount(functionDefinitions) + 1}`);
    setFocusAfterAction(`function-${getFunctionCount(functionDefinitions)}`);
  };

  const addPiecewiseFunctionContainer = () => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    const newFunction = {
      id: generateUniqueId(),
      functionName: `Function ${getFunctionCount(functionDefinitions) + 1}`,
      type: "piecewise_function",
      functionString: "[[,]]",
      isActive: true,
      instrument: "clarinet",
      pointOfInterests: [],
      landmarks: []
    };
    
    // Deactivate all existing functions and add the new active function
    const updatedDefinitions = (functionDefinitions || []).map(func => ({ ...func, isActive: false }));
    setFunctionDefinitions(addFunction(updatedDefinitions, newFunction));
    
    announceStatus(`New piecewise function added. Total functions: ${getFunctionCount(functionDefinitions) + 1}`);
    setFocusAfterAction(`piecewise-function-${getFunctionCount(functionDefinitions)}-part-0-function`);
  };

  const removeContainer = (index) => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    const functionType = getFunctionTypeN(functionDefinitions, index) === 'piecewise_function' ? 'piecewise function' : 'function';
    const wasActive = isFunctionActiveN(functionDefinitions, index);
    
    // Remove the function first
    let updatedDefinitions = removeFunctionN(functionDefinitions, index);
    
    // If the removed function was active and there are still functions left, activate another one
    if (wasActive && updatedDefinitions.length > 0) {
      // Prefer the function that was before the deleted one, or the first one if we deleted index 0
      const newActiveIndex = index > 0 ? index - 1 : 0;
      // Make sure the index is valid after removal
      const targetIndex = Math.min(newActiveIndex, updatedDefinitions.length - 1);
      
      updatedDefinitions = updatedDefinitions.map((func, i) => ({
        ...func,
        isActive: i === targetIndex
      }));
    }
    
    setFunctionDefinitions(updatedDefinitions);
    
    announceStatus(`${functionType} ${index + 1} deleted. Remaining functions: ${updatedDefinitions.length}`);
  };

  const updateFunctionString = (index, newFunctionString) => {
    if (isReadOnly) return; // Prevent action in read-only mode
    setFunctionDefinitions(updateFunctionN(functionDefinitions, index, { functionString: newFunctionString }));
  };
  // Focus management
  useEffect(() => {
    if (focusAfterAction) {
      const element = document.getElementById(focusAfterAction);
      if (element) {
        element.focus();
      }
      setFocusAfterAction(null);
    }
  }, [focusAfterAction, functionDefinitions]);
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape: Close dialog (cancel)
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      functionDefinitionsBackup.current = functionDefinitions; // backup current function definitions
      console.log("Open: ", functionDefinitionsBackup.current);
      if (isReadOnly) {
        announceStatus(`Edit functions dialog opened in read-only mode. ${getFunctionCount(functionDefinitions)} functions available for viewing.`);
      } else {
        announceStatus(`Edit functions dialog opened. ${getFunctionCount(functionDefinitions)} functions available.`);
      }
    }
  }, [isOpen, isReadOnly]);

  const handleCancel = () => {
    console.log("Cancel: ", functionDefinitionsBackup.current);
    if (functionDefinitionsBackup.current !== null) {
      setFunctionDefinitions(functionDefinitionsBackup.current); // restore old function definitions
    }
    onClose();
  };  return (
    <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
          <div className="p-6 pb-4">
            <DialogTitle id="dialog-title" className="text-lg font-bold text-titles">
              {isReadOnly ? "View functions" : "Edit functions"}
            </DialogTitle>
            <Description id="dialog-description" className="text-descriptions">
              {isReadOnly ? "View active and inactive functions in read-only mode." : "Edit active and inactive functions. Press Enter to save and close."}
            </Description>
          </div>
          
          {/* Live region for status announcements */}
          <div 
            aria-live="polite" 
            aria-atomic="true" 
            className="sr-only"
            role="status"
          >
            {statusMessage}
          </div>

          <div className="flex-1 overflow-y-auto px-6" role="main" aria-label="Function list">
            {(functionDefinitions || []).length === 0 && (
              <div className="text-center py-8 text-descriptions">
                {isReadOnly ? "No functions defined." : "No functions defined. Click \"Add function\" or \"Add piecewise function\" to create your first function."}
              </div>
            )}            {(functionDefinitions || []).map((functionDef, index) => (
              getFunctionTypeN(functionDefinitions, index) === 'piecewise_function' ? (
                <PiecewiseFunctionContainer
                  key={functionDef.id}
                  index={index}
                  value={getFunctionStringN(functionDefinitions, index)}
                  instrument={getFunctionInstrumentN(functionDefinitions, index)}
                  onChange={(newValue) => updateFunctionString(index, newValue)}
                  onDelete={() => removeContainer(index)}
                  onAccept={onClose}
                  isReadOnly={isReadOnly}
                />
              ) : (
                <FunctionContainer
                  key={functionDef.id}
                  index={index}
                  value={getFunctionStringN(functionDefinitions, index)}
                  instrument={getFunctionInstrumentN(functionDefinitions, index)}
                  onChange={(newValue) => updateFunctionString(index, newValue)}
                  onDelete={() => removeContainer(index)}
                  onAccept={onClose}
                  isReadOnly={isReadOnly}
                />
              )
            ))}
          </div>

          <div className="px-6 py-4" role="group" aria-label="Dialog actions">
            {!isReadOnly && (
              <div className="flex gap-2 mb-4" role="group" aria-label="Add new functions">
                <button
                  onClick={addFunctionContainer}
                  className="btn-neutral flex-1"
                  aria-label="Add regular function"
                >
                  Add regular function
                </button>
                <button
                  onClick={addPiecewiseFunctionContainer}
                  className="btn-neutral flex-1"
                  aria-label="Add piecewise function"
                >
                  Add piecewise function
                </button>
              </div>
            )}
            <div className="flex justify-end items-center gap-2" role="group" aria-label="Dialog controls">
              <button
                onClick={handleCancel}
                className="btn-secondary sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={onClose}
                className="btn-primary sm:w-auto"
              >
                Accept
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

// Helper function to get instrument icon
const getInstrumentIcon = (instrumentName) => {
  switch (instrumentName) {
    case 'clarinet':
      return <Music className="w-4 h-4 text-icon" aria-hidden="true" />;
    case 'flute':
      return <Wind className="w-4 h-4 text-icon" aria-hidden="true" />;
    case 'organ':
      return <Zap className="w-4 h-4 text-icon" aria-hidden="true" />;
    case 'guitar':
      return <Guitar className="w-4 h-4 text-icon" aria-hidden="true" />;
    default:
      return <Music className="w-4 h-4 text-icon" aria-hidden="true" />;
  }
};

const FunctionContainer = ({ index, value, instrument, onChange, onDelete, onAccept, isReadOnly }) => {
  const { functionDefinitions, setFunctionDefinitions, inputErrors } = useGraphContext();
  const { availableInstruments } = useInstruments();
  
  const functionId = functionDefinitions[index]?.id;
  const errorInfo = inputErrors[functionId];
  
  const hasError = functionId && errorInfo;
  const errorMessage = errorInfo?.message;
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      // Call the accept function directly
      if (onAccept) {
        onAccept();
      }
    }
  };

  const handleFocus = () => {
    if (isReadOnly) return; // Prevent focus changes in read-only mode
    // Set this function as active when its input is focused
    const updatedDefinitions = functionDefinitions.map((func, i) => ({
      ...func,
      isActive: i === index
    }));
    setFunctionDefinitions(updatedDefinitions);
  };

  const handleInstrumentChange = (e) => {    
    e.stopPropagation(); // Prevent triggering other events
    
    const currentInstrument = instrument || "clarinet"; // Default to clarinet
    
    // Only allow switching between clarinet and guitar
    // If current instrument is not clarinet or guitar, default to guitar
    let nextInstrument;
    if (currentInstrument === "clarinet") {
      nextInstrument = "guitar";
    } else {
      // For any other instrument (including guitar), switch to clarinet
      nextInstrument = "clarinet";
    }

    console.log(`Changing instrument for function ${index + 1} from ${currentInstrument} to ${nextInstrument}`);
    
    const updatedDefinitions = setFunctionInstrumentN(functionDefinitions, index, nextInstrument);
    setFunctionDefinitions(updatedDefinitions);
  };

  const handleInstrumentKeyDown = (e) => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleInstrumentChange(e);
    }
  };

  return (
    <div 
      className={`mb-4 ${isReadOnly ? 'opacity-60' : ''}`} 
      role="group" 
      aria-labelledby={`function-${index}-label`}
    >
      <label
        id={`function-${index}-label`}
        htmlFor={`function-${index}`}
        className="block text-sm font-medium text-descriptions"
      >
        Function {index + 1}
      </label>
      
      <div className="mt-2">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div 
              className={`text-input-outer ${hasError ? 'error-border error-input' : ''}`}
              aria-errormessage={hasError ? `function-${index}-error` : undefined}
            >
              <div className="text-input-label " aria-hidden="true">f(x)=</div>
              <input
                id={`function-${index}`}
                type="text"
                placeholder="e.g., x^2 + 2*x - 1"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                className="text-input-inner flex-1"
                aria-description={isReadOnly ? "Mathematical expression. Read-only mode active." : "Mathematical expression."}
                readOnly={isReadOnly}
                tabIndex={0}
                aria-invalid={hasError ? 'true' : 'false'}
                aria-errormessage={hasError ? `function-${index}-error` : undefined}
              />
            </div>
          </div>

          {/* Control buttons - only show in edit mode */}
          {!isReadOnly && (
          <div className="flex gap-2 flex-shrink-0" role="group" aria-label={`Function ${index + 1} actions`}>
              <button
                type="button"
                className="btn-neutral"
                onClick={handleInstrumentChange}
                onKeyDown={handleInstrumentKeyDown}
                aria-label={`Change instrument for function ${index + 1}. Current instrument: ${instrument}. Click to cycle to next instrument.`}
                title={`Change instrument for function ${index + 1}. Current: ${instrument}`}
              >
                {getInstrumentIcon(instrument)}
                <span className="sr-only">{instrument}</span>
              </button>
              <button
                type="button"
                className="btn-neutral"
                aria-label={`Delete function ${index + 1}`}
                onClick={onDelete}
              >
                <Delete className="w-4 h-4 text-icon" aria-hidden="true" />
              </button>
            </div>
          )}
      </div>

        {/* Error display for regular functions */}
        {hasError && (
          <div 
            id={`function-${index}-error`}
            className="error-message"
            role="alert"
            aria-live="polite"
          >
            <span className="error-icon" aria-hidden="true">⚠️</span>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

// Add this helper function to parse error positions for piecewise functions
const parseErrorPosition = (errPos) => {
  if (!errPos) return null;
  
  // errPos can be a number (for general errors) or array like [partIndex, fieldIndex] for piecewise errors
  if (typeof errPos === 'number') {
    return { general: true, position: errPos };
  }
  
  if (Array.isArray(errPos)) {
    // For piecewise functions: [partIndex, fieldIndex] where fieldIndex 0=function, 1=condition
    if (errPos.length === 2) {
      return { 
        general: false, 
        partIndex: errPos[0], 
        fieldIndex: errPos[1],
        fieldType: errPos[1] === 0 ? 'function' : 'condition'
      };
    }
  }
  
  return null;
};

// Enhanced error display component for piecewise functions
const PiecewiseErrorDisplay = ({ functionId, errorMessage, errorPosition, parts }) => {
  const parsedError = parseErrorPosition(errorPosition);
  
  if (!errorMessage) return null;

  // General error affecting the whole piecewise function
  if (!parsedError || parsedError.general) {
    return (
      <div 
        className="error-message mt-2"
        role="alert"
        aria-live="polite"
      >
        <span className="error-icon" aria-hidden="true">⚠️</span>
        {errorMessage}
      </div>
    );
  }

  // Specific error for a part of the piecewise function
  const { partIndex, fieldType } = parsedError;
  const partNumber = partIndex + 1;
  
  return (
    <div 
      className="error-message mt-2"
      role="alert"
      aria-live="polite"
    >
      <span className="error-icon" aria-hidden="true">⚠️</span>
      <strong>Part {partNumber} ({fieldType}):</strong> {errorMessage}
    </div>
  );
};

const PiecewiseFunctionContainer = ({ index, value, instrument, onChange, onDelete, onAccept, isReadOnly }) => {
  const { functionDefinitions, setFunctionDefinitions, inputErrors } = useGraphContext();
  const { availableInstruments } = useInstruments();
  const needsUpdateRef = useRef(false);
  
  // Get error information for this function
  const functionId = functionDefinitions[index]?.id;
  const errorInfo = inputErrors[functionId];
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("Piecewise error info:", errorInfo);
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  
  // For piecewise functions, errorInfo is an object with message and position
  const errorMessage = errorInfo?.message;
  const errorPosition = errorInfo?.position;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      // Call the accept function directly
      if (onAccept) {
        onAccept();
      }
    }
  };

  const handleFocus = () => {
    if (isReadOnly) return; // Prevent focus changes in read-only mode
    // Set this function as active when any of its inputs is focused
    const updatedDefinitions = functionDefinitions.map((func, i) => ({
      ...func,
      isActive: i === index
    }));
    setFunctionDefinitions(updatedDefinitions);
  };

  const handleInstrumentChange = (e) => {
    e.stopPropagation(); // Prevent triggering other events
    
    const currentInstrument = instrument || "clarinet"; // Default to clarinet
    
    // Only allow switching between clarinet and guitar
    // If current instrument is not clarinet or guitar, default to guitar
    let nextInstrument;
    if (currentInstrument === "clarinet") {
      nextInstrument = "guitar";
    } else {
      // For any other instrument (including guitar), switch to clarinet
      nextInstrument = "clarinet";
    }

    console.log(`Changing instrument for piecewise function ${index + 1} from ${currentInstrument} to ${nextInstrument}`);
    
    const updatedDefinitions = setFunctionInstrumentN(functionDefinitions, index, nextInstrument);
    setFunctionDefinitions(updatedDefinitions);
  };

  const handleInstrumentKeyDown = (e) => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleInstrumentChange(e);
    }
  };

  // Parse the piecewise function string or initialize with one empty part
  const [parts, setParts] = useState(() => {
    if (value && typeof value === 'string' && value.startsWith('[')) {
      try {
        // Parse the piecewise function format: "[[x+5,x < -4],[1/2*x^2,-4<=x < 1],...]"
        // Remove outer brackets and split by ],[
        const innerContent = value.slice(1, -1); // Remove outer [ ]
        if (innerContent.trim() === '') {
          return [{ function: '', condition: '' }];
        }
        
        const parts = [];
        let currentPart = '';
        let bracketCount = 0;
        
        for (let i = 0; i < innerContent.length; i++) {
          const char = innerContent[i];
          if (char === '[') {
            bracketCount++;
            if (bracketCount === 1) {
              currentPart = '';
              continue;
            }
          } else if (char === ']') {
            bracketCount--;
            if (bracketCount === 0) {
              // End of a part - the comma to split function from condition
              const commaIndices= separatingCommas(currentPart);
              if (commaIndices.length > 0) {
                const nextCommaIndex = commaIndices[0];
                const func = currentPart.substring(0, nextCommaIndex).trim();
                const condition = currentPart.substring(nextCommaIndex + 1).trim();
                parts.push({ function: func, condition: condition });
              }
              continue;
            }
          }
          
          if (bracketCount > 0) {
            currentPart += char;
          }
        }
        
        return parts.length > 0 ? parts : [{ function: '', condition: '' }];
      } catch (e) {
        return [{ function: '', condition: '' }];
      }
    }
    return [{ function: '', condition: '' }];
  });
  
  const addPart = () => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    setParts(prev => {
      const newParts = [...prev, { function: '', condition: '' }];
      // Announce to screen readers
      setTimeout(() => {
        const newPartIndex = newParts.length - 1;
        const functionInput = document.getElementById(`piecewise-function-${index}-part-${newPartIndex}-function`);
        if (functionInput) {
          functionInput.focus();
        }
        // Announce the addition
        const statusDiv = document.querySelector('[aria-live="polite"]');
        if (statusDiv) {
          statusDiv.textContent = `Part ${newPartIndex + 1} added to piecewise function ${index + 1}. Total parts: ${newParts.length}`;
        }
      }, 100);
      return newParts;
    });
  };

  const removePart = (partIndex) => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    if (parts.length > 1) {
      setParts(prev => {
        const newParts = prev.filter((_, i) => i !== partIndex);
        needsUpdateRef.current = true;
        
        // Announce the removal
        setTimeout(() => {
          const statusDiv = document.querySelector('[aria-live="polite"]');
          if (statusDiv) {
            statusDiv.textContent = `Part ${partIndex + 1} removed from piecewise function ${index + 1}. Remaining parts: ${newParts.length}`;
          }
        }, 100);
        return newParts;
      });
    }
  };
  
  const updatePart = (partIndex, field, value) => {
    if (isReadOnly) return; // Prevent action in read-only mode
    
    setParts(prev => {
      const newParts = [...prev];
      newParts[partIndex] = { ...newParts[partIndex], [field]: value };
      needsUpdateRef.current = true;
      
      // Provide immediate feedback for common errors
      const validationError = validatePart(partIndex, field, value);
      if (validationError) {
        console.warn(validationError);
      }
      
      return newParts;
    });
  };

  // Handle onChange calls after render is complete
  useEffect(() => {
    if (needsUpdateRef.current && parts.length > 0) {
      // Convert back to the required format and call onChange
      const partsArray = parts.map(part => `[${part.function},${part.condition}]`);
      const formatted = `[${partsArray.join(',')}]`;
      onChange(formatted);
      needsUpdateRef.current = false;
    }
  }, [parts, onChange]);
  // Enhanced part validation
  const validatePart = (partIndex, field, value) => {
    if (!value || value.trim() === '') {
      return null; // Empty values are handled by the main validation
    }
    
    try {
      if (field === 'function') {
        // Validate function expression
        const { isOneVariableFunction } = require('../../../utils/parse');
        if (!isOneVariableFunction(value)) {
          return `Invalid function expression in part ${partIndex + 1}`;
        }
      } else if (field === 'condition') {
        // Validate condition/inequality
        const { isInequality } = require('../../../utils/parse');
        if (!isInequality(value)) {
          return `Invalid condition in part ${partIndex + 1}`;
        }
      }
    } catch (err) {
      return `Syntax error in part ${partIndex + 1} ${field}`;
    }
    
    return null;
  };

  // Enhanced part component with error highlighting
  const renderPart = (part, partIndex) => {
    const parsedError = parseErrorPosition(errorPosition);
    const hasPartError = parsedError && !parsedError.general && parsedError.partIndex === partIndex;
    const functionHasError = hasPartError && parsedError.fieldType === 'function';
    const conditionHasError = hasPartError && parsedError.fieldType === 'condition';

    return (
      <div 
        key={partIndex} 
        className="mb-4 last:mb-0"
        role="group"
        aria-label={`Part ${partIndex + 1} of ${parts.length}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          {/* Function input with error highlighting */}
          <div className="text-input-outer flex-1 min-w-0">
            <div className="text-input-label" aria-hidden="true">
              f(x)=
            </div>
            <input
              id={`piecewise-function-${index}-part-${partIndex}-function`}
              type="text"
              value={part.function}
              onChange={(e) => updatePart(partIndex, 'function', e.target.value)}
              onKeyDown={handleKeyDown}
              className={`text-input-inner w-full grow ${functionHasError ? 'error-border' : ''}`}
              placeholder="e.g., x^2 + 1"
              onFocus={handleFocus}
              aria-label={`Function expression for part ${partIndex + 1}`}
              aria-invalid={functionHasError ? 'true' : 'false'}
              aria-describedby={isReadOnly ? "Function expression. Read-only mode active." : "Function expression."}
              aria-errormessage={functionHasError ? `Error in function expression for part ${partIndex + 1}` : undefined}
              readOnly={isReadOnly}
              tabIndex={0}
            />
          </div>

          {/* Condition input with error highlighting */}
          <div className="text-input-outer flex-1 min-w-0">
            <div className="text-input-label" aria-hidden="true">
              if
            </div>
            <input
              id={`piecewise-function-${index}-part-${partIndex}-condition`}
              type="text"
              value={part.condition}
              onChange={(e) => updatePart(partIndex, 'condition', e.target.value)}
              onKeyDown={handleKeyDown}
              className={`text-input-inner w-full grow ${conditionHasError ? 'error-border' : ''}`}
              placeholder="e.g., x < 0 or x >= 1"
              onFocus={handleFocus}
              aria-label={`Condition for part ${partIndex + 1}${isReadOnly ? ' (read-only)' : ''}`}
              aria-description={isReadOnly ? "Condition when this part applies. Read-only mode active." : "Condition when this part applies."}
              readOnly={isReadOnly}
              tabIndex={0}
              aria-invalid={conditionHasError ? 'true' : 'false'}
              aria-errormessage={conditionHasError ? `piecewise-${index}-part-${partIndex}-condition-error` : undefined}
            />
          </div>

          {/* Remove part button */}
          {!isReadOnly && parts.length > 1 && (
            <button
              type="button"
              className="btn-neutral"
              aria-label={`Remove part ${partIndex + 1} of piecewise function ${index + 1}`}
              onClick={() => removePart(partIndex)}
            >
              <Delete className="w-4 h-4 text-icon" aria-hidden="true" />
            </button>
          )}
        </div>
        
        {/* Part-specific error messages */}
        {hasPartError && (
          <div 
            id={`piecewise-${index}-part-${partIndex}-${parsedError.fieldType}-error`}
            className="error-message mt-1"
            role="alert"
            aria-live="polite"
          >
            <span className="error-icon" aria-hidden="true">⚠️</span>
            {errorMessage}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className={`mb-4 ${isReadOnly ? 'opacity-60' : ''}`} 
      role="group" 
      aria-labelledby={`piecewise-function-${index}-label`}
      aria-description="Piecewise function with multiple parts."
    >
      <label
        id={`piecewise-function-${index}-label`}
        htmlFor={`piecewise-function-${index}-part-0-function`}
        className="block text-sm font-medium text-descriptions"
      >
        Function {index + 1} (piecewise)
      </label>
      
      {/* Bordered container for piecewise function parts */}
      <div 
        className={`mt-2 border rounded-lg p-4 bg-background ${errorInfo ? 'border-red-500' : 'border-gray-mddk'}`}
        role="group"
        aria-label={`Piecewise function ${index + 1} parts`}
      >
        {parts.map((part, partIndex) => renderPart(part, partIndex))}
        
        {/* Add part button and control buttons - only show in edit mode */}
        {!isReadOnly && (
          <div 
            className="flex gap-2 mt-2 pt-3 items-center"
            role="group" 
            aria-label={`Piecewise function ${index + 1} controls`}
          >
            <button
              type="button"
              onClick={addPart}
              className="btn-neutral flex-1"
              aria-description="Add new part"
            >
              Add part
            </button>
            
            <button
              type="button"
              className="btn-neutral"
              onClick={handleInstrumentChange}
              onKeyDown={handleInstrumentKeyDown}
              aria-label={`Change instrument for piecewise function ${index + 1}. Current instrument: ${instrument}. Click to cycle to next instrument.`}
              title={`Change instrument for piecewise function ${index + 1}. Current: ${instrument}`}
            >
              {getInstrumentIcon(instrument)}
              <span className="sr-only">{instrument}</span>
            </button>
            
            <button
              type="button"
              className="btn-neutral"
              aria-label={`Delete piecewise function ${index + 1}`}
              onClick={onDelete}
            >
              <Delete className="w-4 h-4 text-icon" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>

      {/* General piecewise function error display */}
      <PiecewiseErrorDisplay 
        functionId={functionId}
        errorMessage={errorMessage}
        errorPosition={errorPosition}
        parts={parts}
      />
    </div>
  );
};

export default EditFunctionDialog;
