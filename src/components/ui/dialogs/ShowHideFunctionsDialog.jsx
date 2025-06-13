import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Check, X, Guitar } from "lucide-react";
import { useGraphContext } from "../../../context/GraphContext";
import { 
  getFunctionCount, 
  getFunctionNameN,
  isFunctionActiveN,
  updateFunctionN,
  getFunctionInstrumentN
} from "../../../utils/graphObjectOperations";

const ShowHideFunctionsDialog = ({ isOpen, onClose }) => {
  const { functionDefinitions, setFunctionDefinitions } = useGraphContext();
  const functionDefinitionsBackup = useRef(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Announce status changes to screen readers
  const announceStatus = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Initialize backup when dialog opens
  useEffect(() => {
    if (isOpen) {
      functionDefinitionsBackup.current = functionDefinitions; // backup current function definitions
      announceStatus(`Toggle functions dialog opened. ${getFunctionCount(functionDefinitions)} functions available.`);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  const toggleFunctionState = (index) => {
    const newIsActive = !isFunctionActiveN(functionDefinitions, index);
    const updatedDefinitions = updateFunctionN(functionDefinitions, index, { isActive: newIsActive });
    setFunctionDefinitions(updatedDefinitions);
    
    const functionName = getFunctionNameN(functionDefinitions, index) || `Function ${index + 1}`;
    announceStatus(`${functionName} ${newIsActive ? 'activated' : 'deactivated'}`);
  };

  const handleSave = () => {
    const activeCount = functionDefinitions.filter((_, index) => isFunctionActiveN(functionDefinitions, index)).length;
    announceStatus(`Changes saved. ${activeCount} functions are now active.`);
    onClose();
  };

  const handleCancel = () => {
    if (functionDefinitionsBackup.current !== null) {
      setFunctionDefinitions(functionDefinitionsBackup.current); // restore old function definitions
    }
    announceStatus('Changes cancelled.');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
          <div className="p-6 pb-4">
            <DialogTitle id="dialog-title" className="text-lg font-bold text-titles">
              Toggle Functions
            </DialogTitle>
            <Description id="dialog-description" className="text-descriptions">
              Activate or deactivate functions. Click on a function or press Enter to toggle its state.
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
                No functions defined. Please add functions first.
              </div>
            )}
            
            {(functionDefinitions || []).map((functionDef, index) => (
              <FunctionToggleItem
                key={functionDef.id}
                index={index}
                name={getFunctionNameN(functionDefinitions, index)}
                isActive={isFunctionActiveN(functionDefinitions, index)}
                onToggle={() => toggleFunctionState(index)}
                
              />
            ))}
          </div>

          <div className="px-6 py-4" role="group" aria-label="Dialog actions">
            <div className="flex justify-end items-center gap-2" role="group" aria-label="Dialog controls">
              <button
                onClick={handleCancel}
                className="btn-secondary sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="btn-primary sm:w-auto"
              >
                Save
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

const FunctionToggleItem = ({ index, name, isActive, onToggle }) => {
  const { functionDefinitions, setFunctionDefinitions } = useGraphContext();
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  const handleInstrumentChange = (e) => {
    e.stopPropagation(); // Prevent triggering the toggle
    console.log(`Instrument change requested for function ${index + 1} (${name || `Function ${index + 1}`})`);
  };

  const handleInstrumentKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleInstrumentChange(e);
    }
  };

  const displayName = name || `Function ${index + 1}`;
  const currentInstrument = getFunctionInstrumentN(functionDefinitions, index) || "guitar";

  return (
    <div 
      className="mb-2" 
      role="group" 
      aria-labelledby={`function-toggle-${index}-label`}
      aria-describedby={`function-toggle-${index}-status function-toggle-${index}-instrument`}
    >
      <div 
        className={`p-4 border rounded-lg cursor-pointer transition-colors select-none ${
          isActive 
            ? "border-green-500 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30" 
            : "border-gray-mddk bg-background hover:border-gray-md"
        }`}
        onClick={onToggle}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-pressed={isActive}
        aria-labelledby={`function-toggle-${index}-label`}
        aria-describedby={`function-toggle-${index}-status function-toggle-${index}-instrument`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isActive ? "bg-green-500" : "bg-gray-mddk"
              }`}
              aria-hidden="true"
            >
              {isActive ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <X className="w-4 h-4 text-white" />
              )}
            </div>
            <span 
              id={`function-toggle-${index}-label`}
              className="text-sm font-medium text-descriptions"
            >
              {displayName}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            

            
            <button
              type="button"
              className="btn-neutral"
              onClick={handleInstrumentChange}
              onKeyDown={handleInstrumentKeyDown}
              title={`Change instrument for ${displayName}. Current instrument: ${currentInstrument}. Click to change.`}
              tabIndex={0}
            >
              <Guitar className="w-4 h-4 text-icon" aria-hidden="true" />
              <span className="sr-only">{currentInstrument}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowHideFunctionsDialog;