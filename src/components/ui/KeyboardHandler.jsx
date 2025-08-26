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
        const active = document.activeElement;

        // Only handle events when the chart (role="application") is focused
        if (!active || active.getAttribute('role') !== 'application') {
          return;
        }

        pressedKeys.current.add(event.key.toLowerCase());   // Store the pressed key in the set
        const activeFunctions = getActiveFunctions(functionDefinitions);
        const step = event.shiftKey ? 5 : 1; // if shift is pressed, change step size

        // Handle "b" key for batch exploration
        if (event.key === "b" || event.key === "B") {
            setPlayFunction(prev => ({ ...prev, source: "play", active: !prev.active }));
            if (!PlayFunction.active) {
                setExplorationMode("batch");
            } else {
                setExplorationMode("none");
            }
            return;
        }

        switch (event.key) {
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

            case "z": case "Z":
                ZoomBoard(event.shiftKey, pressedKeys.current.has("x"), pressedKeys.current.has("y"));
                break;

            case "ArrowLeft": case "ArrowRight":
                // If batch sonification is active, stop it and keep cursor at current position
                if (PlayFunction.active && PlayFunction.source === "play") {
                    setPlayFunction(prev => ({ ...prev, active: false }));
                    setExplorationMode("none");
                    console.log("Batch sonification stopped by arrow key");
                    break;
                }

                // Handle Cmd/Ctrl + Left/Right for cursor positioning
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    const bounds = graphSettings?.defaultView || [-10, 10, 10, -10];
                    if (event.key === "ArrowLeft") {
                        // Go to beginning with Cmd/Ctrl + Left
                        const [xMin] = bounds;
                        updateCursor(xMin);
                    } else {
                        // Go to end with Cmd/Ctrl + Right
                        const [, xMax] = bounds;
                        updateCursor(xMax);
                    }
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
                    // Use a more robust approach to check if we're on the grid
                    // This handles floating-point precision issues
                    const epsilon = 1e-10; // Small tolerance for floating-point comparison
                    const gridPosition = Math.round(CurrentX / stepSize) * stepSize;
                    let IsOnGrid = Math.abs(CurrentX - gridPosition) < epsilon;
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
                // if (event.shiftKey) {
                //     setPlayFunction(prev => ({ ...prev, speed: prev.speed + (Math.abs(prev.speed+0.5) >= 10 ? 10 : 1) })); // Increase speed with Ctrl + Up
                //     break;
                // }
                break;
            case "ArrowDown":
                // if (event.shiftKey) {
                //     setPlayFunction(prev => ({ ...prev, speed: prev.speed - (Math.abs(prev.speed-0.5) >= 10 ? 10 : 1) })); // Decrease speed with Ctrl + Down
                //     break;
                // }
                break;

            default:
                break;
        }
      };

      const handleKeyUp = (e) => {
        const active = document.activeElement;
  
        // Only handle events when the chart (role="application") is focused
        if (!active || active.getAttribute('role') !== 'application') {
          return;
        }

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
    }, [setPlayFunction, setIsAudioEnabled, setGraphBounds, setGraphSettings, inputRefs, cursorCoords, updateCursor, stepSize, functionDefinitions, setExplorationMode, PlayFunction, mouseTimeoutRef, isAudioEnabled, ZoomBoard]);
  
    return null;
}