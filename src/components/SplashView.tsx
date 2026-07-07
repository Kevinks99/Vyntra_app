import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SplashViewProps {
  onFinish: () => void;
}

export default function SplashView({ onFinish }: SplashViewProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    // Subtle breathing animation loop
    const interval = setInterval(() => {
      setPulse(prev => !prev);
    }, 2000);

    // Auto navigate after 3.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white select-none">
      {/* Premium Ambient Background Mesh elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[50%] bg-[#004ac6]/5 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[50%] bg-[#6a1edb]/5 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-[#6cf8bb]/4 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm">
        {/* Animated concentric logo */}
        <div 
          onClick={onFinish}
          className={`cursor-pointer transition-transform duration-[2000ms] ease-out mb-8 ${
            pulse ? 'scale-105' : 'scale-95'
          }`}
        >
          <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center p-3 rounded-[32px] bg-white shadow-[0px_20px_50px_rgba(0,74,198,0.08)] border border-[#c3c6d7]/30 relative overflow-hidden group">
            {/* Glossy shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            {/* Vyntra Concentric Logo representation */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Outer Blue Circle */}
              <div className="absolute inset-0 rounded-full border-4 border-[#004ac6] border-r-transparent animate-spin" style={{ animationDuration: '8s' }} />
              {/* Middle Purple Circle */}
              <div className="absolute inset-2 rounded-full border-4 border-[#6a1edb] border-l-transparent animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
              {/* Inner Green Dot */}
              <div className="w-6 h-6 rounded-full bg-[#10b981] shadow-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Branding content */}
        <div className="space-y-2 animate-fade-up">
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#191b23]">
            Vyntra
          </h1>
          <p className="text-xs tracking-[0.2em] font-semibold text-[#737686] uppercase opacity-90">
            O Sistema Operacional da Sua Vida
          </p>
        </div>
      </div>

      {/* Loader indicator */}
      <div className="absolute bottom-16 flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]/20" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]/40 animate-ping" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#004ac6]/20" />
        </div>
      </div>
    </div>
  );
}
