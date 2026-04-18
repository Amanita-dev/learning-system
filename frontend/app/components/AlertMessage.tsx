"use client";

import { useEffect, useState } from "react";

interface AlertMessageProps {
  type: "error" | "success";
  message: string;
}

export default function AlertMessage({
  type,
  message
}: AlertMessageProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  if (!isVisible) return null;

  const bgClass = type === "error"
    ? "border-red-200 bg-red-50 text-[color:var(--error)]"
    : "border-emerald-200 bg-emerald-50 text-emerald-800";

  const icon = type === "error" ? "❌" : "✅";

  return (
    <div className={`material-surface mb-6 rounded-2xl border p-4 animate-fadeIn ${bgClass}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <p className="flex-1 text-base font-medium">{message}</p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-xl text-[color:var(--secondary)]"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
