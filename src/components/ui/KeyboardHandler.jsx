import { useEffect, useRef } from "react";
import { useGraphContext } from "../../context/GraphContext";
import { getActiveFunctions } from "../../utils/graphObjectOperations";


// Export the ZoomBoard function so it can be used in other components
export const useZoomBoard = () => {
  const { setGraphBounds } = useGraphContext();
  
  return (out, xOnly = false, yOnly = false) => {
    const scaleFactor = {x: 0.9, y: 0.9};
    if (out) { scaleFactor.x = 1.1; scaleFactor.y = 1.1; }
    if (xOnly) scaleFactor.y = 1; //only x axis zoom
    if (yOnly) scaleFactor.x = 1; //only y axis zoom
    setGraphBounds(prev => ({
      xMin: prev.xMin * scaleFactor.x,
      xMax: prev.xMax * scaleFactor.x,
      yMin: prev.yMin * scaleFactor.y,
      yMax: prev.yMax * scaleFactor.y,
    }));
  };
};

export default function KeyboardHandler() {
    const { 
        setPlayFunction, 
        setIsAudioEnabled, 
        setGraphBounds,
        inputRefs,
        setGraphSettings,
        cursorCoords, 
        updateCursor,
        stepSize,
        functionDefinitions
    } = useGraphContext();

    const pressedKeys = useRef(new Set());

    // Use the exported zoom function
    const ZoomBoard = useZoomBoard();
  
    useEffect(() => {
      const handleKeyDown = (event) => {
        pressedKeys.current.add(event.key.toLowerCase());   // Store the pressed key in the set
        
        const activeFunctions = getActiveFunctions(functionDefinitions);

        const active = document.activeElement;

        // Blur the input field on Escape or Enter key press
        if (isEditableElement(active) && (event.key === "Escape" || event.key === "Enter")) {
            //event.preventDefault();  //not sure with this
            active.blur(); 
        }

        if (isEditableElement(active)) return; //no response if input or textarea is focused

        const step = event.shiftKey ? 5 : 1; // if shift is pressed, change step size

        switch (event.key) {

            //Switch audio on/off
            case "p":
                setIsAudioEnabled(prev => !prev);
                break;

            //Activate function input
            case "f":
                inputRefs.function.current?.focus();
                event.preventDefault();
                break;

            case "r": // Reset graph bounds to default
                setGraphBounds({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
                updateCursor(0);
                break;

            case "g": // Tohggle grid visibility - not sure how to do and if we really need this
                console.log("Toggle grid visibility");
                //setGraphSettings(prev => ({ ...prev, showGrid: !prev.showGrid }));
                break;

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

            //B - play function
            case "b":
                setPlayFunction(prev => ({ ...prev, source: "play", active: !prev.active }));
                break;
            //Shift-B - activate speed input
            case "B":
                inputRefs.speed.current?.focus();
                event.preventDefault();
                break;

            //Arrows            
            case "ArrowLeft": case "ArrowRight":
                let direction = 1;                               //right by default
                if (event.key === "ArrowLeft") direction = -1;   //left if left arrow pressed
                if (event.shiftKey) {
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
                    // this code is for moving to the next point of interest
                    // if (direction === 1){
                    //     sl = l.filter(e => (CurrentX < e) && (e < NewX));
                    // }else{
                    //     sl = l.filter(e => (NewX < e) && (e < CurrentX));
                    // }
                    // if (sl.length> 0) {
                    //     //console.log("Filtered points of interest to be considered: (x-coordinates)  ", sl.toString());
                    //     if (direction === 1) {
                    //         // If moving right, snap to the next point of interest
                    //         NewX = sl[0];
                    //     } else {
                    //         // If moving left, snap to the previous point of interest
                    //         NewX = sl[sl.length - 1];
                    //     }
                    // }
                    let snapaccuracy= stepSize/5;
                    if (direction === 1) {
                        sl = l.filter(e => (CurrentX < e)  && (Math.abs(e-NewX) < snapaccuracy));
                    } else {
                        sl = l.filter(e => (e < CurrentX) && (Math.abs(e-NewX) < snapaccuracy));
                    }
                    if (sl.length > 0) {
                        console.log("Filtered points of interest to be considered: (x-coordinates) for snapping ", sl.toString());
                    }
                    let snappedX = sl.length > 0 ? sl[0] : NewX;
                    //console.log("Current X:", CurrentX, "New X:", NewX, "Snapped X:", snappedX);

                    updateCursor(snappedX);                                                                      // one step move
                } else {
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
