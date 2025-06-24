import { useRegisterActions, Priority } from "kbar";
import { Volume2, VolumeX, MapPin, Eye, EyeOff, Settings, ChartSpline } from "lucide-react"
import { useGraphContext } from "../../context/GraphContext";
import { getFunctionNameN, updateFunctionN } from "../../utils/graphObjectOperations";
import { useDialog } from "../../context/DialogContext";

export const useDynamicKBarActions = () => {
  const { isAudioEnabled, setIsAudioEnabled, cursorCoords, functionDefinitions, setFunctionDefinitions } = useGraphContext();
  const { openDialog } = useDialog();

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

  // Create parent element for Functions section and function toggle actions
  const functionsActions = [
    // Parent element for Functions
    {
      id: "show/hide-functions",
      name: "Show/hide Functions",
      shortcut: ["f"],
      keywords: "functions, toggle, show, hide, manage",
      priority: Priority.NORMAL,
      icon: <Settings className="size-5 shrink-0 opacity-70" />,
    },

    {
      id: "toggle-function",
      name: "Visibility Menu",
      shortcut: ["t"],
      keywords: "toggle, activate, deactivate, function, enable, disable",
      parent: "show/hide-functions",
      perform: () => openDialog("showHide-functions"),
      icon: <ChartSpline className="size-5 shrink-0 opacity-70" />,
    },
    // Individual function toggle actions
    ...(functionDefinitions || []).map((func, index) => {
      const functionName = getFunctionNameN(functionDefinitions, index) || `Function ${index + 1}`;
      const isActive = func.isActive;
      
      return {
        id: `toggle-function-${func.id}`,
        name: isActive ? `Hide ${functionName}` : `Show ${functionName}`,
        keywords: `function, toggle, ${functionName}, ${isActive ? 'hide, disable, deactivate' : 'show, enable, activate'}`,
        parent: "show/hide-functions",
        priority: Priority.NORMAL,
        perform: () => {
          const updatedDefinitions = updateFunctionN(functionDefinitions, index, { isActive: !isActive });
          setFunctionDefinitions(updatedDefinitions);
        },
        icon: isActive 
          ? <EyeOff className="size-5 shrink-0 opacity-70" /> 
          : <Eye className="size-5 shrink-0 opacity-70" />,
      };
    })
  ];

  useRegisterActions(functionsActions, [functionDefinitions]);

  return null;
};

// wrapper for easy usage
export const DynamicPaletteActions = () => {
  useDynamicKBarActions();
  return null;
};