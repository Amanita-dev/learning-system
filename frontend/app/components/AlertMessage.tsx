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
    ? "bg-red-500 bg-opacity-20 backdrop-blur-lg border border-red-400/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
    : "bg-green-500 bg-opacity-20 backdrop-blur-lg border border-green-400/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]";

  const textColor = type === "error" ? "text-red-100" : "text-green-100";
  const icon = type === "error" ? "❌" : "✅";

  return (
    <div className={`rounded-2xl p-6 mb-6 ${bgClass} animate-fadeIn`}>
      <div className="flex items-center gap-4">
        <span className="text-3xl">{icon}</span>
        <p className={`${textColor} text-lg font-semibold flex-1`}>
          {message}
        </p>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white text-opacity-70 hover:text-opacity-100 text-2xl"
        >
          ✕
        </button>
      </div>
    </div>
  );
}