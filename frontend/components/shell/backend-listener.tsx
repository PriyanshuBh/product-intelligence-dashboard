'use client';

import { AlertTriangle, Server, Wifi } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:9000/api';

/**
 * One-shot health probe on app mount.
 *
 * Render's free tier spins the backend down after ~15 minutes of inactivity.
 * The first request after that takes ~30s to wake the dyno. We probe `/health`
 * up-front and surface a toast if the server is slow to respond, so the user
 * understands why the first real request feels stuck.
 */
export function BackendListener() {
  const probed = useRef(false);

  useEffect(() => {
    if (probed.current) return;
    probed.current = true;

    const toastId = 'server-wakeup';
    let slow = false;

    const slowTimer = setTimeout(() => {
      slow = true;
      toast.loading(
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-2 font-semibold">
            <Server className="size-4" /> Waking up backend…
          </span>
          <span className="text-[12px] text-muted-foreground">
            Render free tier spins down after inactivity. Hold on ~30s.
          </span>
        </div>,
        { id: toastId, duration: 100_000 },
      );
    }, 1500);

    const controller = new AbortController();
    const killSwitch = setTimeout(() => controller.abort(), 60_000);

    fetch(`${BASE}/health`, { signal: controller.signal, credentials: 'omit' })
      .then((res) => {
        if (!res.ok) throw new Error(`status ${res.status}`);
        clearTimeout(slowTimer);
        clearTimeout(killSwitch);
        if (slow) {
          toast.success(
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-2 font-semibold">
                <Wifi className="size-4" /> Server connected
              </span>
              <span className="text-[12px] text-muted-foreground">
                Backend is awake — you can use the dashboard now.
              </span>
            </div>,
            { id: toastId, duration: 4000 },
          );
        }
      })
      .catch(() => {
        clearTimeout(slowTimer);
        clearTimeout(killSwitch);
        toast.error(
          <div className="flex flex-col gap-1">
            <span className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" /> Backend unreachable
            </span>
            <span className="text-[12px] text-muted-foreground">
              Could not connect to the API. Please retry in a moment.
            </span>
          </div>,
          { id: toastId, duration: 5000 },
        );
      });

    return () => {
      clearTimeout(slowTimer);
      clearTimeout(killSwitch);
      controller.abort();
    };
  }, []);

  return null;
}
