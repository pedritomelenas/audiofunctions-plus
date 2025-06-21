import React, { useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGraphContext } from "../../../context/GraphContext";

const MovementAdjustmentsDialog = ({ isOpen, onClose }) => {
  const { PlayFunction, setPlayFunction } = useGraphContext();
  const speedBackup = useRef(null);
  const stepSizeBackup = useRef(null);
  
  // Temporary state for stepSize (no functionality yet)
  const [tempStepSize, setTempStepSize] = React.useState(1);

  useEffect(() => {
    if (isOpen) {
      speedBackup.current = PlayFunction.speed;
      stepSizeBackup.current = tempStepSize;
      console.log("Open: speed =", speedBackup.current, "stepSize =", stepSizeBackup.current);
    }
  }, [isOpen, PlayFunction.speed, tempStepSize]);

  const handleCancel = () => {
    console.log("Cancel: restoring speed =", speedBackup.current, "stepSize =", stepSizeBackup.current);
    if (speedBackup.current !== null) {
      setPlayFunction(prev => ({ ...prev, speed: speedBackup.current }));
    }
    if (stepSizeBackup.current !== null) {
      setTempStepSize(stepSizeBackup.current);
    }
    onClose();
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      aria-modal="true" 
      role="dialog"
    >
      <div className="fixed inset-0 bg-overlay" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <DialogPanel className="w-full max-w-lg bg-background rounded-lg p-6 shadow-lg">
          <DialogTitle className="text-lg font-bold text-titles">
            Movement Adjustments
          </DialogTitle>
          <Description className="text-descriptions">
            Adjust movement and navigation settings for the graph.
          </Description>

          <br />

          <div className="space-y-4">
            {/* Speed Input */}
            <div className="text-input-outer">
              <div className="text-input-label">
                Speed:
              </div>
              <input
                id="speed-input"
                type="number"
                value={PlayFunction.speed}
                onChange={(e) =>
                  setPlayFunction(prev => ({ ...prev, speed: parseFloat(e.target.value) }))
                }
                className="text-input-inner"
                aria-label="Audio playback speed"
              />
            </div>

            {/* Step Size Input */}
            <div className="text-input-outer">
              <div className="text-input-label">
                Step Size:
              </div>
              <input
                id="stepsize-input"
                type="number"
                value={tempStepSize}
                onChange={(e) =>
                  setTempStepSize(parseFloat(e.target.value))
                }
                className="text-input-inner"
                aria-label="Navigation step size"
              />
            </div>
          </div>

          <br />

          <div className="flex justify-end items-center mt-4 gap-2">
            <button
              onClick={handleCancel}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              onClick={onClose}
              className="btn-primary"
            >
              Accept
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default MovementAdjustmentsDialog;