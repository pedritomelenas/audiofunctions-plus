import React, { useState, useEffect } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const WelcomeDialog = ({ isOpen, onClose, isAutoOpened = false }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Tutorial pages content
  const pages = [
    {
      title: "Welcome to AudioFunctions+",
      content: (
        <div className="space-y-4">
          <p className="text-descriptions">
            Welcome to AudioFunctions+, an innovative tool for exploring mathematical functions through interactive visualization and audio feedback.
          </p>
          <p className="text-descriptions">
            This tutorial will guide you through the main features and help you get started with creating and exploring mathematical functions.
          </p>
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <p className="text-sm text-descriptions">
              <strong>Tip:</strong> You can always access this tutorial again through the Help section in the command palette (Ctrl+K or Cmd+K).
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Creating Functions",
      content: (
        <div className="space-y-4">
          <p className="text-descriptions">
            You can create mathematical functions using the Edit Functions dialog. Access it by pressing <kbd className="px-2 py-1 bg-surface border border-border rounded text-sm text-titles font-mono">F</kbd> or through the command palette.
          </p>
          <div className="space-y-2">
            <h4 className="font-semibold text-titles">Function Types:</h4>
            <ul className="list-disc list-inside space-y-1 text-descriptions">
              <li><strong>Regular Functions:</strong> Standard mathematical expressions like x^2 + 2*x - 1</li>
              <li><strong>Piecewise Functions:</strong> Functions with different expressions for different conditions</li>
            </ul>
          </div>
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
            <p className="text-sm text-descriptions">
              <strong>Example:</strong> Try entering "sin(x)" or "x^2" to see how functions are visualized and sonified.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Navigation and Audio",
      content: (
        <div className="space-y-4">
          <p className="text-descriptions">
            AudioFunctions+ offers multiple ways to explore your functions with both visual and audio feedback.
          </p>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-titles">Keyboard Navigation:</h4>
              <ul className="list-disc list-inside space-y-1 text-descriptions text-sm">
                <li><kbd className="px-1 py-0.5 bg-surface border border-border rounded text-xs text-titles font-mono">←</kbd> / <kbd className="px-1 py-0.5 bg-surface border border-border rounded text-xs text-titles font-mono">→</kbd> or <kbd className="px-1 py-0.5 bg-surface border border-border rounded text-xs text-titles font-mono">J</kbd> / <kbd className="px-1 py-0.5 bg-surface border border-border rounded text-xs text-titles font-mono">L</kbd> - Move cursor step by step</li>
                <li><kbd className="px-1 py-0.5 bg-surface border border-border rounded text-xs text-titles font-mono">Shift</kbd> + arrows - Smooth continuous movement</li>
                <li><kbd className="px-1 py-0.5 bg-surface border border-border rounded text-xs text-titles font-mono">A/D/W/S</kbd> - Pan the view</li>
                <li><kbd className="px-1 py-0.5 bg-surface border border-border rounded text-xs text-titles font-mono">Z</kbd> - Zoom in/out</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-titles">Audio Features:</h4>
              <p className="text-descriptions text-sm">
                Each function has its own instrument sound. As you navigate, you'll hear the function values as musical tones, making it easier to understand the mathematical relationships.
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const isLastPage = currentPage === pages.length - 1;
  const isFirstPage = currentPage === 0;

  // Announce status changes to screen readers
  const announceStatus = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Reset to first page when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(0);
      announceStatus('Welcome tutorial opened. Use Next and Previous buttons to navigate.');
    }
  }, [isOpen]);

  // Announce page changes
  useEffect(() => {
    if (isOpen) {
      announceStatus(`Page ${currentPage + 1} of ${pages.length}: ${pages[currentPage].title}`);
    }
  }, [currentPage, isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Only allow Escape to close if not auto-opened
      if (e.key === 'Escape' && !isAutoOpened) {
        e.preventDefault();
        handleClose();
      }
      // Right arrow or Enter: Next page
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        if (isLastPage) {
          handleClose();
        } else {
          handleNext();
        }
      }
      // Left arrow: Previous page
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (!isFirstPage) {
          handlePrevious();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, currentPage, isLastPage, isFirstPage, isAutoOpened]);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleClose = () => {
    // Mark as seen in localStorage so it doesn't show again on startup
    localStorage.setItem('audiofunctions-welcome-seen', 'true');
    onClose();
  };

  const currentPageData = pages[currentPage];

  return (
    <Dialog 
      open={isOpen} 
      onClose={isAutoOpened ? () => {} : handleClose} // Disable click-outside close if auto-opened
      className="relative" 
      aria-modal="true" 
      role="dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-2xl max-h-[90vh] bg-background border border-border rounded-lg shadow-lg flex flex-col">
          <div className="p-6 pb-4">
            <DialogTitle id="dialog-title" className="text-lg font-bold text-titles">
              {currentPageData.title}
            </DialogTitle>
            <Description id="dialog-description" className="text-descriptions">
              Page {currentPage + 1} of {pages.length}
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

          {/* Content area */}
          <div className="flex-1 overflow-y-auto px-6" role="main" aria-label="Tutorial content">
            {currentPageData.content}
            <br />
          </div>

          {/* Navigation and controls */}
          <div className="px-6 py-4 border-t border-border" role="group" aria-label="Tutorial navigation">
            {/* Page indicators */}
            <div className="flex justify-center mb-4" role="group" aria-label="Page indicators">
              {pages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full mx-1 transition-colors duration-200 ${
                    index === currentPage 
                      ? "bg-primary" 
                      : "bg-border"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center" role="group" aria-label="Navigation controls">
              <button
                onClick={handlePrevious}
                disabled={isFirstPage}
                className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Go to previous page"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Only show Skip button if not auto-opened */}
              {!isAutoOpened && (
                <button
                  onClick={handleClose}
                  className="btn-secondary"
                  aria-label="Skip tutorial and close"
                >
                  Skip
                </button>
              )}

              <button
                onClick={isLastPage ? handleClose : handleNext}
                className="btn-primary flex items-center gap-2"
                aria-label={isLastPage ? "Finish tutorial" : "Go to next page"}
              >
                {isLastPage ? (
                  <>
                    <Check className="w-4 h-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default WelcomeDialog;