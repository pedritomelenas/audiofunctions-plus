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

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-10" aria-modal="true" role="dialog">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
            <DialogPanel className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Change Graph-Bound
              </DialogTitle>
              <Description className="text-gray-700 dark:text-gray-300">
                Here you can edit the displayed graph bounds.
              </Description>
    
              <br />

              <div className="grid grid-cols-3 gap-4 items-center">
                {/* yMax oben in der Mitte */}
                <div className="col-span-3 flex justify-center">
                    <div className="flex items-center rounded-md bg-white dark:bg-gray-700 pl-3 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                        <div className="shrink-0 text-base text-gray-500 dark:text-gray-400 select-none sm:text-sm">
                            Ymax:
                        </div>
                        <input
                            id="maxY"
                            type="number"
                            value={graphBounds.yMax}
                            onChange={(e) =>
                                setGraphBounds({ ...graphBounds, yMax: parseFloat(e.target.value) })
                            }
                            aria-label="Y maximum"
                            className="w-24 py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none sm:text-sm"
                        />
                    </div>
                </div>

                {/* xMin und xMax zentriert */}
                <div className="col-span-3 flex justify-center gap-16">
                    <div className="flex items-center rounded-md bg-white dark:bg-gray-700 pl-3 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                        <div className="shrink-0 text-base text-gray-500 dark:text-gray-400 select-none sm:text-sm">
                            Xmin:
                        </div>
                        <input
                            id="minX"
                            type="number"
                            value={graphBounds.xMin}
                            onChange={(e) =>
                                setGraphBounds({ ...graphBounds, xMin: parseFloat(e.target.value) })
                            }
                            aria-label="X minimum"
                            className="w-24 py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none sm:text-sm"
                        />
                    </div>
                    <div className="flex items-center rounded-md bg-white dark:bg-gray-700 pl-3 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                        <div className="shrink-0 text-base text-gray-500 dark:text-gray-400 select-none sm:text-sm">
                            Xmax:
                        </div>
                        <input
                            id="maxX"
                            type="number"
                            value={graphBounds.xMax}
                            onChange={(e) =>
                                setGraphBounds({ ...graphBounds, xMax: parseFloat(e.target.value) })
                            }
                            aria-label="X maximum"
                            className="w-24 py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none sm:text-sm"
                        />
                    </div>
                </div>

                {/* yMin unten in der Mitte */}
                <div className="col-span-3 flex justify-center">
                    <div className="flex items-center rounded-md bg-white dark:bg-gray-700 pl-3 outline-1 -outline-offset-1 outline-gray-300 dark:outline-gray-600 has-[input:focus-within]:outline-2 has-[input:focus-within]:-outline-offset-2 has-[input:focus-within]:outline-indigo-600">
                        <div className="shrink-0 text-base text-gray-500 dark:text-gray-400 select-none sm:text-sm">
                            Ymin:
                        </div>
                        <input
                            id="minY"
                            type="number"
                            value={graphBounds.yMin}
                            onChange={(e) =>
                                setGraphBounds({ ...graphBounds, yMin: parseFloat(e.target.value) })
                            }
                            aria-label="Y minimum"
                            className="w-24 py-1.5 pr-3 pl-1 text-base text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none sm:text-sm"
                        />
                    </div>
                </div>
              </div>

              <br />
    
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
}

export default ChangeGraphBoundDialog;