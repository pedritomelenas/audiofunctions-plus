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
  setFunctionInstrumentN // Add this import
} from "../../../utils/graphObjectOperations";

const EditFunctionDialog = ({ isOpen, onClose }) => {
  const { functionDefinitions, setFunctionDefinitions } = useGraphContext();
  const functionDefinitionsBackup = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [focusAfterAction, setFocusAfterAction] = useState(null);

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
    setFunctionDefinitions(addFunction(functionDefinitions, newFunction));
    announceStatus(`New function added. Total functions: ${getFunctionCount(functionDefinitions) + 1}`);
    setFocusAfterAction(`function-${getFunctionCount(functionDefinitions)}`);
  };

  const addPiecewiseFunctionContainer = () => {
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
    setFunctionDefinitions(addFunction(functionDefinitions, newFunction));
    announceStatus(`New piecewise function added. Total functions: ${getFunctionCount(functionDefinitions) + 1}`);
    setFocusAfterAction(`piecewise-function-${getFunctionCount(functionDefinitions)}-part-0-function`);
  };

  const removeContainer = (index) => {
    const functionType = getFunctionTypeN(functionDefinitions, index) === 'piecewise_function' ? 'piecewise function' : 'function';
    setFunctionDefinitions(removeFunctionN(functionDefinitions, index));
    announceStatus(`${functionType} ${index + 1} deleted. Remaining functions: ${getFunctionCount(functionDefinitions) - 1}`);
  };

  const updateFunctionString = (index, newFunctionString) => {
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
      announceStatus(`Edit functions dialog opened. ${getFunctionCount(functionDefinitions)} functions available.`);
    }
  }, [isOpen]);

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
              Edit functions
            </DialogTitle>            <Description id="dialog-description" className="text-descriptions">
              Edit active and inactive functions. Press Enter to save and close.
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
                No functions defined. Click "Add function" or "Add piecewise function" to create your first function.
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
                />
              )
            ))}
          </div>

          <div className="px-6 py-4" role="group" aria-label="Dialog actions">            <div className="flex gap-2 mb-4" role="group" aria-label="Add new functions">              <button
                onClick={addFunctionContainer}
                className="btn-neutral flex-1"
              >
                Add regular function
              </button>
              <button
                onClick={addPiecewiseFunctionContainer}
                className="btn-neutral flex-1"
              >
                Add piecewise function
              </button>
            </div>
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

const FunctionContainer = ({ index, value, instrument, onChange, onDelete, onAccept }) => {
  const { functionDefinitions, setFunctionDefinitions } = useGraphContext();
  const { availableInstruments } = useInstruments();
  
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

  const handleInstrumentChange = (e) => {
    e.stopPropagation(); // Prevent triggering other events
    
    const currentInstrument = instrument || "clarinet"; // Default to clarinet
    const instrumentNames = availableInstruments.map(inst => inst.name);
    
    // Handle case where current instrument is not found in available instruments
    let currentIndex = instrumentNames.indexOf(currentInstrument);
    if (currentIndex === -1) {
      currentIndex = 0; // Default to first instrument if current not found
    }
    
    const nextIndex = (currentIndex + 1) % instrumentNames.length;
    const nextInstrument = instrumentNames[nextIndex];

    console.log(`Changing instrument for function ${index + 1} from ${currentInstrument} to ${nextInstrument}`);
    console.log(`Available instruments: ${instrumentNames.join(', ')}`);
    
    const updatedDefinitions = setFunctionInstrumentN(functionDefinitions, index, nextInstrument);
    setFunctionDefinitions(updatedDefinitions);
  };

  const handleInstrumentKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleInstrumentChange(e);
    }
  };

  return (
    <div 
      className="mb-4" 
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
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Input-Feld */}
        <div className="text-input-outer grow">
          <div className="text-input-label" aria-hidden="true">
            f(x)=
          </div>          <input
            id={`function-${index}`}
            name="function"
            type="text"
            placeholder="e.g., x^2 + 2*x - 1"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-input-inner grow"
            aria-label={`Function ${index + 1} mathematical expression`}
            aria-description="Mathematical expression."
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 sm:flex-row" role="group" aria-label={`Function ${index + 1} actions`}>
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
      </div>
    </div>
  );
};

const PiecewiseFunctionContainer = ({ index, value, instrument, onChange, onDelete, onAccept }) => {
  const { functionDefinitions, setFunctionDefinitions } = useGraphContext();
  const { availableInstruments } = useInstruments();
  
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

  const handleInstrumentChange = (e) => {
    e.stopPropagation(); // Prevent triggering other events
    
    const currentInstrument = instrument || "clarinet"; // Default to clarinet
    const instrumentNames = availableInstruments.map(inst => inst.name);
    
    // Handle case where current instrument is not found in available instruments
    let currentIndex = instrumentNames.indexOf(currentInstrument);
    if (currentIndex === -1) {
      currentIndex = 0; // Default to first instrument if current not found
    }
    
    const nextIndex = (currentIndex + 1) % instrumentNames.length;
    const nextInstrument = instrumentNames[nextIndex];

    console.log(`Changing instrument for piecewise function ${index + 1} from ${currentInstrument} to ${nextInstrument}`);
    console.log(`Available instruments: ${instrumentNames.join(', ')}`);
    
    const updatedDefinitions = setFunctionInstrumentN(functionDefinitions, index, nextInstrument);
    setFunctionDefinitions(updatedDefinitions);
  };

  const handleInstrumentKeyDown = (e) => {
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
              // End of a part - find the last comma to split function from condition
              // This is more reliable than using the first comma
              const lastCommaIndex = currentPart.lastIndexOf(',');
              if (lastCommaIndex !== -1) {
                const func = currentPart.substring(0, lastCommaIndex).trim();
                const condition = currentPart.substring(lastCommaIndex + 1).trim();
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
    if (parts.length > 1) {
      setParts(prev => {
        const newParts = prev.filter((_, i) => i !== partIndex);
        
        // Convert back to the required format and call onChange
        const partsArray = newParts.map(part => `[${part.function},${part.condition}]`);
        const formatted = `[${partsArray.join(',')}]`;
        onChange(formatted);
        
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
    setParts(prev => {
      const newParts = [...prev];
      newParts[partIndex] = { ...newParts[partIndex], [field]: value };
      
      // Convert back to the required format without JSON.stringify quotes
      const partsArray = newParts.map(part => `[${part.function},${part.condition}]`);
      const formatted = `[${partsArray.join(',')}]`;
      onChange(formatted);
      
      return newParts;
    });
  };
  return (
    <div 
      className="mb-4" 
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
        className="mt-2 border border-gray-mddk rounded-lg p-4 bg-background"
        role="group"
        aria-label={`Piecewise function ${index + 1} parts`}
      >
        {parts.map((part, partIndex) => (
          <div 
            key={partIndex} 
            className="mb-4 last:mb-0"
            role="group"
            aria-label={`Part ${partIndex + 1} of ${parts.length}`}
          >
            <div className="flex flex-wrap items-center gap-3">
              {/* Function input */}
              <div className="text-input-outer flex-1 min-w-0">
                <div className="text-input-label" aria-hidden="true">
                  f(x)=
                </div>                <input
                  id={`piecewise-function-${index}-part-${partIndex}-function`}
                  type="text"
                  value={part.function}
                  onChange={(e) => updatePart(partIndex, 'function', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-input-inner w-full grow"
                  placeholder="e.g., x^2 + 1"
                  aria-label={`Function expression for part ${partIndex + 1}`}
                  aria-description="Function expression."
                />
              </div>

              {/* Condition input */}
              <div className="text-input-outer flex-1 min-w-0">
                <div className="text-input-label" aria-hidden="true">
                  if
                </div>                <input
                  id={`piecewise-function-${index}-part-${partIndex}-condition`}
                  type="text"
                  value={part.condition}
                  onChange={(e) => updatePart(partIndex, 'condition', e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="text-input-inner w-full grow"
                  placeholder="e.g., x < 0 or x >= 1"
                  aria-label={`Condition for part ${partIndex + 1}`}
                  aria-description="Condition when this part applies."
                />
              </div>

              {/* Remove part button (only show if more than 1 part) */}
              {parts.length > 1 && (
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
          </div>
        ))}
        
        {/* Add part button and control buttons */}
        <div 
          className="flex gap-2 mt-2 pt-3 items-center"
          role="group" 
          aria-label={`Piecewise function ${index + 1} controls`}
        >          <button
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
      </div>
    </div>
  );
};

export default EditFunctionDialog;
