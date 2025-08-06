import React from "react";
import { useKBar } from "kbar";
import { Wand, Volume2, VolumeX } from "lucide-react";
import { useGraphContext } from "../../context/GraphContext";

/**
 * Header component for the application
 * Features command palette trigger and audio toggle
 */
const Header = () => {
  const { query } = useKBar();
  const { isAudioEnabled, setIsAudioEnabled } = useGraphContext();
  
  const toggleAudio = () => {
    setIsAudioEnabled(prev => !prev);
  };

  return (
    <header className="w-full py-2 px-4 flex justify-between border-b border-border shadow bg-background">      
      <div className="flex items-center gap-4">
        <img src="/logo_beta.svg" alt="AudioFunctions+ logo" className="size-17" />
        <h1 className="font-bold hidden sm:block">AudioFunctions+ [beta-version]</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleAudio}
          className="p-2  hover:text-foreground border-transparent bg-transparent"
          // aria-label={isAudioEnabled ? "Disable Audio" : "Enable Audio"}
          title={isAudioEnabled ? "Disable Audio" : "Enable Audio"}
        >
          {isAudioEnabled ? (
            <Volume2 className="size-7 text-primary" />
          ) : (
            <VolumeX className="size-7 text-red-500" />
          )}
        </button>
        
        <button 
          onClick={query.toggle}
          className="btn-primary flex items-center gap-2"
          aria-label="Open Command Palette"
        >
          <Wand className="size-5" />
          Actions
        </button>
      </div>
    </header>
  );
};

export default Header;
