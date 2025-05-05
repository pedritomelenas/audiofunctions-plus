import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Delete, Guitar } from "lucide-react";
import { useGraphContext } from "../../../context/GraphContext";

const EditFunctionDialog = ({ isOpen, onClose }) => {
  const { functionInput, setFunctionInput } = useGraphContext();
  const [functionContainers, setFunctionContainers] = useState([0]);
  const functionInputBackup = useRef(null);

  const addFunctionContainer = () => {
    setFunctionContainers((prev) => [...prev, prev.length]);
  };

  const removeFunctionContainer = (index) => {
    setFunctionContainers((prev) => prev.filter((_, i) => i !== index)); // Remove the container by index
  };

  // TODO adjust functionContainers on isOpen change --- if other function-changes need to be addressed
  useEffect(() => {
    if (isOpen) {
      functionInputBackup.current = functionInput; // backup current functionValues
      console.log("Open: ", functionInputBackup.current);
    }
  }, [isOpen]);


  const handleCancel = () => {
    console.log("Cancel: ", functionInputBackup.current);
    if (functionInputBackup.current !== null) {
      setFunctionInput(functionInputBackup.current); // reuse old function values
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-lg bg-dialog rounded-lg p-6 shadow-lg">
          <DialogTitle className="text-lg font-bold text-titles">
            Edit functions
          </DialogTitle>
          <Description className="text-descriptions">
            Here you can edit all active and inactive functions
          </Description>

          <br />
          <div aria-live="polite">
            {functionContainers.map((_, index) => (
              <FunctionContainer
                key={index}
                index={index}
                value={functionInput}
                onChange={setFunctionInput}
                onDelete={() => removeFunctionContainer(index)}
              />
            ))}
          </div>

          <button
            onClick={addFunctionContainer}
            className="btn-neutral w-full"
          >
            Add function
          </button>

          <div className="flex justify-end items-center mt-4 gap-2">
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

export default EditFunctionDialog;
