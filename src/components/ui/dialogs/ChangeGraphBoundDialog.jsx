import { useEffect, useRef } from "react";
import { Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useGraphContext } from "../../../context/GraphContext";

const ChangeGraphBoundDialog = ({ isOpen, onClose }) => {
    const { graphBounds, setGraphBounds } = useGraphContext();
    const graphBoundsBackup = useRef(null);

    useEffect(() => {
        if (isOpen) {
            graphBoundsBackup.current = graphBounds; // backup current graphBounds
            console.log("Open: ", graphBoundsBackup.current);
        }
    }, [isOpen]);

    const handleCancel = () => {
        console.log("Cancel: ", graphBoundsBackup.current);
        if (graphBoundsBackup.current !== null) {
            setGraphBounds(graphBoundsBackup.current); // reuse old graph bounds
        }
        onClose();
    };

    const handleNumberChange = (field, value) => {
        // Erlaube leere Strings, Minuszeichen und gültige Zahlen
        if (value === '' || value === '-' || !isNaN(parseFloat(value))) {
            setGraphBounds({ ...graphBounds, [field]: value === '' || value === '-' ? value : parseFloat(value) });
        }
    };

    const handleBlur = (field, value) => {
        // Bei Blur (Fokus verlassen) stelle sicher, dass ein gültiger Wert gesetzt wird
        if (value === '' || value === '-') {
            setGraphBounds({ ...graphBounds, [field]: 0 });
        }
    };

  return (
    <Dialog open={isOpen} onClose={onClose} aria-modal="true" role="dialog">
          <div className="fixed inset-0 bg-overlay" aria-hidden="true" /> {/* Overlay - grey background */}
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
            <DialogPanel className="w-full max-w-lg bg-background rounded-lg p-6 shadow-lg">
              <DialogTitle className="text-lg font-bold text-titles">
                Change Graph-Bound
              </DialogTitle>
              <Description className="text-descriptions">
                Here you can edit the displayed graph bounds.
              </Description>
    
              <br />

              <div className="grid grid-cols-3 gap-4 items-center">
                {/* yMax oben in der Mitte */}
                <div className="col-span-3 flex justify-center">
                    <div className="text-input-outer">
                        <div className="text-input-label">
                            Ymax:
                        </div>
                        <input
                            id="maxY"
                            type="number"
                            step="any"
                            value={graphBounds.yMax}
                            onChange={(e) => handleNumberChange('yMax', e.target.value)}
                            onBlur={(e) => handleBlur('yMax', e.target.value)}
                            aria-label="Y maximum"
                            className="text-input-inner"
                        />
                    </div>
                </div>

                {/* xMin und xMax zentriert */}
                <div className="col-span-3 flex justify-center gap-16">
                    <div className="text-input-outer">
                        <div className="text-input-label">
                            Xmin:
                        </div>
                        <input
                            id="minX"
                            type="number"
                            step="any"
                            value={graphBounds.xMin}
                            onChange={(e) => handleNumberChange('xMin', e.target.value)}
                            onBlur={(e) => handleBlur('xMin', e.target.value)}
                            aria-label="X minimum"
                            className="text-input-inner"
                        />
                    </div>
                    <div className="text-input-outer">
                        <div className="text-input-label">
                            Xmax:
                        </div>
                        <input
                            id="maxX"
                            type="number"
                            step="any"
                            value={graphBounds.xMax}
                            onChange={(e) => handleNumberChange('xMax', e.target.value)}
                            onBlur={(e) => handleBlur('xMax', e.target.value)}
                            aria-label="X maximum"
                            className="text-input-inner"
                        />
                    </div>
                </div>

                {/* yMin unten in der Mitte */}
                <div className="col-span-3 flex justify-center">
                    <div className="text-input-outer">
                        <div className="text-input-label">
                            Ymin:
                        </div>
                        <input
                            id="minY"
                            type="number"
                            step="any"
                            value={graphBounds.yMin}
                            onChange={(e) => handleNumberChange('yMin', e.target.value)}
                            onBlur={(e) => handleBlur('yMin', e.target.value)}
                            aria-label="Y minimum"
                            className="text-input-inner"
                        />
                    </div>
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
}

export default ChangeGraphBoundDialog;