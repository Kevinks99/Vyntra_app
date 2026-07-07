import React, { useState } from 'react';
import { 
  ArrowRight, 
  ChevronRight, 
  Calendar, 
  Dumbbell, 
  GraduationCap, 
  Heart, 
  Sparkles, 
  Clock, 
  Droplet, 
  CheckCircle, 
  Activity,
  Award
} from 'lucide-react';

interface OnboardingViewProps {
  onSkip: () => void;
  onFinish: () => void;
}

export default function OnboardingView({ onSkip, onFinish }: OnboardingViewProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const handleNext = () => {
    if (step < 5) {
      setStep((step + 1) as any);
    } else {
      onFinish();
    }
  };

  const handlePrevDot = (target: number) => {
    setStep(target as any);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between bg-surface overflow-hidden select-none px-6 py-8">
      {/* Background Decorative Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[50%] bg-[#2563eb]/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[50%] bg-[#6a1edb]/5 blur-[100px] rounded-full" />
      </div>

      {/* Header Skip Option */}
      <header className="relative z-10 w-full max-w-md flex justify-between items-center h-10">
        <div className="flex items-center gap-1.5">
          <span className="font-bold tracking-tight text-lg text-on-surface">Vyntra</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
        </div>
        {step < 5 ? (
          <button 
            onClick={onSkip}
            className="text-sm font-semibold text-outline hover:text-primary transition-colors cursor-pointer"
          >
            Pular
          </button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-md flex-1 flex flex-col items-center justify-center py-6">
        
        {/* STEP 1: Organize sua vida (Sphere Abstract Graphics) */}
        {step === 1 && (
          <div className="w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
            {/* Image Box */}
            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
              <div className="absolute inset-0 bg-[#004ac6]/5 rounded-[48px] rotate-6 scale-95 blur-2xl" />
              <div className="relative z-10 w-11/12 h-11/12 rounded-[32px] overflow-hidden glass-card shadow-xl flex items-center justify-center border border-white/40 p-1">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeDeDwUCRvadru-5xiEbdeHpkYVfvixgaRz_JaMVAnczDECmwDrWPCcEU3yN7e0GvcAGuu27hePAU93E2B8pSq3wCFUL08IwyNmitXldSucKPXkrIE_zcRzVtWNnqLfVexzzwybE0mpKJmt6rWOs7VCs4pY9x59Dm4jSkBe_3l7rXbVdykx07JBpj1G3boQFixyjFSjnLeCajeGjm96V5QNlj2pGu55q8bPvG5pS4RbKfJg6x5bDKTih16aeVWPxhZhmBuTpa15vDT" 
                  alt="Organization 3D Abstract Spheres"
                  className="w-full h-full object-cover rounded-[28px]"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            {/* Copy */}
            <div className="space-y-3 px-2">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Organize sua vida.
              </h1>
              <p className="text-[#434655] text-base leading-relaxed">
                Tudo o que importa para você em um único lugar, com a simplicidade que você merece.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Cuide da sua saúde (Bento Balance Layout) */}
        {step === 2 && (
          <div className="w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
            {/* Abstract Bento Health UI Structure */}
            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
              <div className="absolute inset-0 bg-[#006c49]/5 rounded-[48px] -rotate-6 scale-95 blur-2xl" />
              
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Rotated background base card */}
                <div className="absolute w-56 h-56 bg-[#6cf8bb]/10 rounded-[48px] rotate-12 border border-[#6cf8bb]/30" />
                
                {/* Top Right Shape: Fitness center weight card */}
                <div className="absolute top-2 right-4 w-32 h-32 bg-[#6cf8bb] rounded-[36px] -rotate-6 shadow-md flex flex-col items-center justify-center border border-white/20 p-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-2">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-[#002113]">Treino Ativo</span>
                </div>

                {/* Bottom Left Shape: Pulse ECG visual tracker */}
                <div className="absolute bottom-4 left-2 w-32 h-32 bg-white rounded-[32px] rotate-6 shadow-md border border-[#c3c6d7]/30 flex flex-col items-center justify-center p-3">
                  <Heart className="w-8 h-8 text-[#006c49] animate-pulse mb-1.5" />
                  <div className="w-16 h-1 bg-[#006c49]/20 rounded-full overflow-hidden mb-1">
                    <div className="w-3/4 h-full bg-[#006c49]" />
                  </div>
                  <span className="text-[10px] text-outline font-semibold uppercase">Saúde Vital</span>
                </div>

                {/* Center Premium Floating Card: Balance Nutrition cup */}
                <div className="absolute z-10 bg-white/80 backdrop-blur-md rounded-[28px] border border-white/50 shadow-xl flex flex-col items-center justify-center p-5 text-center w-40 h-44">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#006c49] to-[#6cf8bb] flex items-center justify-center mb-3 shadow-sm">
                    <Droplet className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs font-bold text-on-surface uppercase tracking-widest">Balance</span>
                  <div className="mt-2.5 flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]/30" />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006c49]/30" />
                  </div>
                </div>
              </div>
            </div>
            {/* Copy */}
            <div className="space-y-3 px-2">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Cuide da sua saúde.
              </h1>
              <p className="text-[#434655] text-base leading-relaxed">
                Acompanhe alimentação, sono e exercícios de forma integrada e inteligente.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Evolua todos os dias (Meditation Habit & Graph) */}
        {step === 3 && (
          <div className="w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
            {/* Meditation widget placeholder matching screenshot */}
            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
              <div className="absolute inset-0 bg-[#6a1edb]/5 rounded-[48px] rotate-6 scale-95 blur-2xl" />
              
              <div className="w-full aspect-square glass-card rounded-[32px] flex flex-col items-center justify-center p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-28 h-28 bg-[#8343f4]/15 blur-2xl rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-[#2563eb]/10 blur-3xl rounded-full" />

                <div className="relative z-10 w-full flex flex-col gap-5">
                  {/* Progress Micro Card */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#c3c6d7]/30 transform -rotate-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#434655]">Hábito: Meditação</span>
                      <span className="text-tertiary text-xs font-bold">85%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#ededf9] rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#2563eb] to-[#6a1edb] h-full w-[85%] rounded-full" />
                    </div>
                  </div>

                  {/* Weekly Progress Bar Widget */}
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#c3c6d7]/30 transform translate-x-3">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-primary" />
                      <span className="text-xs font-bold text-[#434655]">Progresso Semanal</span>
                    </div>
                    {/* Visual Bar graph levels */}
                    <div className="flex items-end gap-2.5 h-14 pt-2">
                      <div className="bg-primary/20 w-full h-[40%] rounded-t-md" />
                      <div className="bg-primary/30 w-full h-[60%] rounded-t-md" />
                      <div className="bg-primary/40 w-full h-[55%] rounded-t-md" />
                      <div className="bg-primary/60 w-full h-[80%] rounded-t-md" />
                      <div className="bg-gradient-to-t from-[#2563eb] to-[#6a1edb] w-full h-[100%] rounded-t-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Copy */}
            <div className="space-y-3 px-2">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Evolua todos os dias.
              </h1>
              <p className="text-[#434655] text-base leading-relaxed">
                Monitore seus hábitos e veja seu progresso em tempo real com estatísticas detalhadas.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Vyn AI: Seu assistente (Pulsing Orb UI) */}
        {step === 4 && (
          <div className="w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
            {/* Pulsing AI Orb visual matching mockup */}
            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
              <div className="absolute w-64 h-64 rounded-full bg-gradient-to-tr from-[#00f2fe] via-[#2563eb] to-[#8343f4] blur-3xl opacity-40 animate-pulse" />
              
              <div className="relative z-10 w-10/12 h-10/12 glass-card rounded-full flex items-center justify-center p-6 border border-white/50">
                <div className="w-full h-full relative flex items-center justify-center">
                  
                  {/* Concentric rotating circles representing processing */}
                  <div className="absolute w-44 h-44 rounded-full border border-[#2563eb]/20 animate-spin" style={{ animationDuration: '4s' }} />
                  <div className="absolute w-36 h-36 rounded-full border border-[#6a1edb]/30 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

                  {/* Core glow */}
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2563eb] to-[#8343f4] opacity-80 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-white animate-pulse" />
                  </div>

                  {/* Floating chip 1: Vyn AI Ativo */}
                  <div className="absolute -top-4 -right-2 glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase">Vyn AI Ativo</span>
                  </div>

                  {/* Floating chip 2: Sugestão */}
                  <div className="absolute -bottom-4 -left-2 glass-card px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-[#10b981]" />
                    <span className="text-[10px] font-bold text-on-surface">Sugestão: 08:30</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Copy */}
            <div className="space-y-3 px-2">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Vyn AI: Seu assistente.
              </h1>
              <p className="text-[#434655] text-base leading-relaxed">
                Nossa inteligência artificial aprende com sua rotina para sugerir os melhores horários e insights.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: Tudo em um só lugar (Bento Widgets Grid) */}
        {step === 5 && (
          <div className="w-full flex flex-col items-center text-center space-y-8 animate-fade-in">
            {/* Bento Grid layout with 4 glass widgets */}
            <div className="w-full py-2">
              <div className="grid grid-cols-2 gap-4 h-60 w-full max-w-[340px] mx-auto">
                {/* Productivity Card */}
                <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between shadow-sm border border-white/50 text-left">
                  <Calendar className="w-8 h-8 text-primary" />
                  <div className="space-y-1.5">
                    <div className="h-2 w-16 bg-primary/20 rounded-full" />
                    <div className="h-2 w-10 bg-primary/10 rounded-full" />
                  </div>
                </div>

                {/* Health Workout Card */}
                <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between shadow-sm border border-white/50 text-left">
                  <Dumbbell className="w-8 h-8 text-secondary" />
                  <div className="flex items-end gap-1 h-8">
                    <div className="w-1.5 bg-[#10b981] rounded-full h-full" />
                    <div className="w-1.5 bg-[#10b981]/60 rounded-full h-[70%]" />
                    <div className="w-1.5 bg-[#10b981]/30 rounded-full h-[40%]" />
                  </div>
                </div>

                {/* Education Card */}
                <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between shadow-sm border border-white/50 text-left">
                  <GraduationCap className="w-8 h-8 text-[#8343f4]" />
                  <div className="relative w-10 h-10 rounded-full border-4 border-[#8343f4]/15 border-t-[#8343f4] animate-spin" style={{ animationDuration: '3s' }} />
                </div>

                {/* Favorites Card */}
                <div className="glass-card rounded-[28px] p-5 flex flex-col justify-between shadow-sm border border-white/50 text-left">
                  <Heart className="w-8 h-8 text-[#ba1a1a]" />
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white" />
                    <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white" />
                  </div>
                </div>
              </div>
            </div>
            {/* Copy */}
            <div className="space-y-3 px-2">
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">
                Tudo em um só lugar.
              </h1>
              <p className="text-[#434655] text-base leading-relaxed">
                O seu sistema operacional pessoal para uma vida mais equilibrada e produtiva.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Navigation controls */}
      <footer className="relative z-10 w-full max-w-md space-y-6">
        {/* Progress indicator pill */}
        <div className="flex justify-center items-center gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => handlePrevDot(i)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                step === i ? 'w-8 bg-blue-600' : 'w-2 bg-[#c3c6d7]/50 hover:bg-[#c3c6d7]'
              }`}
            />
          ))}
        </div>

        {/* Primary Action Button */}
        <button
          onClick={handleNext}
          className="group relative w-full h-[58px] bg-blue-600 text-white rounded-full font-semibold overflow-hidden shadow-[0px_15px_30px_rgba(37,99,235,0.2)] active:scale-98 hover:bg-blue-700 hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          {/* Bevel internal borders */}
          <div className="absolute inset-0 border border-white/10 rounded-full pointer-events-none" />
          
          <span className="relative z-10 text-base font-semibold flex items-center gap-2">
            {step === 5 ? 'Começar' : 'Próximo'}
            {step === 5 ? (
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            ) : (
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            )}
          </span>
        </button>
      </footer>
    </div>
  );
}
