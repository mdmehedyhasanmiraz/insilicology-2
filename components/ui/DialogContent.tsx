import { ReactNode } from "react";

export function DialogContent({ children, className = "" }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full ${className}`}>
      {children}
    </div>
  );
}
