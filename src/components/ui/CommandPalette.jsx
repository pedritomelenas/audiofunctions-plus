import { KBarAnimator, KBarPortal, KBarPositioner, KBarResults, KBarSearch, useMatches, useKBar } from 'kbar';
import React, { useEffect, useRef, useState } from 'react';

const CustomDialogAnimator = ({ children, className }) => {
    // needed, to trap the keyboard focus - kbar doesn't do this by default

    const dialogRef = useRef(null);
  
    return (
      <dialog
        role='dialog'                // needed for my aria-checker browser plugin
        aria-label="command palette"
        aria-modal='true'
        ref={dialogRef}
        className={`${className}`}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {children}
      </dialog>
    );
  };


const CommandBar = () => {
    return (
        <KBarPortal>
            <KBarPositioner className="bg-overlay backdrop-blur-md">                
                <CustomDialogAnimator className='bg-background rounded-xl shadow-xl flex flex-col gap-4 w-[95%] max-w-[35rem] overflow-hidden'>
                    <KBarAnimator>
                        <KBarSearch className='w-full outline-none px-6 py-4 text-txt' aria-owns='kbar-listbox'/>
                        <SearchResults aria-hi/>
                    </KBarAnimator>
                    <LiveRegion />
                </CustomDialogAnimator>
            </KBarPositioner>
        </KBarPortal>
    );
};

const SearchResults = () => {
    const { results } = useMatches();

    return (
        <KBarResults 
            items={results}
            onRender={({ item, active }) => {
                return typeof item === 'string' ? (
                    // Section header -- not used right now
                    <div className='text-xm uppercase px-4 pt-3 pb-1 text-neutral-500 font-bold'
                    role="separator"
                    aria-hidden="true"
                    >
                        {item}
                    </div>
                ) : (
                    // Single action
                    <div 
                        className={`text-btn-text flex items-center px-4 py-3 ${active ? "bg-hover-full" : "bg-transparent"} select-none cursor-pointer`}
                        tabIndex={0}
                        role="option"
                    >
                        {item.icon && <span className="mr-2 text-txt">{item.icon}</span>}
                        <div className="flex flex-col">
                            <span>{item.name}</span>
                            {item.subtitle && <span className="text-sm text-txt">{item.subtitle}</span>}
                        </div>
                        {item.shortcut && (
                            <span className="ml-auto text-xs text-txt-subtitle" aria-label={`Shortcut: ${item.shortcut.join(", ")}`}>
                                {item.shortcut.join(", ")}
                            </span>
                        )}
                    </div>
                );
            }}
        />
    )
}

// LiveRegion for opt screenreader announcements
const LiveRegion = () => {
    const { results } = useMatches();
    const [announcement, setAnnouncement] = useState("");
    const { query, options } = useKBar();
    const prevMessage = useRef("init");
    const timeoutRef = useRef(null);

    useEffect(() => {
        const firstResult = results.find((item) => typeof item !== "string");
        const message = firstResult 
            ? `${firstResult.name}` 
            : "Keine Ergebnisse gefunden";
    
        // console.log("prev: ", prevMessage.current);
        // console.log("message: ", message);
        // console.log("index: ", results.indexOf(firstResult));
        if (message === prevMessage.current) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current); // stop pending setAnnouncement calls
            }

            // console.log("read");
            setAnnouncement(""); // clear the announcement - will also trigger a screen reader announcement if content doesn't change
            timeoutRef.current = setTimeout(() => setAnnouncement(message), 500); // set content after a short delay
        }
        else if (results.indexOf(firstResult) === 0) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current); // stop pending setAnnouncement calls
            }

            // console.log("subMenu Helper");
            setAnnouncement(message);
        } 
        else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current); // stop pending setAnnouncement calls
            }
            setAnnouncement("");
        }
        // console.log("set to:", message);
        prevMessage.current = message;

    }, [results, query.query]);

    return (
        <div
            aria-live="assertive"
            aria-atomic="true"
            className="sr-only"
        >
            {announcement}
        </div>
    );
}

export default CommandBar;
