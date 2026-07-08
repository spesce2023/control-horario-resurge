"use client";

import { useState } from "react";

export function MobileScheduleTabs({
  weekNav,
  weekBlock,
  defaultBlock,
}: {
  weekNav: React.ReactNode;
  weekBlock: React.ReactNode;
  defaultBlock: React.ReactNode;
}) {
  const [active, setActive] = useState<"week" | "default">("week");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-[9px] bg-sage-bg p-1 md:hidden">
        <button
          type="button"
          onClick={() => setActive("week")}
          className={`flex-1 rounded-md py-1.5 text-[11.5px] font-bold ${
            active === "week" ? "bg-sage-dark text-white" : "text-sage-dark"
          }`}
        >
          Semana actual
        </button>
        <button
          type="button"
          onClick={() => setActive("default")}
          className={`flex-1 rounded-md py-1.5 text-[11.5px] font-bold ${
            active === "default" ? "bg-sage-dark text-white" : "text-sage-dark"
          }`}
        >
          Por defecto
        </button>
      </div>

      <div className={`md:hidden ${active === "week" ? "block" : "hidden"}`}>{weekNav}</div>

      <div className={active === "week" ? "block" : "hidden md:block"}>{weekBlock}</div>
      <div className={active === "default" ? "block" : "hidden md:block"}>{defaultBlock}</div>
    </div>
  );
}
