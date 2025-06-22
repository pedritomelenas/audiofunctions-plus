import { useRegisterActions, Priority } from "kbar";
import { Volume2, VolumeX, MapPin } from "lucide-react"
import { useGraphContext } from "../../context/GraphContext";
import { getFunctionNameN } from "../../utils/graphObjectOperations";

export const useDynamicKBarActions = () => {
  const { isAudioEnabled, setIsAudioEnabled, cursorCoords, functionDefinitions } = useGraphContext();

  const showCoordinatesAlert = () => {
    console.log("Showing coordinates alert");
    if (!cursorCoords || cursorCoords.length === 0) {
        alert("No cursor position available");
        return;
    }

    const messages = cursorCoords.map(coord => {
        const functionIndex = functionDefinitions.findIndex(f => f.id === coord.functionId);
        const functionName = getFunctionNameN(functionDefinitions, functionIndex) || `Function ${functionIndex + 1}`;
        return `${functionName}: x = ${coord.x}, y = ${coord.y}`;
    });

    const message = messages.join('\n');
    alert(`Current Coordinates:\n\n${message}`);
  };

  // toggle audio
  useRegisterActions([
    {
      id: "toggle-audio",
      name: isAudioEnabled ? "Stop Audio" : "Start Audio",
      shortcut: ["a"],
      keywords: "audio, sound, enable, disable, start, stop, toggle",
      parent: "quick-options",
      priority: Priority.HIGH, 
      perform: () => setIsAudioEnabled(prev => !prev),
      icon: isAudioEnabled 
        ? <VolumeX className="size-5 shrink-0 opacity-70" /> 
        : <Volume2 className="size-5 shrink-0 opacity-70" />,
    }
  ], [isAudioEnabled]);
  // show coordinates alert
  useRegisterActions([
    {
      id: "show-coordinates",
      name: "Show Current Coordinates",
      shortcut: ["c"],
      keywords: "coordinates position cursor show alert accessibility",
      priority: Priority.High,
      perform: showCoordinatesAlert,
      icon: <MapPin className="size-5 shrink-0 opacity-70" />,
    }
  ], [cursorCoords]);

  return null;
};

// wrapper for easy usage
export const DynamicPaletteActions = () => {
  useDynamicKBarActions();
  return null;
};