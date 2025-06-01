import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Delete, Guitar } from "lucide-react";
import { useGraphContext } from "../../../context/GraphContext";
import { 
  getFunctionCount, 
  getFunctionStringN, 
  getFunctionTypeN,
  addFunction,
  removeFunctionN,
  updateFunctionN
} from "../../../utils/graphObjectOperations";

const EditFunctionDialog = ({ isOpen, onClose }) => {
  const { functionDefinitions, setFunctionDefinitions } = useGraphContext();
  const functionDefinitionsBackup = useRef(null);
  // Generate unique ID for new functions
  const generateUniqueId = () => {
    const existingIds = (functionDefinitions || []).map(f => f.id);
    let counter = 1;
    while (existingIds.includes(`f${counter}`)) {
      counter++;
    }
    return `f${counter}`;
  };

  const addFunctionContainer = () => {
    const newFunction = {
      id: generateUniqueId(),
      functionName: `Function ${getFunctionCount(functionDefinitions) + 1}`,
      type: "function",
      functionString: "",
      isActive: true,
      instrument: "guitar",
      pointOfInterests: [],
      landmarks: []
    };
    setFunctionDefinitions(addFunction(functionDefinitions, newFunction));
  };

  const addPiecewiseFunctionContainer = () => {
    const newFunction = {
      id: generateUniqueId(),
      functionName: `Function ${getFunctionCount(functionDefinitions) + 1}`,
      type: "piecewise_function",
      functionString: "[[,]]",
      isActive: true,
      instrument: "guitar",
      pointOfInterests: [],
      landmarks: []
    };
    setFunctionDefinitions(addFunction(functionDefinitions, newFunction));
  };

  const removeContainer = (index) => {
    setFunctionDefinitions(removeFunctionN(functionDefinitions, index));
  };

  const updateFunctionString = (index, newFunctionString) => {
    setFunctionDefinitions(updateFunctionN(functionDefinitions, index, { functionString: newFunctionString }));
  };

  useEffect(() => {
    if (isOpen) {
      functionDefinitionsBackup.current = functionDefinitions; // backup current function definitions
      console.log("Open: ", functionDefinitionsBackup.current);
    }
  }, [isOpen, functionDefinitions]);

  const handleCancel = () => {
    console.log("Cancel: ", functionDefinitionsBackup.current);
    if (functionDefinitionsBackup.current !== null) {
      setFunctionDefinitions(functionDefinitionsBackup.current); // restore old function definitions
    }
    onClose();
  };
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-lg max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
          <div className="p-6 pb-4">
            <DialogTitle className="text-lg font-bold text-titles">
              Edit functions
            </DialogTitle>
            <Description className="text-descriptions">
              Here you can edit all active and inactive functions
            </Description>
          </div>          <div className="flex-1 overflow-y-auto px-6" aria-live="polite">
            {(functionDefinitions || []).map((functionDef, index) => (
              getFunctionTypeN(functionDefinitions, index) === 'piecewise_function' ? (
                <PiecewiseFunctionContainer
                  key={functionDef.id}
                  index={index}
                  value={getFunctionStringN(functionDefinitions, index)}
                  onChange={(newValue) => updateFunctionString(index, newValue)}
                  onDelete={() => removeContainer(index)}
                />
              ) : (
                <FunctionContainer
                  key={functionDef.id}
                  index={index}
                  value={getFunctionStringN(functionDefinitions, index)}
                  onChange={(newValue) => updateFunctionString(index, newValue)}
                  onDelete={() => removeContainer(index)}
                />
              )
            ))}
          </div>

          <div className="px-6 py-4">
            <div className="flex gap-2 mb-4">
              <button
                onClick={addFunctionContainer}
                className="btn-neutral flex-1"
              >
                Add function
              </button>
              <button
                onClick={addPiecewiseFunctionContainer}
                className="btn-neutral flex-1"
              >
                Add piecewise function
              </button>
            </div>

            <div className="flex justify-end items-center gap-2">
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



const FunctionContainer = ({ index, value, onChange, onDelete }) => {
  return (
    <div className="mb-4">
      <label
        htmlFor={`function-${index}`}
        className="block text-sm font-medium text-descriptions"
      >
        Function {index + 1}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Input-Feld */}
        <div className="text-input-outer grow">
          <div className="text-input-label">
            f(x)=
          </div>
          <input
            id={`function-${index}`}
            name="function"
            type="text"
            placeholder=""
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="text-input-inner grow"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 sm:flex-row">
          <button
            type="button"
            className="btn-neutral"
            aria-label="Change instrument"
          >
            <Guitar className="w-4 h-4 text-icon" />
          </button>
          <button
            type="button"
            className="btn-neutral"
            aria-label={`Delete function ${index + 1}`}
            onClick={onDelete}
          >
            <Delete className="w-4 h-4 text-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};


const PiecewiseFunctionContainer = ({ index, value, onChange, onDelete }) => {  // Parse the piecewise function string or initialize with one empty part
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
    setParts(prev => [...prev, { function: '', condition: '' }]);
  };

  const removePart = (partIndex) => {
    if (parts.length > 1) {
      setParts(prev => prev.filter((_, i) => i !== partIndex));
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
    <div className="mb-4">      <label
        htmlFor={`piecewise-function-${index}`}
        className="block text-sm font-medium text-descriptions"
      >
        Function {index + 1} (piecewise)
      </label>
        {/* Bordered container for piecewise function parts */}
      <div className="mt-2 border border-gray-mddk rounded-lg p-4 bg-background">
        {parts.map((part, partIndex) => (
          <div key={partIndex} className="mb-4 last:mb-0">
            <div className="flex flex-wrap items-center gap-3">
              {/* Function input */}
              <div className="text-input-outer flex-1 min-w-0">
                <div className="text-input-label">
                  f(x)=
                </div>
                <input
                  type="text"
                  value={part.function}
                  onChange={(e) => updatePart(partIndex, 'function', e.target.value)}
                  className="text-input-inner w-full grow"
                />
              </div>

              {/* Condition input */}
              <div className="text-input-outer flex-1 min-w-0">
                <div className="text-input-label">
                  if
                </div>
                <input
                  type="text"
                  value={part.condition}
                  onChange={(e) => updatePart(partIndex, 'condition', e.target.value)}
                  className="text-input-inner w-full grow"
                />
              </div>

              {/* Remove part button (only show if more than 1 part) */}
              {parts.length > 1 && (
                <button
                  type="button"
                  className="btn-neutral"
                  aria-label={`Remove part ${partIndex + 1}`}
                  onClick={() => removePart(partIndex)}
                >
                  <Delete className="w-4 h-4 text-icon" />
                </button>
              )}
            </div>
          </div>
        ))}        {/* Add part button and control buttons */}
        <div className="flex gap-2 mt-2 pt-3 items-center">
          <button
            type="button"
            onClick={addPart}
            className="btn-neutral flex-1"
          >
            Add part
          </button>
          
          <button
            type="button"
            className="btn-neutral"
            aria-label="Change instrument"
          >
            <Guitar className="w-4 h-4 text-icon" />
          </button>
          
          <button
            type="button"
            className="btn-neutral"
            aria-label={`Delete piecewise function ${index + 1}`}
            onClick={onDelete}
          >
            <Delete className="w-4 h-4 text-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFunctionDialog;
