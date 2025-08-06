import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGraphContext } from "../../../context/GraphContext";
import { Download, Check } from "lucide-react";

const ExportJsonDialog = ({ isOpen, onClose }) => {
  const { graphBounds, graphSettings, setGraphSettings, functionDefinitions } = useGraphContext();
  const [statusMessage, setStatusMessage] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  
  // Local state for export settings (not saved until export is clicked)
  const [exportSettings, setExportSettings] = useState({
    defaultView: [-10, 10, 10, -10],
    minBoundDifference: 0.1,
    maxBoundDifference: 100,
    restrictionMode: "none"
  });

  // Initialize export settings when dialog opens
  useEffect(() => {
    if (isOpen) {
      setExportSettings({
        defaultView: [graphBounds.xMin, graphBounds.xMax, graphBounds.yMax, graphBounds.yMin],
        minBoundDifference: graphSettings.minBoundDifference || 0.1,
        maxBoundDifference: graphSettings.maxBoundDifference || 100,
        restrictionMode: graphSettings.restrictionMode || "none"
      });
      announceStatus('Export dialog opened.');
    }
  }, [isOpen, graphBounds, graphSettings]);

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
    // Update graph settings with export settings (excluding restrictionMode)
    setGraphSettings(prevSettings => ({
      ...prevSettings,
      defaultView: exportSettings.defaultView,
      minBoundDifference: exportSettings.minBoundDifference,
      maxBoundDifference: exportSettings.maxBoundDifference
    }));
    
    // Create export data object
    const exportData = {
      functions: functionDefinitions,
      graphSettings: {
        ...graphSettings,
        defaultView: exportSettings.defaultView,
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

  const updateDefaultView = (index, value) => {
    const newDefaultView = [...exportSettings.defaultView];
    newDefaultView[index] = parseFloat(value);
    updateExportSetting('defaultView', newDefaultView);
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
              Configure export settings for your functions and graphs.
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
            {/* Default View Settings */}
            <div>
              <h3 className="text-md font-semibold text-titles mb-4">Default View</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-input-outer">
                  <div className="text-input-label">
                    X Min:
                  </div>
                  <input
                    type="number"
                    value={exportSettings.defaultView[0]}
                    onChange={(e) => updateDefaultView(0, e.target.value)}
                    className="text-input-inner"
                    aria-label="X minimum for default view"
                  />
                </div>
                <div className="text-input-outer">
                  <div className="text-input-label">
                    X Max:
                  </div>
                  <input
                    type="number"
                    value={exportSettings.defaultView[1]}
                    onChange={(e) => updateDefaultView(1, e.target.value)}
                    className="text-input-inner"
                    aria-label="X maximum for default view"
                  />
                </div>
                <div className="text-input-outer">
                  <div className="text-input-label">
                    Y Max:
                  </div>
                  <input
                    type="number"
                    value={exportSettings.defaultView[2]}
                    onChange={(e) => updateDefaultView(2, e.target.value)}
                    className="text-input-inner"
                    aria-label="Y maximum for default view"
                  />
                </div>
                <div className="text-input-outer">
                  <div className="text-input-label">
                    Y Min:
                  </div>
                  <input
                    type="number"
                    value={exportSettings.defaultView[3]}
                    onChange={(e) => updateDefaultView(3, e.target.value)}
                    className="text-input-inner"
                    aria-label="Y minimum for default view"
                  />
                </div>
              </div>
            </div>

            {/* Bound Differences */}
            <div>
              <h3 className="text-md font-semibold text-titles mb-4">Zoom limits</h3>
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

            {/* Restriction Mode */}
            <div>
              <h3 className="text-md font-semibold text-titles mb-4">Restriction Mode</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="restriction-mode"
                  checked={exportSettings.restrictionMode === "read-only"}
                  onChange={(e) => updateExportSetting('restrictionMode', e.target.checked ? "read-only" : "none")}
                  className="h-4 w-4 accent-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background border-input bg-background rounded"
                  aria-describedby="restriction-mode-description"
                />
                <label htmlFor="restriction-mode" className="text-sm text-titles cursor-pointer">
                  Enable read-only mode
                </label>
              </div>
              <p id="restriction-mode-description" className="text-sm text-descriptions mt-1">
                When enabled, exported graphs will be read-only for viewers
              </p>
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