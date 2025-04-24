import './App.css'
import { KBarProvider, useKBar } from 'kbar'
import CommandBar from './components/ui/af_kbar'

import {ChartSpline, Play, CircleGauge, List, ZoomIn, ZoomOut, 
  SwatchBook, Contrast, Sun, Moon,
  ChartArea, FileChartLine, Grid3X3,  } from "lucide-react"
import Graph from './components/graph/graph'

function App() {

  const actions = [
    {
      id: "quick-options",
      name: "Quick Options",
      shortcut: ["q"],
      keywords: "quick, quickoptions",
      // perform: () => {},
      icon: <List className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "switch-function",
      name: "Switch Function",
      // shortcut: ["s"],
      keywords: "switch, switch function",
      parent: "quick-options",
      perform: () => {},
      icon: <ChartSpline  className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "play-audio",
      name: "Play Audio",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => {},
      icon: <Play className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "change-audio-speed",
      name: "Change Audio Speed",
      // shortcut: [""],
      // keywords: ", ",
      parent: "quick-options",
      perform: () => {},
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
      perform: () => {},
      icon: <ChartArea className="size-5 shrink-0 opacity-70" />,
    },




    {
      id: "change-function",
      name: "edit functions",
      shortcut: ["f"],
      keywords: "function, change function, change graph, graph, edit function, edit graph",
      //  section: "",
      perform: () => {},
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
      id: "light-theme",
      name: "Light Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {},
      icon: <Sun className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "dark-theme",
      name: "Dark Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {},
      icon: <Moon className="size-5 shrink-0 opacity-70" />,
    },
    {
      id: "high-contrast-theme",
      name: "High Contrast Theme",
      // shortcut: [""],
      keywords: "theme",
      parent: "change-theme",
      perform: () => {},
      icon: <Contrast className="size-5 shrink-0 opacity-70" />,
    },

  ]

  return (
    <>
      <KBarProvider actions={actions}>
        <CommandBar/>
        <h1 className='text-3xl font-bold underline'>In development</h1>
        <OpenCommandBarButton />
        <Graph/>
      </KBarProvider>
    </>
  )
}


const OpenCommandBarButton = () => {
  const { query } = useKBar();
  return <button onClick={query.toggle}>Open CommandBar</button>;
}

export default App
