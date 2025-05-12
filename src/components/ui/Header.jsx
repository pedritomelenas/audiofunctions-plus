import React from "react";
import { useKBar } from "kbar";
import { Wand } from "lucide-react";

/**
 * Header component for the application
 * Features command palette trigger
 */
const Header = () => {
  const { query } = useKBar();
  return (
    <header className="w-full py-2 px-4 flex justify-between border-b border-border shadow bg-background">      
      <div className="flex items-center gap-4">
        <img src="/logo.svg" alt="AudioFunctions+ logo" className="size-17" />
        <h1 className="font-bold hidden sm:block">AudioFunctions+</h1>
      </div>
      
      <div className="flex items-center gap-4">
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
