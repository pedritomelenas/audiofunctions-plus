import './App.css';
import { KBarProvider, useKBar } from 'kbar';
import CommandBar from './components/ui/CommandPalette';
import GraphView from './components/graph/GraphView';
import React from "react";
import { GraphContextProvider } from "./context/GraphContext";
import GraphControls from "./components/graph/GraphControls";
import { useKBarActions } from './components/ui/PaletteActions';
import GraphSonification from './components/graph/GraphSonification';
import { DialogProvider } from './context/DialogContext';
import Header from './components/ui/Header';
import { InstrumentsProvider } from './context/InstrumentsContext';
import KeyboardHandler from "./components/ui/KeyboardHandler";

function App() {
  return (
    <InstrumentsProvider>
      <GraphContextProvider>
        <KeyboardHandler />
        <DialogProvider>
          <KBarWrapper />
        </DialogProvider>
      </GraphContextProvider>
    </InstrumentsProvider>
  );
}

const KBarWrapper = () => {
  // needed to wrap actions into GraphContextProvider
  const actions = useKBarActions();

  return (
    <KBarProvider actions={actions}>
      <CommandBar />
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
        <Header />
        <div className="flex-1 overflow-auto">
          {/* <GraphControls /> */}
          <GraphView />
          <GraphSonification />
        </div>
      </div>
    </KBarProvider>
  );
};

// OpenCommandBarButton removed as its functionality is now in the Header

export default App;
