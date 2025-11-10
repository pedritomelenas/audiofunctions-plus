import React, { useEffect, useState } from "react";

const InfoToast = ({ message, isVisible, onClose, timeout = 10000 }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible && message) {
      setShouldRender(true);
      console.log(timeout)
      // Auto-hide after specified timeout (default 10 seconds)
      const timer = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, timeout);

      return () => clearTimeout(timer);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isVisible, message, onClose, timeout]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      className={`fixed top-24 right-4 z-40 max-w-sm transition-all duration-300 ease-in-out ${
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-2"
      }`}
      aria-hidden="true"
      role="presentation"
    >
      <div className="bg-background border border-border rounded-lg shadow-lg p-4">
        <div className="text-sm text-txt whitespace-pre-line">
          {message}
        </div>
      </div>
    </div>
  );
};

export default InfoToast;