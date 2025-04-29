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
    <Dialog open={isOpen} onClose={onClose} className="relative z-10" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
            Edit functions
          </DialogTitle>
          <Description className="text-gray-700 dark:text-gray-300">
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
            className="mt-4 px-4 py-2 w-full"
          >
            Add function
          </button>

          <div className="flex justify-end items-center mt-4 gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 sm:w-auto"
            >
              Cancel
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 sm:w-auto"
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
        className="block text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        Function {index + 1}
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {/* Input-Feld */}
        <div className="flex items-center rounded-md bg-white dark:bg-gray-700 pl-3 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600 grow">
          <div className="shrink-0 text-base text-gray-500 dark:text-gray-400 select-none sm:text-sm">
            f(x)=
          </div>
          <input
            id={`function-${index}`}
            name="function"
            type="text"
            placeholder=""
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none sm:text-sm"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 sm:flex-row">
          <button
            type="button"
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            aria-label="Change instrument"
          >
            <Guitar className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            type="button"
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
            aria-label={`Delete function ${index + 1}`}
            onClick={onDelete}
          >
            <Delete className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditFunctionDialog;
