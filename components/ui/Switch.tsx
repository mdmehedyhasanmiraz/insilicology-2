// components/ui/Switch.tsx
import React from "react";

interface SwitchProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ id, checked, onCheckedChange }: SwitchProps) {
  return (
    <div className="relative inline-block w-11 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
      />
      <label
        htmlFor={id}
        className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
      />
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #733bf6;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #733bf6;
        }
      `}</style>
    </div>
  );
}
