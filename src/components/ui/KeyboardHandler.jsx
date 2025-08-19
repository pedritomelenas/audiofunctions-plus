import { useEffect, useRef } from "react";
import { useGraphContext } from "../../context/GraphContext";
import { getActiveFunctions } from "../../utils/graphObjectOperations";
import audioSampleManager from "../../utils/audioSamples";


// Export the ZoomBoard function so it can be used in other components
export const useZoomBoard = () => {
  const { setGraphBounds, graphSettings, isAudioEnabled } = useGraphContext();
  
  return (out, xOnly = false, yOnly = false) => {
    const scaleFactor = {x: 0.9, y: 0.9};
    if (out) { scaleFactor.x = 1.1; scaleFactor.y = 1.1; }
    if (xOnly) scaleFactor.y = 1; //only x axis zoom
    if (yOnly) scaleFactor.x = 1; //only y axis zoom

    // Calculate new bounds
    const newBounds = {
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0
    };

    setGraphBounds(prev => {
      // Calculate new bounds
      newBounds.xMin = prev.xMin * scaleFactor.x;
      newBounds.xMax = prev.xMax * scaleFactor.x;
      newBounds.yMin = prev.yMin * scaleFactor.y;
      newBounds.yMax = prev.yMax * scaleFactor.y;

      // Check if new bounds would exceed limits
      const xDiff = Math.abs(newBounds.xMax - newBounds.xMin);
      const yDiff = Math.abs(newBounds.yMax - newBounds.yMin);
      
      const minDiff = graphSettings.minBoundDifference || 0.1;
      const maxDiff = graphSettings.maxBoundDifference || 100;

      // Check if zoom would exceed limits
      if (xDiff < minDiff || xDiff > maxDiff || yDiff < minDiff || yDiff > maxDiff) {
        // Play deny sound if audio is enabled
        if (isAudioEnabled) {
          try {
            audioSampleManager.playSample("deny", { volume: -10 }); // Lower volume to match other feedback sounds
          } catch (error) {
            console.warn("Failed to play deny sound:", error);
          }
        }
        // Return previous bounds to prevent zoom
        return prev;
      }

      // Return new bounds if within limits
      return newBounds;
    });
  };
};

export default function KeyboardHandler() {
    const { 
        setPlayFunction, 
        setIsAudioEnabled, 
        setGraphBounds,
        inputRefs,
        graphSettings,
        setGraphSettings,
        cursorCoords, 
        updateCursor,
        stepSize,
        functionDefinitions,
        setExplorationMode,
        PlayFunction,
        mouseTimeoutRef,
        isAudioEnabled
    } = useGraphContext();

    const pressedKeys = useRef(new Set());
    const lastKeyDownTime = useRef(null);
    const HOLD_THRESHOLD = 1000; // Time in ms before allowing continuous movement
    const KEYPRESS_THRESHOLD = 50; // Time in ms to filter out false positive keyup events (typical key repeat delay is ~30ms)

    // Use the exported zoom function
    const ZoomBoard = useZoomBoard();
  
    useEffect(() => {
      const handleKeyDown = async (event) => {
        pressedKeys.current.add(event.key.toLowerCase());   // Store the pressed key in the set
        
        const activeFunctions = getActiveFunctions(functionDefinitions);

        const active = document.activeElement;

        // Blur the input field on Escape or Enter key press
        if (isEditableElement(active) && (event.key === "Escape" || event.key === "Enter")) {
            //event.preventDefault();  //not sure with this
            active.blur(); 
        }

        const step = event.shiftKey ? 5 : 1; // if shift is pressed, change step size

        // Handle "b" key even when input is focused (for batch exploration)
        if (event.key === "b" || event.key === "B") {
            setPlayFunction(prev => ({ ...prev, source: "play", active: !prev.active }));
            if (!PlayFunction.active) {
                setExplorationMode("batch");
            } else {
                setExplorationMode("none");
            }
            return;
        }

        // For all other keys, don't respond if input or textarea is focused
        if (isEditableElement(active)) return; //no response if input or textarea is focused

        switch (event.key) {

            // //Switch audio on/off
            // case "p":
            //     setIsAudioEnabled(prev => !prev);
            //     break;

            //Activate function input
            // case "f":
            //     inputRefs.function.current?.focus();
            //     event.preventDefault();
            //     break;

            // case "r": // Reset graph bounds to default
            //     // Use defaultView from graphSettings instead of hardcoded values
            //     const defaultView = graphSettings?.defaultView;
            //     if (defaultView && Array.isArray(defaultView) && defaultView.length === 4) {
            //         const [xMin, xMax, yMax, yMin] = defaultView;
            //         setGraphBounds({ xMin, xMax, yMin, yMax });
            //     } else {
            //         // Fallback to hardcoded values if defaultView is not available
            //         setGraphBounds({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
            //     }
            //     updateCursor(0);
            //     break;

            // case "g": // Tohggle grid visibility - not sure how to do and if we really need this
            //     console.log("Toggle grid visibility");
            //     //setGraphSettings(prev => ({ ...prev, showGrid: !prev.showGrid }));
            //     break;

            //WASD to move the view, Shift to bigger steps  (maybe change step according to zoom level?)
            case "a": case "A":
                setGraphBounds(prev => ({ ...prev, xMin: prev.xMin - step, xMax: prev.xMax - step }));
                break;
            case "d": case "D":
                setGraphBounds(prev => ({ ...prev, xMin: prev.xMin + step, xMax: prev.xMax + step }));
                break;
            case "w": case "W":
                setGraphBounds(prev => ({ ...prev, yMin: prev.yMin + step, yMax: prev.yMax + step }));
                break;
            case "s": case "S":
                setGraphBounds(prev => ({ ...prev, yMin: prev.yMin - step, yMax: prev.yMax - step }));
                break;

            //Z and Shift-Z for zoom in/out, with X or Y changes one axis only
            case "z": case "Z":
                ZoomBoard(event.shiftKey, pressedKeys.current.has("x"), pressedKeys.current.has("y"));
                break;

            //Arrows            
            case "ArrowLeft": case "ArrowRight":
                // If batch sonification is active, stop it and keep cursor at current position
                if (PlayFunction.active && PlayFunction.source === "play") {
                    setPlayFunction(prev => ({ ...prev, active: false }));
                    setExplorationMode("none");
                    console.log("Batch sonification stopped by arrow key");
                    break;
                }

                // Handle Ctrl + Arrow keys to move to bounds
                if (event.ctrlKey && event.shiftKey) {
                    const bounds = graphSettings?.defaultView || [-10, 10, 10, -10];
                    const [xMin, xMax] = bounds;
                    const targetX = event.key === "ArrowLeft" ? xMin : xMax;
                    updateCursor(targetX);
                    break;
                }
                
                let direction = 1;                               //right by default
                if (event.key === "ArrowLeft") direction = -1;   //left if left arrow pressed
                // First, stop any active smooth movement
                if (PlayFunction.active && PlayFunction.source === "keyboard") {
                    setPlayFunction(prev => ({ ...prev, active: false }));
                }

                // Clear any mouse exploration timeout
                if (mouseTimeoutRef.current) {
                    clearTimeout(mouseTimeoutRef.current);
                    mouseTimeoutRef.current = null;
                }

                if (!event.shiftKey) {
                    setExplorationMode("keyboard_stepwise");
                    let CurrentX = parseFloat(cursorCoords[0].x);
                    let NewX;
                    let IsOnGrid = CurrentX % stepSize === 0;
                    if (direction === 1) {
                        NewX = IsOnGrid ? CurrentX + stepSize : Math.ceil(CurrentX / stepSize) * stepSize;
                    } else {
                        NewX = IsOnGrid ? CurrentX - stepSize :  Math.floor(CurrentX / stepSize) * stepSize;
                    }
                    let l = [];
                    activeFunctions.forEach(func => {
                        func.pointOfInterests.forEach((point) =>{ 
                            l.push(point.x);
                        }); 
                    });
                    let sl;
                    
                    const currentTime = Date.now();
                    
                    // If this is the first keydown or enough time has passed since last movement
                    if (!lastKeyDownTime.current || (currentTime - lastKeyDownTime.current) >= HOLD_THRESHOLD) {
                        // Check for points of interest
                        if (direction === 1){
                            sl = l.filter(e => (CurrentX < e) && (e < NewX));
                        } else {
                            sl = l.filter(e => (NewX < e) && (e < CurrentX));
                        }
                        if (sl.length > 0 && isAudioEnabled) {
                            try {
                                await audioSampleManager.playSample("notification", { volume: -15 });
                            } catch (error) {
                                console.warn("Failed to play notification sound:", error);
                            }
                        }
                        
                        // Move cursor and update last keydown time
                        updateCursor(NewX);
                        lastKeyDownTime.current = currentTime;
                    }
                } else {
                    setExplorationMode("keyboard_smooth");
                    setPlayFunction(prev => ({ ...prev, source: "keyboard", active: true, direction: direction }));   // smooth move
                }
                break;
            case "ArrowUp":
                if (event.ctrlKey) {
                    setPlayFunction(prev => ({ ...prev, speed: prev.speed + (Math.abs(prev.speed+0.5) >= 10 ? 10 : 1) })); // Increase speed with Ctrl + Up
                    break;
                }
                console.log("Up arrow pressed");
                break;
            case "ArrowDown":
                if (event.ctrlKey) {
                    setPlayFunction(prev => ({ ...prev, speed: prev.speed - (Math.abs(prev.speed-0.5) >= 10 ? 10 : 1) })); // Decrease speed with Ctrl + Down
                    break;
                }
                console.log("Down arrow pressed");
                break;

            default:
                break;
          }
      };

      const handleKeyUp = (e) => {
        pressedKeys.current.delete(e.key.toLowerCase());
        // If the arrow keys are released, stop move but maintain the last cursor position
        if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
          setPlayFunction(prev => {
            if (prev.source === "keyboard") {
              // Keep the current x position and just set active to false
              return { ...prev, active: false };
            }
            return prev;
          });
          // Reset exploration mode when keyboard exploration stops
          setExplorationMode("none");
          
          const currentTime = Date.now();
          const timeSinceLastKeyDown = currentTime - (lastKeyDownTime.current || 0);
          
          // Case 1: If it's a very quick keyup (< KEYPRESS_THRESHOLD), it's likely a false positive during key holding
          // Case 2: If it's a normal human keypress (> KEYPRESS_THRESHOLD but < HOLD_THRESHOLD), reset the timer
          // Case 3: If it's after the hold threshold, also reset the timer
          if (timeSinceLastKeyDown > KEYPRESS_THRESHOLD) {
            lastKeyDownTime.current = null;
          }
        }
      };
  
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
      };
    }, [setPlayFunction, setIsAudioEnabled, setGraphBounds, setGraphSettings, inputRefs]);
  
    return null;
  }

function isEditableElement(el) {
// This function checks if the currently focused element is editable
// (like an input field or a textarea) to prevent keyboard shortcuts from triggering actions when the user is typing.
    return (
    el &&
    (el.tagName === "INPUT" ||
      el.tagName === "TEXTAREA" ||
      el.isContentEditable)
  );
}
