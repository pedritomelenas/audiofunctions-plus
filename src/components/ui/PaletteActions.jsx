import React from "react";
import { ChartSpline, Play, CircleGauge, List, ZoomIn, ZoomOut, 
  SwatchBook, Sun, Moon, SunMoon, Contrast,
  ChartArea, FileChartLine, Grid3X3, Volume2, VolumeX } from "lucide-react"
import { useGraphContext } from "../../context/GraphContext";
import { useDialog } from "../../context/DialogContext";
import { setTheme } from "../../utils/theme"; // Import the theme utility

export const useKBarActions = () => {
  const { openDialog } = useDialog();
  const { setFunctionInput, isAudioEnabled, setIsAudioEnabled } = useGraphContext();

  return [
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
      name: "Start/Stop Audio",
      shortcut: [""],
      keywords: "audio, sound, enable, disable, start, stop, toggle",
      parent: "quick-options",
      perform: () => setIsAudioEnabled(prev => !prev),
      icon: isAudioEnabled 
        ? <VolumeX className="size-5 shrink-0 opacity-70" /> 
        : <Volume2 className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "switch-function",
      name: "Switch Function to tan(x)",
      // shortcut: ["s"],
      keywords: "switch, switch function",
      parent: "quick-options",
      perform: () => setFunctionInput("tan(x)"),
      icon: <ChartSpline  className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "change-audio-speed",
      name: "Change Audio Speed",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => console.log("Change Audio Speed triggered"),
      icon: <CircleGauge className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "zoom-in",
      name: "Zoom In",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => {},
      icon: <ZoomIn className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "zoom-out",
      name: "Zoom Out",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => {},
      icon: <ZoomOut className="size-5 shrink-0 opacity-70" />,
    },


    {
      id: "diagram-options",
      name: "Diagram Options",
      // shortcut: [""],
      keywords: "diagramm",
      // perform: () => {},
      icon: <FileChartLine className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "toggle-grid",
      name: "Toggle Grid",
      // shortcut: [""],
      keywords: "grid",
      parent: "diagram-options",
      perform: () => {},
      icon: <Grid3X3 className="size-5 shrink-0 opacity-70" />,
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
      id: "change-function",
      name: "Edit Functions",
      shortcut: ["f"],
      keywords: "function, change function, change graph, graph, edit function, edit graph",
      //  section: "",
      perform: () => openDialog("edit-function"),
      icon: <ChartSpline className="size-5 shrink-0 opacity-70" />,
    },


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
    {
      id: "toggle-function",
      name: "Toggle Functions",
      shortcut: ["t"],
      keywords: "toggle, activate, deactivate, function, enable, disable",
      perform: () => openDialog("showHide-functions"),
      icon: <ChartSpline className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "movement-adjustments",
      name: "Movement Adjustments",
      shortcut: ["m"],
      keywords: "movement, speed, step, navigation, adjustments",
      perform: () => openDialog("movement-adjustments"),
      icon: <CircleGauge className="size-5 shrink-0 opacity-70" />,
    },
  ];
};
