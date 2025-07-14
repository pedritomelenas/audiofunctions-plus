import { useRegisterActions, Priority } from "kbar";
import { Volume2, VolumeX, MapPin, Eye, EyeOff, Settings, ChartSpline, CircleGauge, List, ZoomIn, ZoomOut, 
  SwatchBook, Sun, Moon, SunMoon, Contrast,
  ChartArea, FileChartLine, Grid3X3, Share, } from "lucide-react"
import { useGraphContext } from "../../context/GraphContext";
import { getFunctionNameN, updateFunctionN } from "../../utils/graphObjectOperations";
import { useDialog } from "../../context/DialogContext";
import { setTheme } from "../../utils/theme"; // Import the theme utility
import { useZoomBoard } from "./KeyboardHandler"; // Import the zoom utility

export const useDynamicKBarActions = () => {
  const { isAudioEnabled, setIsAudioEnabled, cursorCoords, functionDefinitions, setFunctionDefinitions } = useGraphContext();
  const { openDialog } = useDialog();

  const ZoomBoard = useZoomBoard();

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


  
  useRegisterActions([

    // quick options
    {
      id: "quick-options",
      name: "Quick Options",
      shortcut: ["q"],
      keywords: "quick, quickoptions",
      // perform: () => {},
      icon: <List className="size-5 shrink-0 opacity-70" />,
    },


    {
      id: "toggle-audio",
      name: isAudioEnabled ? "Stop Audio" : "Start Audio",
      shortcut: [""],
      keywords: "audio, sound, enable, disable, start, stop, toggle",
      parent: "quick-options",
      perform: () => setIsAudioEnabled(prev => !prev),
      icon: isAudioEnabled 
        ? <VolumeX className="size-5 shrink-0 opacity-70" /> 
        : <Volume2 className="size-5 shrink-0 opacity-70" />,
    },

    {
      id: "show-coordinates",
      name: "Show Current Coordinates",
      shortcut: ["c"],
      keywords: "coordinates position cursor show alert accessibility",
      parent: "quick-options",
      perform: showCoordinatesAlert,
      icon: <MapPin className="size-5 shrink-0 opacity-70" />,
    },

    {
      id: "change-audio-speed",
      name: "Change Audio Speed",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => openDialog("speed-adjustment"),
      icon: <CircleGauge className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "zoom-in",
      name: "Zoom In",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => ZoomBoard(false),
      icon: <ZoomIn className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "zoom-out",
      name: "Zoom Out",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => ZoomBoard(true),
      icon: <ZoomOut className="size-5 shrink-0 opacity-70" />,
    },






    // Show/hide functions section
    {
      id: "show/hide-functions",
      name: "Show/hide Functions",
      shortcut: ["h"],
      keywords: "functions, toggle, show, hide, manage",
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
        perform: () => {
          const updatedDefinitions = updateFunctionN(functionDefinitions, index, { isActive: !isActive });
          setFunctionDefinitions(updatedDefinitions);
        },
        icon: isActive 
          ? <EyeOff className="size-5 shrink-0 opacity-70" /> 
          : <Eye className="size-5 shrink-0 opacity-70" />,
      };
    }),






    // Edit functions
    {
      id: "change-function",
      name: "Edit Functions",
      shortcut: ["f"],
      keywords: "function, change function, change graph, graph, edit function, edit graph",
      //  section: "",
      perform: () => openDialog("edit-function"),
      icon: <ChartSpline className="size-5 shrink-0 opacity-70" />,
    },



    // Diagramm Options
    {
      id: "diagram-options",
      name: "Diagram Options",
      // shortcut: [""],
      keywords: "diagramm",
      // perform: () => {},
      icon: <FileChartLine className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "set-view",
      name: "Set View",
      // shortcut: [""],
      keywords: "view",
      parent: "diagram-options",
      perform: () => openDialog("change-graph-bound"),
      icon: <ChartArea className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "movement-adjustments",
      name: "Movement Adjustments",
      shortcut: ["m"],
      keywords: "movement, speed, step, navigation, adjustments",
      parent: "diagram-options",
      perform: () => openDialog("movement-adjustments"),
      icon: <CircleGauge className="size-5 shrink-0 opacity-70" />,
    },




    // Share
    {
      id: "share",
      name: "Share",
      shortcut: [""],
      keywords: "share, export, link",
      perform: () => openDialog("share"),
      icon: <Share className="size-5 shrink-0 opacity-70" />,
    },





    // Change theme
    {
      id: "change-theme",
      name: "Change Theme",
      // shortcut: [""],
      keywords: "theme",
      // perform: () => {},
      icon: <SwatchBook className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "system-theme",
      name: "Use System Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {setTheme("system")},
      icon: <SunMoon className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "light-theme",
      name: "Light Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {setTheme("light")},
      icon: <Sun className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "dark-theme",
      name: "Dark Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {setTheme("dark")},
      icon: <Moon className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "high-contrast-theme",
      name: "High Contrast Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {setTheme("high-contrast")},
      icon: <Contrast className="size-5 shrink-0 opacity-70" />,
    },

  ], [isAudioEnabled, cursorCoords, functionDefinitions]);















  return null;
};

// wrapper for easy usage
export const PaletteActions = () => {
  useDynamicKBarActions();
  return null;
};