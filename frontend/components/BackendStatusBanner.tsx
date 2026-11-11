"use client";

import { useEffect, useState } from "react";
import { pingBackend } from "@/lib/api";

const SLOW_AFTER_MS = 3000;
const RETRY_EVERY_MS = 5000;
const GIVE_UP_AFTER_MS = 120000;

/**
 * Free hosting tiers put the backend to sleep after inactivity. This pings /health
 * when the site opens (which also wakes the server) and, if it is slow to answer,
 * tells the visitor why instead of letting them hit a confusing error.
 */
export default function BackendStatusBanner() {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    const startedAt = Date.now();

    const slowTimer = setTimeout(() => {
      if (!isCancelled) setIsWaking(true);
    }, SLOW_AFTER_MS);

    const checkUntilAwake = async () => {
      while (!isCancelled && Date.now() - startedAt < GIVE_UP_AFTER_MS) {
        const isAwake = await pingBackend();
        if (isAwake) {
          if (!isCancelled) setIsWaking(false);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_EVERY_MS));
      }
    };
    checkUntilAwake();

    return () => {
      isCancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  if (!isWaking) return null;

  return (
    <div
      role="status"
      className="w-full border-b-2 border-ink bg-sun-soft px-4 py-3 font-mono text-[12px] text-ink"
    >
      <strong>Server is waking up.</strong> The backend runs on a free hosting tier that sleeps
      after a period of inactivity. This is not a bug: it usually takes 30 to 60 seconds to start.
      This notice disappears on its own, and then you can analyze reviews.
    </div>
  );
}
