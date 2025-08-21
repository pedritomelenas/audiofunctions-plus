import './App.css';
import { KBarProvider, useKBar } from 'kbar';
import CommandBar from './components/ui/CommandPalette';
import GraphView from './components/graph/GraphView';
import React from "react";
import { GraphContextProvider } from "./context/GraphContext";
import GraphSonification from './components/graph/GraphSonification';
import { DialogProvider } from './context/DialogContext';
import Header from './components/ui/Header';
import { InstrumentsProvider } from './context/InstrumentsContext';
import KeyboardHandler from "./components/ui/KeyboardHandler";
import { PaletteActions } from './components/ui/PaletteActions_dyn';
import { AnnouncementProvider } from './context/AnnouncementContext';
import { InfoToastProvider } from './context/InfoToastContext';

function App() {
  return (
    <InstrumentsProvider>
      <GraphContextProvider>
        <AnnouncementProvider>
          <InfoToastProvider>
            <KeyboardHandler />
            <DialogProvider>
              <KBarWrapper />
            </DialogProvider>
          </InfoToastProvider>
        </AnnouncementProvider>
      </GraphContextProvider>
    </InstrumentsProvider>
  );
}

const KBarWrapper = () => {
  // needed to wrap actions into GraphContextProvider

  return (
    <KBarProvider>
      <PaletteActions />
      <CommandBar />
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
        <Header />
        <div className="flex-1 overflow-auto">
          <GraphView />
          <GraphSonification />
        </div>
      </div>
    </KBarProvider>
  );
};

// OpenCommandBarButton removed as its functionality is now in the Header

export default App;
