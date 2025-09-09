import { useRegisterActions, Priority } from "kbar";
import { Volume2, VolumeX, MapPin, Eye, Play, SquareActivity, ChartSpline, CircleGauge, List, ZoomIn, ZoomOut, 
  SwatchBook, Sun, Moon, SunMoon, Contrast,
  ChartArea, FileChartLine, Import, Share2, FileUp, FileDown, ListRestart, RotateCcw, Music, Ruler, HelpCircle, BookOpen } from "lucide-react"
import { useGraphContext } from "../../context/GraphContext";
import { getFunctionNameN, updateFunctionN, setFunctionInstrumentN, getFunctionInstrumentN } from "../../utils/graphObjectOperations";
import { useDialog } from "../../context/DialogContext";
import { setTheme } from "../../utils/theme"; // Import the theme utility
import { useZoomBoard } from "./KeyboardHandler"; // Import the zoom utility
import { useAnnouncement } from '../../context/AnnouncementContext';
import { useInfoToast } from '../../context/InfoToastContext';

export const useDynamicKBarActions = () => {
  const { isAudioEnabled, setIsAudioEnabled, cursorCoords, functionDefinitions, setFunctionDefinitions, setPlayFunction, graphSettings, graphBounds, setGraphBounds, updateCursor, focusChart } = useGraphContext();
  const { openDialog } = useDialog();
  const { announce } = useAnnouncement();
  const { showInfoToast } = useInfoToast();
  
  // Check if in read-only or full-restriction mode
  const isReadOnly = graphSettings?.restrictionMode === "read-only";
  const isFullyRestricted = graphSettings?.restrictionMode === "full-restriction";

  const ZoomBoard = useZoomBoard();

  const showCoordinates = () => {
    if (!cursorCoords || cursorCoords.length === 0) {
        announce("No cursor position available");
        return;
    }

    const messages = cursorCoords.map(coord => {
        const functionIndex = functionDefinitions.findIndex(f => f.id === coord.functionId);
        const functionName = getFunctionNameN(functionDefinitions, functionIndex) || `Function ${functionIndex + 1}`;
        const roundedX = Number(coord.x).toFixed(2);
        const roundedY = Number(coord.y).toFixed(2);
        return `${functionName}: x = ${roundedX}, y = ${roundedY}`;
    });

    const message = messages.join('\n');
    announce(`Current Coordinates:\n\n${message}`);
    showInfoToast(`Current Coordinates:\n\n${message}`);
  };

  const showViewBounds = () => {
    const { xMin, xMax, yMin, yMax } = graphBounds;
    const roundedXMin = Number(xMin).toFixed(2);
    const roundedXMax = Number(xMax).toFixed(2);
    const roundedYMin = Number(yMin).toFixed(2);
    const roundedYMax = Number(yMax).toFixed(2);
    const message = `Current View Bounds:\n\nX: [${roundedXMin}, ${roundedXMax}]\nY: [${roundedYMin}, ${roundedYMax}]`;
    announce(message);
    showInfoToast(message);
  }

  // Switch to next active function
  const switchToNextFunction = () => {
    if (!functionDefinitions || functionDefinitions.length === 0) return;
    
    // Find currently active function
    const currentActiveIndex = functionDefinitions.findIndex(func => func.isActive);
    
    // If no function is active, activate the first one
    if (currentActiveIndex === -1) {
      if (functionDefinitions.length > 0) {
        const updatedDefinitions = functionDefinitions.map((func, index) => ({
          ...func,
          isActive: index === 0
        }));
        setFunctionDefinitions(updatedDefinitions);
      }
      return;
    }
    
    // Find next function index (rotate through the list)
    const nextIndex = (currentActiveIndex + 1) % functionDefinitions.length;
    
    // Deactivate all functions and activate the next one
    const updatedDefinitions = functionDefinitions.map((func, index) => ({
      ...func,
      isActive: index === nextIndex
    }));
    
    setFunctionDefinitions(updatedDefinitions);
    
    // Announce the switch
    const functionName = getFunctionNameN(functionDefinitions, nextIndex) || `Function ${nextIndex + 1}`;
    announce(`Switched to ${functionName}`);
    showInfoToast(`${functionName}`, 1500);
  };

  // Show specific function and hide all others
  const showOnlyFunction = (targetIndex) => {
    if (!functionDefinitions || targetIndex < 0 || targetIndex >= functionDefinitions.length) return;
    
    const updatedDefinitions = functionDefinitions.map((func, index) => ({
      ...func,
      isActive: index === targetIndex
    }));
    
    setFunctionDefinitions(updatedDefinitions);
    
    // Announce the switch
    const functionName = getFunctionNameN(functionDefinitions, targetIndex) || `Function ${targetIndex + 1}`;
    announce(`Switched to ${functionName}`);
    showInfoToast(`${functionName}`, 1500);
  };

  // Toggle sonification type for active function
  const toggleSonificationType = () => {
    if (!functionDefinitions || functionDefinitions.length === 0) return;
    
    // Find currently active function
    const activeIndex = functionDefinitions.findIndex(func => func.isActive);
    if (activeIndex === -1) return;
    
    const currentInstrument = getFunctionInstrumentN(functionDefinitions, activeIndex);
    
    // Toggle between discrete (guitar) and continuous (clarinet) sonification
    const newInstrument = currentInstrument === 'guitar' ? 'clarinet' : 'guitar';
    const sonificationType = newInstrument === 'guitar' ? 'discrete' : 'continuous';
    
    const updatedDefinitions = setFunctionInstrumentN(functionDefinitions, activeIndex, newInstrument);
    setFunctionDefinitions(updatedDefinitions);

    announce(`Sonification type changed to ${sonificationType}`);
    showInfoToast(`Sonification: ${sonificationType}`, 1500);
    
    console.log(`Sonification type changed to ${sonificationType} (${newInstrument}) for active function`);
  };

  // Get current sonification type for active function
  const getCurrentSonificationType = () => {
    if (!functionDefinitions || functionDefinitions.length === 0) return 'continuous';
    
    const activeIndex = functionDefinitions.findIndex(func => func.isActive);
    if (activeIndex === -1) return 'continuous';
    
    const currentInstrument = getFunctionInstrumentN(functionDefinitions, activeIndex);
    return currentInstrument === 'guitar' ? 'discrete' : 'continuous';
  };

  const currentSonificationType = getCurrentSonificationType();

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
      shortcut: ["p"],
      keywords: "audio, sound, enable, disable, start, stop, toggle",
      parent: "quick-options",
      perform: () => {setIsAudioEnabled(prev => !prev); setTimeout(() => focusChart(), 100);},
      icon: isAudioEnabled 
        ? <VolumeX className="size-5 shrink-0 opacity-70" /> 
        : <Volume2 className="size-5 shrink-0 opacity-70" />,
    },

    {
      id: "show-coordinates",
      name: "Show Current Coordinates",
      shortcut: ["c"],
      keywords: "coordinates position location",
      parent: "quick-options",
      perform: () => {showCoordinates(); setTimeout(() => focusChart(), 100);},
      icon: <MapPin className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "show-view-bounds",
      name: "Show current view bounds",
      shortcut: ["v"],
      keywords: "bound view range axis",
      parent: "quick-options",
      perform: () => {showViewBounds(); setTimeout(() => focusChart(), 100);},
      icon: <Ruler className="size-5 shrink-0 opacity-70" />,
    },

    // Switch function
    {
      id: "next-function",
      name: "Next Function",
      shortcut: ["n"],
      keywords: "switch, function, next, rotate, cycle",
      parent: "quick-options",
      perform: () => {switchToNextFunction(); setTimeout(() => focusChart(), 100);},
      icon: <ListRestart className="size-5 shrink-0 opacity-70" />,
    },
    
    // Play full function
    {
      id: "play-function",
      name: "Play Function",
      shortcut: ["b"], // Removed to avoid conflict with keyboard handler
      keywords: "play, run, complete, automatic, auto, autoplay",
      parent: "quick-options",
      perform: () => {setPlayFunction(prev => ({ ...prev, source: "play", active: !prev.active })); setTimeout(() => focusChart(), 100);},
      icon: <Play className="size-5 shrink-0 opacity-70" />,
    },

    // Toggle sonification type
    {
      id: "toggle-sonification-type",
      name: `Change Sonification-Instrument to ${currentSonificationType === 'discrete' ? 'Continuous' : 'Discrete'}`,
      shortcut: ["i"],
      keywords: "sonification, instrument, discrete, continuous, guitar, clarinet, toggle",
      parent: "quick-options",
      perform: () => {toggleSonificationType(); setTimeout(() => focusChart(), 100);},
      icon: <Music className="size-5 shrink-0 opacity-70" />,
    },

    // Reset View
    {
      id: "reset-view",
      name: "Reset View",
      shortcut: ["r"],
      keywords: "reset, restore, standard",
      parent: "quick-options",
      perform: () => {
        // Use defaultView from graphSettings instead of hardcoded values
        const defaultView = graphSettings?.defaultView;
        if (defaultView && Array.isArray(defaultView) && defaultView.length === 4) {
            const [xMin, xMax, yMax, yMin] = defaultView;
            setGraphBounds({ xMin, xMax, yMin, yMax });
          } else {
            // Fallback to hardcoded values if defaultView is not available
            setGraphBounds({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
          }
          updateCursor(0);
          
          announce("View reset to default values");
          showInfoToast("Default view", 1500);

          setTimeout(() => focusChart(), 100);
      },
      icon: <RotateCcw className="size-5 shrink-0 opacity-70" />,
    },

    // {
    //   id: "change-audio-speed",
    //   name: "Change Audio Speed",
    //   // shortcut: [""],
    //   // keywords: ", ",
    //   parent: "quick-options",
    //   perform: () => openDialog("speed-adjustment"),
    //   icon: <CircleGauge className="size-5 shrink-0 opacity-70" />,
    // },
    // {
    //   id: "zoom-in",
    //   name: "Zoom In",
    //   // shortcut: [""],
    //   // keywords: ", ",
    //   parent: "quick-options",
    //   perform: () => ZoomBoard(false),
    //   icon: <ZoomIn className="size-5 shrink-0 opacity-70" />,
    // },
    // {
    //   id: "zoom-out",
    //   name: "Zoom Out",
    //   // shortcut: [""],
    //   // keywords: ", ",
    //   parent: "quick-options",
    //   perform: () => ZoomBoard(true),
    //   icon: <ZoomOut className="size-5 shrink-0 opacity-70" />,
    // },



    // Function selection section
    {
      id: "select-function",
      name: "Switch active Function",
      shortcut: [""],
      keywords: "function, select, show, display",
      icon: <SquareActivity className="size-5 shrink-0 opacity-70" />,
    },
    // Switch function
    {
      id: "next-function",
      name: "Next Function",
      shortcut: ["n"],
      keywords: "switch, function, next, rotate, cycle",
      parent: "select-function",
      perform: () => {switchToNextFunction(); setTimeout(() => focusChart(), 100);},
      icon: <ListRestart className="size-5 shrink-0 opacity-70" />,
    },

    // Individual function selection actions
    ...(functionDefinitions || []).map((func, index) => {
      const functionName = getFunctionNameN(functionDefinitions, index) || `Function ${index + 1}`;
      
      return {
        id: `show-function-${func.id}`,
        name: `Show ${functionName}`,
        shortcut: index < 9 ? [(index + 1).toString()] : undefined, // Add hotkeys 1-9 for first 9 functions
        keywords: `function, show, display, ${functionName}`,
        parent: "select-function",
        perform: () => {showOnlyFunction(index); setTimeout(() => focusChart(), 100);},
        icon: <Eye className="size-5 shrink-0 opacity-70" />,
      };
    }),



    // COMMENTED OUT: Old show/hide functionality
    /*
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
    */

    // Edit functions - only show if not in full-restriction mode
    ...(!isFullyRestricted ? [
      {
        id: "change-function",
        name: isReadOnly ? "View Functions" : "Edit Functions",
        shortcut: ["f"],
        keywords: isReadOnly 
          ? "function, view function, view graph, graph, show function, display function"
          : "function, change function, change graph, graph, edit function, edit graph",
        perform: () => {openDialog("edit-function");},
        icon: <ChartSpline className="size-5 shrink-0 opacity-70" />,
      }
    ] : []),



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
    
    {
      id: "reset-view",
      name: "Reset View",
      shortcut: ["r"],
      keywords: "reset, restore, standard",
      parent: "diagram-options",
      perform: () => {
        // Use defaultView from graphSettings instead of hardcoded values
        const defaultView = graphSettings?.defaultView;
        if (defaultView && Array.isArray(defaultView) && defaultView.length === 4) {
            const [xMin, xMax, yMax, yMin] = defaultView;
            setGraphBounds({ xMin, xMax, yMin, yMax });
        } else {
            // Fallback to hardcoded values if defaultView is not available
            setGraphBounds({ xMin: -10, xMax: 10, yMin: -10, yMax: 10 });
        }
        updateCursor(0);

        announce("View reset to default values");
        showInfoToast("Default view", 1500);

        setTimeout(() => focusChart(), 100);
      },
      icon: <RotateCcw className="size-5 shrink-0 opacity-70" />,
    },





    // Import/Export - only show if not in read-only mode
    ...(!isReadOnly && !isFullyRestricted ? [
      {
        id: "import-export",
        name: "Import/Export",
        keywords: "import, export, json, file, save, load, share",
        icon: <Import className="size-5 shrink-0 opacity-70" />,
        priority: Priority.LOW      
      },
      {
        id: "share",
        name: "Share",
        shortcut: [""],
        keywords: "share, export, link",
        parent: "import-export",
        perform: () => openDialog("share"),
        icon: <Share2 className="size-5 shrink-0 opacity-70" />,
      },
      {
        id: "import-json",
        name: "Import from file",
        shortcut: [""],
        keywords: "import, json, upload, file",
        parent: "import-export",
        perform: () => openDialog("import-json"),
        icon: <FileUp className="size-5 shrink-0 opacity-70" />,
      },
      {
        id: "export-json",
        name: "Export as file",
        shortcut: [""],
        keywords: "export, json, download, save, file",
        parent: "import-export",
        perform: () => openDialog("export-json"),
        icon: <FileDown className="size-5 shrink-0 opacity-70" />,
      }
    ] : []),



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
      perform: () => {setTheme("system"); announce("Theme set to system preference");},
      icon: <SunMoon className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "light-theme",
      name: "Light Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {setTheme("light"); announce("Theme set to light mode");},
      icon: <Sun className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "dark-theme",
      name: "Dark Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {setTheme("dark"); announce("Theme set to dark mode");},
      icon: <Moon className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "high-contrast-theme",
      name: "High Contrast Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {setTheme("high-contrast"); announce("Theme set to high contrast mode");},
      icon: <Contrast className="size-5 shrink-0 opacity-70" />,
    },


    // Help section
    {
      id: "help",
      name: "Help",
      keywords: "help, tutorial, guide, welcome",
      shortcut: ["F1"],
      perform: () => openDialog("welcome"),
      icon: <HelpCircle className="size-5 shrink-0 opacity-70" />,
      priority: Priority.LOW,
    },

  ], [isAudioEnabled, cursorCoords, functionDefinitions, isReadOnly, focusChart]);

  return null;
};

// wrapper for easy usage
export const PaletteActions = () => {
  useDynamicKBarActions();
  return null;
};