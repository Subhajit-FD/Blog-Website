import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex flex-col items-center gap-4">
        {/* Modern high-end spinner */}
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
          <div className="absolute inset-0 rounded-full border-4 border-[#7C5DFA] border-t-transparent animate-spin shadow-[0_0_15px_rgba(124,93,250,0.3)]"></div>
          {/* Inner pulse */}
          <div className="absolute inset-4 rounded-full bg-[#7C5DFA]/10 animate-pulse"></div>
        </div>

        <div className="flex flex-col items-center gap-1">
          <h3 className="text-lg font-bold tracking-tight text-foreground/80">
            Updating the universe
          </h3>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Please wait a moment...
          </p>
        </div>
      </div>
    </div>
  );
}
