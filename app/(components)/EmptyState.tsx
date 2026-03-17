import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  description?: string;
}

export function EmptyState({ icon, message, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-3 text-slate-300">{icon}</div>
      <p className="text-sm font-medium text-slate-400">{message}</p>
      {description && (
        <p className="text-xs text-slate-300 mt-1">{description}</p>
      )}
    </div>
  );
}
