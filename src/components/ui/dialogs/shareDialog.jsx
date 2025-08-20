import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGraphContext } from "../../../context/GraphContext";
import ShareLinkDialog from "./ShareLinkDialog";

const ShareDialog = ({ isOpen, onClose }) => {
  const { graphBounds, graphSettings, setGraphSettings, functionDefinitions } = useGraphContext();
  const [statusMessage, setStatusMessage] = useState('');
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // Local state for share settings (not saved until share is clicked)
  const [shareSettings, setShareSettings] = useState({
    minBoundDifference: 0.1,
    maxBoundDifference: 100,
    restrictionMode: "none"
  });

  // Initialize share settings when dialog opens
  useEffect(() => {
    if (isOpen) {
      setShareSettings({
        minBoundDifference: graphSettings.minBoundDifference || 0.1,
        maxBoundDifference: graphSettings.maxBoundDifference || 100,
        restrictionMode: graphSettings.restrictionMode || "none"
      });
      setShowAdvancedOptions(false);
      announceStatus('Share dialog opened.');
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
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleCancel = () => {
    onClose();
  };

  const handleShare = () => {
    // Update graph settings with share settings
    setGraphSettings(prevSettings => ({
      ...prevSettings,
      minBoundDifference: shareSettings.minBoundDifference,
      maxBoundDifference: shareSettings.maxBoundDifference
    }));
    
    // Create share data object
    const shareData = {
      functions: functionDefinitions,
      graphSettings: {
        ...graphSettings,
        minBoundDifference: shareSettings.minBoundDifference,
        maxBoundDifference: shareSettings.maxBoundDifference,
        restrictionMode: shareSettings.restrictionMode
      }
    };
    
    // Convert to JSON string and then to base64
    const jsonString = JSON.stringify(shareData);
    const base64String = btoa(jsonString);
    
    // Generate the share link
    const baseUrl = window.location.origin + window.location.pathname;
    const shareLink = `${baseUrl}#import=${base64String}`;
    
    console.log('Share data (JSON):', jsonString);
    console.log('Share data (Base64):', base64String);
    console.log('Share link:', shareLink);
    
    setGeneratedLink(shareLink);
    setShowLinkDialog(true);
    onClose(); // Close the main share dialog immediately
    
    announceStatus('Settings saved and share link generated.');
  };

  const handleCloseLinkDialog = () => {
    setShowLinkDialog(false);
    // Don't call onClose() here anymore since share dialog is already closed
  };

  const updateShareSetting = (key, value) => {
    setShareSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <>
      <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
          <DialogPanel className="w-full max-w-2xl max-h-[90vh] bg-background rounded-lg shadow-lg flex flex-col">
            <div className="p-6 pb-4">
              <DialogTitle id="dialog-title" className="text-lg font-bold text-titles">
                Share
              </DialogTitle>
              <Description id="dialog-description" className="text-descriptions">
                Configure sharing settings for your functions and graphs.
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

            <div className="flex-1 overflow-y-auto px-6 space-y-6" role="main" aria-label="Share content">
              {/* Restriction Mode */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-semibold text-titles mb-1">Restriction Mode</h3>
                    <p className="text-sm text-descriptions">
                      Control how users can interact with shared graphs
                    </p>
                  </div>
                  <div className="text-input-outer min-w-32">
                    <select
                      id="restriction-mode"
                      value={shareSettings.restrictionMode}
                      onChange={(e) => updateShareSetting('restrictionMode', e.target.value)}
                      className="text-input-inner"
                      aria-label="Restriction mode"
                    >
                      <option value="none">None</option>
                      <option value="read-only">Read Only</option>
                      <option value="full-restriction">Full Restriction</option>
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
                            value={shareSettings.minBoundDifference}
                            onChange={(e) => updateShareSetting('minBoundDifference', parseFloat(e.target.value))}
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
                            value={shareSettings.maxBoundDifference}
                            onChange={(e) => updateShareSetting('maxBoundDifference', parseFloat(e.target.value))}
                            className="text-input-inner"
                            aria-label="Maximum bound difference"
                          />
                        </div>
                      </div>
                    </div>
                    <br />
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
                  onClick={handleShare}
                  className="btn-primary sm:w-auto"
                >
                  Share via link
                </button>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Share Link Dialog */}
      <ShareLinkDialog
        isOpen={showLinkDialog}
        onClose={handleCloseLinkDialog}
        shareLink={generatedLink}
      />
    </>
  );
};

export default ShareDialog;
