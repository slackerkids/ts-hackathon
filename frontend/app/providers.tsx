"use client";

import { type PropsWithChildren, useEffect, useState } from "react";
import { init, backButton, miniApp } from "@tma.js/sdk-react";

export function TMAProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      init();

      // Mount back button for navigation
      backButton.mount();

      // Inform Telegram that the Mini App is ready
      miniApp.mount();
      miniApp.ready();

      setReady(true);
    } catch (err) {
      // If we're not inside Telegram (e.g. dev mode in browser),
      // still render the app
      console.warn("TMA SDK init failed (not inside Telegram?):", err);
      setReady(true);
    }
  }, []);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-foreground/60">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
