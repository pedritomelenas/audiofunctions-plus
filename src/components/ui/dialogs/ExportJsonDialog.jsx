import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGraphContext } from "../../../context/GraphContext";
import { Download, Check } from "lucide-react";

const ExportJsonDialog = ({ isOpen, onClose }) => {
  const { graphBounds, graphSettings, setGraphSettings, functionDefinitions } = useGraphContext();
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Local state for export settings (not saved until export is clicked)
  const [exportSettings, setExportSettings] = useState({
    minBoundDifference: 0.1,
    maxBoundDifference: 100,
    restrictionMode: "none"
  });

  // Initialize export settings when dialog opens
  useEffect(() => {
    if (isOpen) {
      setExportSettings({
        minBoundDifference: graphSettings.minBoundDifference || 0.1,
        maxBoundDifference: graphSettings.maxBoundDifference || 100,
        restrictionMode: graphSettings.restrictionMode || "none"
      });
      setShowAdvancedOptions(false);
      announceStatus('Export dialog opened.');
    }
  }, [isOpen, graphSettings]);

  // Announce status changes to screen readers
  const announceStatus = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape: Close dialog (cancel)
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
      // Ctrl+S or Cmd+S: Download JSON
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleExport();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleCancel = () => {
    onClose();
  };

  const handleExport = () => {
    // Update graph settings with export settings
    setGraphSettings(prevSettings => ({
      ...prevSettings,
      defaultView: [graphBounds.xMin, graphBounds.xMax, graphBounds.yMax, graphBounds.yMin],
      minBoundDifference: exportSettings.minBoundDifference,
      maxBoundDifference: exportSettings.maxBoundDifference
    }));
    
    // Create export data object
    const exportData = {
      functions: functionDefinitions,
      graphSettings: {
        ...graphSettings,
        defaultView: [graphBounds.xMin, graphBounds.xMax, graphBounds.yMax, graphBounds.yMin],
        minBoundDifference: exportSettings.minBoundDifference,
        maxBoundDifference: exportSettings.maxBoundDifference,
        restrictionMode: exportSettings.restrictionMode
      }
    };
    
    try {
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audiofunctions-export.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setDownloadSuccess(true);
      announceStatus('JSON file downloaded successfully.');
      onClose();
    } catch (err) {
      announceStatus('Error downloading JSON file.');
      console.error('Download error:', err);
    }
  };

  const updateExportSetting = (key, value) => {
    setExportSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-2xl max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
          <div className="p-6 pb-4">
            <DialogTitle id="dialog-title" className="text-lg font-bold text-titles">
              Export JSON
            </DialogTitle>
            <Description id="dialog-description" className="text-descriptions">
              Export the current state including all defined functions with their sonifications, movement adjustment values, the current view, and the active function. Configure additional export settings below.
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

          <div className="flex-1 overflow-y-auto px-6 space-y-6" role="main" aria-label="Export content">
            {/* Restriction Mode */}
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-md font-semibold text-titles mb-1">Restriction Mode</h3>
                  <p className="text-sm text-descriptions">
                    Control how users can interact with exported graphs
                  </p>
                </div>
                <div className="text-input-outer pr-1.5 min-w-40">
                  <select
                    id="restriction-mode"
                    value={exportSettings.restrictionMode}
                    onChange={(e) => updateExportSetting('restrictionMode', e.target.value)}
                    className="grow text-input-inner"
                    aria-label="Restriction mode"
                  >
                    <option value="none" className="bg-background text-txt">None</option>
                    <option value="read-only" className="bg-background text-txt">Read Only</option>
                    <option value="full-restriction" className="bg-background text-txt">Full Restriction</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div>
              <div
                onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                className="flex items-center space-x-2 text-md font-semibold text-titles cursor-pointer select-none"
                aria-expanded={showAdvancedOptions}
                aria-controls="advanced-options"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowAdvancedOptions(!showAdvancedOptions);
                  }
                }}
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Advanced options</span>
              </div>

              {/* Collapsible Advanced Options */}
              {showAdvancedOptions && (
                <div
                  id="advanced-options"
                  className="mt-4 animate-in slide-in-from-top-2 duration-300"
                >
                  {/* Zoom Limits */}
                  <div>
                    <h4 className="text-sm font-semibold text-titles mb-3">Zoom limits</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="text-input-outer">
                        <div className="text-input-label">
                          Min Axis Interval:
                        </div>
                        <input
                          type="number"
                          step="0.1"
                          value={exportSettings.minBoundDifference}
                          onChange={(e) => updateExportSetting('minBoundDifference', parseFloat(e.target.value))}
                          className="text-input-inner"
                          aria-label="Minimum bound difference"
                        />
                      </div>
                      <div className="text-input-outer">
                        <div className="text-input-label">
                          Max Axis Interval:
                        </div>
                        <input
                          type="number"
                          step="1"
                          value={exportSettings.maxBoundDifference}
                          onChange={(e) => updateExportSetting('maxBoundDifference', parseFloat(e.target.value))}
                          className="text-input-inner"
                          aria-label="Maximum bound difference"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                onClick={handleExport}
                className="btn-primary sm:w-auto"
                aria-label="Export as JSON file"
                title="Export as JSON file"
              >
                Export
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ExportJsonDialog;