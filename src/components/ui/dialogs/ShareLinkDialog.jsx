import React, { useState, useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Copy, Check } from "lucide-react";

const ShareLinkDialog = ({ isOpen, onClose, shareLink }) => {
  const [statusMessage, setStatusMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const inputRef = useRef(null);

  // Focus the input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.select();
      announceStatus('Share link generated and ready to copy.');
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
      // Ctrl+C or Cmd+C: Copy link
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        handleCopy();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      announceStatus('Link copied to clipboard.');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      inputRef.current?.select();
      document.execCommand('copy');
      setCopySuccess(true);
      announceStatus('Link copied to clipboard.');
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative" aria-modal="true" role="dialog" aria-labelledby="dialog-title" aria-describedby="dialog-description">
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-2xl bg-background rounded-lg shadow-lg flex flex-col">
          <div className="p-6 pb-4">
            <DialogTitle id="dialog-title" className="text-lg font-bold text-titles">
              Share Link
            </DialogTitle>
            <Description id="dialog-description" className="text-descriptions">
              Copy this link to share your functions and graph settings.
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

          <div className="px-6 pb-6" role="main" aria-label="Share link content">
            <div className="mt-2 flex flex-wrap items-center gap-3  ">
              <div className="text-input-outer grow">
                <div className="text-input-label">
                  Share Link:
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={shareLink}
                  readOnly
                  className="text-input-inner flex-1"
                  aria-label="Generated share link"
                />
              </div>
              
              <button
                onClick={handleCopy}
                className="btn-neutral h-10"
                aria-label="Copy link to clipboard"
                title="Copy to clipboard"
              >
                {copySuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="px-6 py-4" role="group" aria-label="Dialog actions">
            <div className="flex justify-end items-center gap-2" role="group" aria-label="Dialog controls">
              <button
                onClick={onClose}
                className="btn-primary sm:w-auto"
              >
                Done
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default ShareLinkDialog;