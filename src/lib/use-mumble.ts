import { useCallback, useEffect, useRef, useState } from "react";
import { playMumble, stop as stopMumble } from "./mumble";

export function useMumble() {
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const speakingRef = useRef<string | null>(null);

  const speak = useCallback((companionId: string | null | undefined, text: string, key?: string) => {
    const id = key ?? `${Date.now()}-${Math.random()}`;
    speakingRef.current = id;
    setSpeakingId(id);
    playMumble(companionId, text, {
      onEnd: () => {
        if (speakingRef.current === id) {
          speakingRef.current = null;
          setSpeakingId(null);
        }
      },
    });
    return id;
  }, []);

  const stop = useCallback(() => {
    stopMumble();
    speakingRef.current = null;
    setSpeakingId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => () => stopMumble(), []);

  return { speak, stop, speakingId, isSpeaking: speakingId !== null };
}
