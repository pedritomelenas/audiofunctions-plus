import './App.css';
import { KBarProvider, useKBar } from 'kbar';
import CommandBar from './components/ui/af_kbar';
import Graph from './components/graph/GraphView';
import React from "react";
import { GraphContextProvider } from "./context/GraphContext";
import GraphControls from "./components/graph/GraphControls";
import { useKBarActions } from './components/ui/kbarActions';
import GraphSonification from './components/graph/GraphSonification';

function App() {
  return (
    <>
      <GraphContextProvider>
        <KBarWrapper />
      </GraphContextProvider>
    </>
  );
}

const KBarWrapper = () => {
  const actions = useKBarActions();

  return (
    <KBarProvider actions={actions}>
      <CommandBar />
      <h1 className='text-3xl font-bold underline'>In development</h1>
      <OpenCommandBarButton />
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw" }}>
        <GraphControls />
        <Graph />
        <GraphSonification />
      </div>
    </KBarProvider>
  );
};

const OpenCommandBarButton = () => {
  const { query } = useKBar();
  return <button onClick={query.toggle}>Open CommandBar</button>;
};

export default App;
