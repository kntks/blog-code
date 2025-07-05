"use client";

import { createContext, useContext, ReactNode } from "react";

interface TraceContextType {
  traceId: string;
  spanId?: string;
}

const TraceContext = createContext<TraceContextType | null>(null);

interface TraceProviderProps {
  children: ReactNode;
  traceId: string;
  spanId?: string;
}

export function TraceProvider({ children, traceId, spanId }: TraceProviderProps) {
  return (
    <TraceContext.Provider value={{ traceId, spanId }}>
      {children}
    </TraceContext.Provider>
  );
}

export function useTrace() {
  const context = useContext(TraceContext);
  if (!context) {
    throw new Error('useTrace must be used within a TraceProvider');
  }
  return context;
}