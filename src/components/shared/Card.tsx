import { type ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm ${className}`}>
      {children}
    </div>
  );
}
