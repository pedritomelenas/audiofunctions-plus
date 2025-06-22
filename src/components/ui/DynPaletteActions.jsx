import { useRegisterActions, Priority } from "kbar";
import { Volume2, VolumeX } from "lucide-react"
import { useGraphContext } from "../../context/GraphContext";

export const useDynamicKBarActions = () => {
  const { isAudioEnabled, setIsAudioEnabled } = useGraphContext();

  // toggle audio
  useRegisterActions([
    {
      id: "toggle-audio",
      name: isAudioEnabled ? "Stop Audio" : "Start Audio",
      shortcut: ["a"],
      keywords: "audio, sound, enable, disable, start, stop, toggle",
      parent: "quick-options",
      priority: Priority.HIGH, 
      perform: () => setIsAudioEnabled(prev => !prev),
      icon: isAudioEnabled 
        ? <VolumeX className="size-5 shrink-0 opacity-70" /> 
        : <Volume2 className="size-5 shrink-0 opacity-70" />,
    }
  ], [isAudioEnabled]);


  return null;
};

// wrapper for easy usage
export const DynamicPaletteActions = () => {
  useDynamicKBarActions();
  return null;
};