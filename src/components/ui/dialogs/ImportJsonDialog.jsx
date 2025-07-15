import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGraphContext } from "../../../context/GraphContext";
import { Upload, FileJson, X } from "lucide-react";
import { validateJsonData } from "../../../utils/validateGraphObject";

const ImportJsonDialog = ({ isOpen, onClose }) => {
  const { setFunctionDefinitions, setGraphSettings, setGraphBounds } = useGraphContext();
  const [statusMessage, setStatusMessage] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [jsonContent, setJsonContent] = useState('');
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef(null);

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setJsonContent('');
      setValidationError('');
      announceStatus('Import dialog opened. Drop a JSON file or click to select.');
    }
  }, [isOpen]);

  // Announce status changes to screen readers
  const announceStatus = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape: Close dialog
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      // Ctrl+O or Cmd+O: Open file picker
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault();
        handleFileSelect();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const processFile = (file) => {
    // Check if file is JSON
    if (!file.name.toLowerCase().endsWith('.json')) {
      setValidationError('Please select a JSON file.');
      announceStatus('Invalid file type. Please select a JSON file.');
      return;
    }

    setSelectedFile(file);
    setValidationError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const jsonData = JSON.parse(content);
        
        // Validate the JSON structure
        const [isValid, errorMessage] = validateJsonData(jsonData);
        
        if (!isValid) {
          setValidationError(errorMessage);
          announceStatus(`Validation failed: ${errorMessage}`);
          return;
        }

        setJsonContent(content);
        announceStatus('JSON file loaded and validated successfully.');
      } catch (error) {
        setValidationError('Invalid JSON format. Please check your file.');
        announceStatus('Invalid JSON format. Please check your file.');
      }
    };

    reader.onerror = () => {
      setValidationError('Error reading file. Please try again.');
      announceStatus('Error reading file. Please try again.');
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleImport = () => {
    if (!jsonContent || validationError) {
      announceStatus('Please select a valid JSON file first.');
      return;
    }

    try {
      const importData = JSON.parse(jsonContent);
      
      // Import functions
      if (importData.functions) {
        setFunctionDefinitions(importData.functions);
      }
      
      // Import graph settings
      if (importData.graphSettings) {
        setGraphSettings(importData.graphSettings);
        
        // Set graph bounds from imported settings if available
        if (importData.graphSettings.defaultView) {
          const [xMin, xMax, yMax, yMin] = importData.graphSettings.defaultView;
          setGraphBounds({ xMin, xMax, yMin, yMax });
        }
      }
      
      announceStatus('Data imported successfully.');
      onClose();
    } catch (error) {
      setValidationError('Error importing data. Please try again.');
      announceStatus('Error importing data. Please try again.');
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setJsonContent('');
    setValidationError('');
    announceStatus('File cleared.');
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-2xl bg-background rounded-lg shadow-lg flex flex-col">
          <div className="p-6 pb-4">
            <DialogTitle id="dialog-title" className="text-lg font-bold text-titles">
              Import JSON
            </DialogTitle>
            <Description id="dialog-description" className="text-descriptions">
              Import functions and graph settings from a JSON file. Drop a file or click to select.
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

          <div className="px-6 pb-6" role="main" aria-label="Import JSON content">
            {/* File drop zone */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                isDragOver
                  ? 'border-primary bg-primary/10'
                  : validationError
                  ? 'border-red-500 bg-red-500/5'
                  : selectedFile
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:opacity-80'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleFileSelect}
              role="button"
              tabIndex={0}
              aria-label="Drop zone for JSON file import"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFileSelect();
                }
              }}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <FileJson className="mx-auto h-12 w-12 text-primary" />
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-sm font-medium text-titles">
                      {selectedFile.name}
                    </span>
                  </div>
                  <p className="text-xs text-descriptions">
                    File size: {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-12 w-12 text-txt-subtitle" />
                  <div className="text-sm font-medium text-titles">
                    Drop your JSON file here
                  </div>
                  <p className="text-xs text-descriptions">
                    or click to select from your device
                  </p>
                </div>
              )}
            </div>

            {/* Error message */}
            {validationError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {validationError}
                </p>
              </div>
            )}

            {/* File input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileInputChange}
              className="hidden"
              aria-label="Select JSON file"
            />
          </div>

          <div className="px-6 py-4" role="group" aria-label="Dialog actions">
            <div className="flex justify-end items-center gap-2" role="group" aria-label="Dialog controls">
              <button
                onClick={onClose}
                className="btn-secondary sm:w-auto"
              >
                Cancel
              </button>

              <button
                onClick={handleImport}
                disabled={!jsonContent || !!validationError}
                className="btn-primary sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Import JSON data"
                title="Import JSON data"
              >
                Import
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ImportJsonDialog;