'use client';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export function GlobalLoading() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;
  
  // Use a small delay to avoid flickering on very fast requests
  const [show, setShow] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      timeout = setTimeout(() => setShow(true), 200);
    } else {
      setShow(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div className="fixed top-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative flex h-5 w-5 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
        <div className="absolute inset-0 animate-ping rounded-full bg-indigo-400/20" />
      </div>
      <span className="text-xs font-bold tracking-tight text-slate-900">Syncing...</span>
    </div>
  );
}
