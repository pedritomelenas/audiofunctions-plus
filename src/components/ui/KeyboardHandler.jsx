import { useEffect, useRef } from "react";
import { useGraphContext } from "../../context/GraphContext";

export default function KeyboardHandler() {
    const { 
        setPlayFunction, 
        setIsAudioEnabled, 
        setGraphBounds,
        inputRefs,
        setGraphSettings,
        cursorCoords, 
        updateCursor
    } = useGraphContext();

    const pressedKeys = useRef(new Set());  //remember pressed keys to detect combinations

    // Function to zoom the graph board in or out
    const ZoomBoard = (out, xOnly, yOnly) => {
        const scaleFactor = {x: 0.9, y: 0.9};
        if (out) { scaleFactor.x = 1.1; scaleFactor.y = 1.1; }
        if (xOnly) scaleFactor.y = 1; //only x axis zoom
        if (yOnly) scaleFactor.x = 1; //only y axis zoom
        setGraphBounds(prev => ({
            xMin: prev.xMin * scaleFactor.x,
            xMax: prev.xMax * scaleFactor.x,
            yMin: prev.yMin * scaleFactor.y,
            yMax: prev.yMax * scaleFactor.y
        }));
    }
  
    useEffect(() => {
      const handleKeyDown = (event) => {
        pressedKeys.current.add(event.key.toLowerCase());   // Store the pressed key in the set

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
                setPlayFunction(prev => ({ ...prev, active: !prev.active }));
                break;
            //Shift-B - activate speed input
            case "B":
                inputRefs.speed.current?.focus();
                event.preventDefault();
                break;

            //Arrows
            case "ArrowLeft":
                updateCursor(parseFloat(cursorCoords.x) - 0.1);
                break;
            case "ArrowRight":
                updateCursor(parseFloat(cursorCoords.x) + 0.1);
                break;
            case "ArrowUp":
                if (event.ctrlKey) {
                    setPlayFunction(prev => ({ ...prev, speed: prev.speed + 10 })); // Increase speed with Ctrl + Up
                    break;
                }
                console.log("Up arrow pressed");
                break;
            case "ArrowDown":
                if (event.ctrlKey) {
                    setPlayFunction(prev => ({ ...prev, speed: prev.speed - 10 })); // Decrease speed with Ctrl + Down
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
      };
  
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
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
