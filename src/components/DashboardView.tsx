import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Dumbbell, 
  Droplet, 
  Flame, 
  ChevronRight, 
  Compass, 
  Check, 
  Plus, 
  Brain,
  Scale,
  Bell,
  Utensils,
  Camera,
  Moon,
  Trash2,
  Heart
} from 'lucide-react';
import { AppState, ActiveScreen, Meal, SleepLog } from '../types';

interface DashboardViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export default function DashboardView({ state, onStateChange, onNavigate }: DashboardViewProps) {
  const [insightIndex, setInsightIndex] = useState(0);
  const [insightPulse, setInsightPulse] = useState(false);

  // Sleep Logger (Primeiro Acesso) States
  const todayStr = new Date().toISOString().split('T')[0];
  const hasTodaySleep = (state.sleepLogs || []).some(s => s.dateString === todayStr);
  const todaySleepLog = (state.sleepLogs || []).find(s => s.dateString === todayStr);

  const [sleepPromptActive, setSleepPromptActive] = useState(() => {
    const lastPrompt = localStorage.getItem('vyn_sleep_prompt_date');
    return lastPrompt !== todayStr && !hasTodaySleep;
  });
  
  const [hoursSleptValue, setHoursSleptValue] = useState(7.5);
  const [selectedMood, setSelectedMood] = useState<'Ótimo' | 'Bem' | 'Cansado'>('Bem');

  // Nutrition Modal & Register States
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [activeNutritionTab, setActiveNutritionTab] = useState<'ia' | 'photo' | 'manual'>('ia');
  
  // Express AI text state
  const [iaTextInput, setIaTextInput] = useState('');
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError] = useState('');

  // Camera scan state and refs
  const [scanningPhoto, setScanningPhoto] = useState(false);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Scanning/Camera active, 2: Scanned results editable
  const [scannedResult, setScannedResult] = useState<{name: string, calories: number, protein: number, carbs: number, fat: number} | null>(null);
  
  // Real camera & gallery scanning states
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanError, setScanError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Form states for pre-filled results
  const [scannedName, setScannedName] = useState('');
  const [scannedCalories, setScannedCalories] = useState('');
  const [scannedProtein, setScannedProtein] = useState('');
  const [scannedCarbs, setScannedCarbs] = useState('30');
  const [scannedFat, setScannedFat] = useState('8');

  // Manual inputs
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');

  // Meal Period categorizing
  const [mealPeriod, setMealPeriod] = useState<'Café da Manhã' | 'Almoço' | 'Jantar' | 'Lanche'>('Café da Manhã');

  // Trigger dynamic AI insights
  const handleGenerateInsight = () => {
    setInsightPulse(true);
    setTimeout(() => {
      setInsightIndex((prev) => prev + 1);
      setInsightPulse(false);
    }, 450);
  };

  // Generate conditional, smart AI text based on real state
  const getDynamicInsightMessage = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Check for tests/exams/provas today in agenda
    const examEvent = (state.agendaEvents || []).find(e => {
      if (e.dateString !== todayStr) return false;
      const title = (e.title || '').toLowerCase();
      const cat = (e.category || '').toLowerCase();
      return title.includes('prova') || title.includes('teste') || title.includes('exame') || title.includes('apresentação') || cat.includes('prova') || cat.includes('exame');
    });

    if (examEvent) {
      return `Vyn AI: Você tem "${examEvent.title}" agendado para hoje às ${examEvent.time}. Que tal focar inteiramente na revisão e preparação mental agora?`;
    }

    // 2. Check for active reading (books)
    const activeBook = (state.books || []).find(b => b.progressPercent < 100);
    if (activeBook) {
      const pagesLeft = activeBook.totalPages - activeBook.currentPage;
      return `Vyn AI: Foco na Leitura! Restam apenas ${pagesLeft} páginas de "${activeBook.title}" para você concluir. Que tal ler 10 páginas hoje de noite?`;
    }

    // 3. Check for courses in progress
    const activeCourse = (state.courses || []).find(c => c.status === 'EM PROGRESSO');
    if (activeCourse) {
      return `Vyn AI: Continue sua jornada intelectual! Dica: assista à aula "${activeCourse.nextClass}" do curso de ${activeCourse.title} hoje para manter o ritmo.`;
    }

    // 4. Check water levels
    if (state.waterIntakeCups < state.waterIntakeGoalCups / 2) {
      return `Vyn AI: Seu nível de hidratação está em apenas ${state.waterIntakeCups}/${state.waterIntakeGoalCups} copos hoje. Beba um copo de água agora para otimizar sua cognição!`;
    }

    // Default cognitive wellness pool
    const pool = [
      "Vyn AI: Sua consistência semanal está ótima. O equilíbrio entre nutrição, sono e foco intelectual impulsiona sua neuroplasticidade hoje.",
      "Vyn AI: Dica do dia: evite telas azuis nos 30 minutos anteriores ao seu horário de sono planejado para obter mais sono profundo regenerativo.",
      "Vyn AI: Lembre-se de manter o aporte proteico equilibrado. Cada refeição registrada ajuda a calibrar suas metas físicas e foco mental.",
      "Vyn AI: Hoje é um ótimo dia para alinhar sua programação e garantir que os treinos físicos recebam a mesma atenção que o desenvolvimento profissional."
    ];

    return pool[insightIndex % pool.length];
  };

  // Add water log helper
  const handleAddWater = () => {
    const nextWater = Math.min(state.waterIntakeGoalCups, state.waterIntakeCups + 1);
    
    // Recalculate daily progress based on habits
    const waterRatio = state.waterIntakeGoalCups > 0 ? nextWater / state.waterIntakeGoalCups : 0;
    const todayMeals = (state.meals || []).filter(m => !m.dateString || m.dateString === todayStr);
    const mealsRatio = todayMeals.length > 0 ? todayMeals.filter(m => m.completed).length / todayMeals.length : 0;
    const progress = Math.round(((waterRatio + (mealsRatio > 0 ? 1 : 0)) / 2) * 100);

    onStateChange({
      ...state,
      waterIntakeCups: nextWater,
      dailyProgressPercentage: progress
    });
  };

  // Sleep Submit Log Handler
  const handleSaveSleepFromPrompt = () => {
    const weekdayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dayOfWeekStr = weekdayLabels[new Date().getDay()];

    // Estimate score
    let baseScore = Math.min(100, Math.round((hoursSleptValue / 8) * 100));
    if (selectedMood === 'Ótimo') baseScore = Math.min(100, baseScore + 10);
    if (selectedMood === 'Cansado') baseScore = Math.max(30, baseScore - 15);

    const newSleep: SleepLog = {
      day: dayOfWeekStr,
      hours: hoursSleptValue,
      score: baseScore,
      dateString: todayStr,
      feeling: selectedMood
    };

    onStateChange({
      ...state,
      sleepScore: baseScore,
      sleepLogs: [...(state.sleepLogs || []), newSleep]
    });

    localStorage.setItem('vyn_sleep_prompt_date', todayStr);
    setSleepPromptActive(false);
  };

  // Nutrition Calculations
  const todayMeals = (state.meals || []).filter(m => !m.dateString || m.dateString === todayStr);
  const consumedCalories = todayMeals.filter(m => m.completed).reduce((sum, m) => sum + m.calories, 0);
  const consumedProtein = todayMeals.filter(m => m.completed).reduce((sum, m) => sum + m.protein, 0);
  
  const calGoal = 2200;
  const proteinGoal = 140; // Default high fidelity daily target

  // Save Meal Handler
  const handleAddMeal = (name: string, calories: number, protein: number, carbs = 30, fat = 8) => {
    let img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnMo1_ditdcg4kraeamFWihjeJneozLpycbDtUcl3g-PBQLxed2U1ht--GNkMmbhEOKc4oL_v1Y1aXGoykyH3G0mH7qy8pv8fAF8rzq_6b-Hn8lf0djmPsNjIQyre_Xx_ZI-Ml6fxWhP12BhTa7RGWgL6Q5EeO6p8-m7yTmfZhmWP_Avq7eiyY8scuq-V26NOwxaXaQLHUI0bK4e63XBK8qyQs4w9gnxBrgR-V_TX9MmMIkHZqNfM4a0CjmB43IiXYeqfcZpjophXr';
    if (mealPeriod === 'Almoço') {
      img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUqVG3nI5In6p0rd5WT9aXcDAMg8RId1IwSyclVDQL39V2LbcL_9Mi6sX7M8g-cSzhPoFiYZyhEHjS14oSo26aT2IECHaelrOFu5RDMOWVAI5K4OSbtCNoYulOWYXx8zVR3kHVmjhCN_HsA8jajgk1n3TNDrfwiUbUOr6DQ5OC596xUyWeVQqhAfAxPJp71R4pLD8ONM9tdQSfc382zeJhMzJWb5DkPTO5ZsFtjwHyS_lLs3IhIpCm_l4Sst4cQ_yiSRgTx0xxEVns';
    } else if (mealPeriod === 'Lanche') {
      img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUFD_miZa9uYhd3bWTI_F_vmaC5fEL5_u0kmRONCe41WY8iQk6COXuu3az_yotv87ygyE1JB8610nUqNzZ95HTIR8NsRO-zHpi_x-x6pOn2S6enwe52ulGlWm3E3NpiA5wM_t38Cwy2QyGq_VN_nPoEmLudVQkuj51PHaSwcO23hpTtUkTt1syrLmQWNNtKI9stMrk1eKDZRuaNkHv7JjKhSB2xBCK5a1Z_EUh0sNgFtM6qkdOuH8E7DOiK0z-Rta7__yuzswCsV6H';
    } else if (mealPeriod === 'Jantar') {
      img = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB-yRV2hBUQ-MqIyPt5Gj_eSa9xceNElPY654z0_CxifSEyl8Iv5AwIFfL28GxPFQSFD8F8LU_99e3PRtn4HuuVt63plyt-SD5h6bO22d3zsoyITgeugpPXHae7vjtpZ62rNuM2vtNuos0zRJCGmD3Zcu_NXFA-IuFTsYJZyayLTiJrEvgJl1GUsdJT880nrR4A-4V2QQjbHUzrxTD90ua6rWYC9-RPDRgDfp6IxfKM3RDHCKWpvhWPNW0kGUZMaEBerJtOFz64ndw';
    }

    const currentHour = String(new Date().getHours()).padStart(2, '0');
    const currentMin = String(new Date().getMinutes()).padStart(2, '0');

    const newMeal: Meal = {
      id: `meal-${Date.now()}`,
      type: mealPeriod,
      time: `${currentHour}:${currentMin}`,
      name: name || 'Refeição Saudável',
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
      imageUrl: img,
      completed: true,
      dateString: todayStr
    };

    const nextMeals = [...(state.meals || []), newMeal];
    const waterRatio = state.waterIntakeGoalCups > 0 ? state.waterIntakeCups / state.waterIntakeGoalCups : 0;
    const progress = Math.round(((waterRatio + 1) / 2) * 100);

    onStateChange({
      ...state,
      meals: nextMeals,
      dailyProgressPercentage: progress
    });

    // Reset inputs
    setIaTextInput('');
    setManualName('');
    setManualCalories('');
    setManualProtein('');
    setScanStep(0);
    setScannedResult(null);
    setCapturedImage(null);
    setScannedName('');
    setScannedCalories('');
    setScannedProtein('');
    setScannedCarbs('30');
    setScannedFat('8');
    setScanError('');
  };

  // Delete Meal Handler
  const handleDeleteMeal = (mealId: string) => {
    const nextMeals = (state.meals || []).filter(m => m.id !== mealId);
    
    const waterRatio = state.waterIntakeGoalCups > 0 ? state.waterIntakeCups / state.waterIntakeGoalCups : 0;
    const mealsRatio = nextMeals.length > 0 ? nextMeals.filter(m => m.completed).length / nextMeals.length : 0;
    const progress = Math.round(((waterRatio + (mealsRatio > 0 ? 1 : 0)) / 2) * 100);

    onStateChange({
      ...state,
      meals: nextMeals,
      dailyProgressPercentage: progress
    });
  };

  // Express AI call parser
  const handleExpressAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!iaTextInput.trim()) return;

    setIaLoading(true);
    setIaError('');

    try {
      const response = await fetch('/api/nutrition-express', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: iaTextInput })
      });

      if (!response.ok) throw new Error("Erro de conexão com o Vyn AI.");
      
      const parsed = await response.json();
      if (parsed && parsed.name) {
        handleAddMeal(parsed.name, parsed.calories, parsed.protein, parsed.carbs || 30, parsed.fat || 8);
      } else {
        throw new Error("Formato inválido do Vyn AI.");
      }
    } catch (err: any) {
      console.error(err);
      setIaError(err.message || 'Falha ao processar texto com IA. Tente digitar de outra forma.');
    } finally {
      setIaLoading(false);
    }
  };

  // Clean up camera stream if modal is closed or tab is changed
  useEffect(() => {
    if (!showNutritionModal || activeNutritionTab !== 'photo') {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showNutritionModal, activeNutritionTab]);

  // Function to start the camera using navigator.mediaDevices.getUserMedia
  const startCamera = async () => {
    setScanError('');
    setCapturedImage(null);
    setCameraActive(true);
    setScanStep(1); // Scanning/Camera active state

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Erro ao acessar a câmera:", err);
      setScanError("Não foi possível acessar a câmera do dispositivo. Por favor, garanta que deu permissão para acessar a câmera ou envie uma foto da sua galeria.");
      setCameraActive(false);
      setScanStep(0);
    }
  };

  // Function to stop the camera cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Capture current video frame onto canvas to extract base64 string
  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
        
        // Trigger vision AI processing
        analyzeCapturedImage(dataUrl);
      }
    } catch (err: any) {
      console.error("Erro ao capturar foto:", err);
      setScanError("Falha ao capturar imagem da câmera.");
    }
  };

  // Handle image upload from user gallery and read as base64 data URL
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError('');
    setScanningPhoto(true);
    setScanStep(1);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setCapturedImage(dataUrl);
        analyzeCapturedImage(dataUrl);
      } else {
        setScanError("Falha ao processar o arquivo de imagem.");
        setScanningPhoto(false);
        setScanStep(0);
      }
    };
    reader.onerror = () => {
      setScanError("Erro ao ler o arquivo de imagem.");
      setScanningPhoto(false);
      setScanStep(0);
    };
    reader.readAsDataURL(file);
  };

  // Call vision API endpoint
  const analyzeCapturedImage = async (base64Image: string) => {
    setScanningPhoto(true);
    setScanError('');
    setScanStep(1);

    try {
      const response = await fetch('/api/nutrition-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image })
      });

      if (!response.ok) {
        throw new Error("Erro ao analisar imagem no servidor.");
      }

      const parsed = await response.json();
      if (parsed && parsed.name) {
        setScannedResult(parsed);
        setScannedName(parsed.name);
        setScannedCalories(String(parsed.calories));
        setScannedProtein(String(parsed.protein));
        setScannedCarbs(String(parsed.carbs || 30));
        setScannedFat(String(parsed.fat || 8));
        setScanStep(2); // Display pre-filled editable results view
      } else {
        throw new Error("Formato de resposta de análise inválido.");
      }
    } catch (err: any) {
      console.error("Erro na análise da imagem:", err);
      setScanError(err.message || "Falha ao analisar a imagem com a Inteligência Artificial. Você pode tentar outra foto ou registrar manualmente.");
      setScanStep(0);
    } finally {
      setScanningPhoto(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24">
      {/* Top Welcome Header Bar */}
      <header className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div 
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/60 transition-all cursor-pointer"
          >
            <img 
              src={state.profile.avatarUrl} 
              alt={state.profile.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-on-surface">
              Bom dia {state.profile.name} 👋
            </h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
              {state.profile.location || "São Paulo"} • {state.profile.temperature || "24°C"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => onNavigate('notifications')}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-slate-600 dark:text-slate-300 active:scale-90 cursor-pointer relative"
            title="Notificações"
          >
            <Bell className="w-5 h-5 stroke-[2.2]" />
            {(() => {
              const unreadCount = (state.notifications || []).filter(n => !n.read).length;
              return unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-extrabold rounded-full border border-[#faf8ff] dark:border-[#0c0e17] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              ) : null;
            })()}
          </button>
          
          <button 
            onClick={handleGenerateInsight}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-primary active:scale-90 cursor-pointer relative"
            title="Pedir Insight da IA"
          >
            <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          </button>
        </div>
      </header>

      {/* Sleep Quick Logger (Primeiro Acesso Diário) */}
      {sleepPromptActive && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-[28px] p-5 shadow-xl border border-indigo-500/25 relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-8 -mt-8 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-500/20 p-2 rounded-xl text-indigo-300">
                <Moon className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Rotina do Sono</p>
                <h4 className="text-sm font-black text-white">Primeiro Acesso Diário</h4>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-indigo-100">
                Quantas horas você dormiu esta noite e como se sente?
              </p>
            </div>

            {/* Slider with hour displays */}
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-indigo-950/40 px-3.5 py-2 rounded-xl border border-indigo-500/10">
                <span className="text-[10px] font-extrabold text-indigo-300">Tempo de Sono</span>
                <span className="text-sm font-black text-white">{hoursSleptValue} horas</span>
              </div>
              <input 
                type="range" 
                min="4" 
                max="12" 
                step="0.5"
                value={hoursSleptValue} 
                onChange={(e) => setHoursSleptValue(parseFloat(e.target.value))}
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-indigo-950 rounded-lg appearance-none"
              />
            </div>

            {/* Mood selector buttons */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest block ml-1">Seu Humor / Disposição</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'Ótimo', emoji: '✨', color: 'bg-indigo-500/20 border-indigo-400 text-white' },
                  { value: 'Bem', emoji: '🙂', color: 'bg-indigo-500/20 border-indigo-400 text-white' },
                  { value: 'Cansado', emoji: '🥱', color: 'bg-indigo-500/20 border-indigo-400 text-white' }
                ].map((m) => {
                  const isSelected = selectedMood === m.value;
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setSelectedMood(m.value as any)}
                      className={`py-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                        isSelected 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/20' 
                          : 'bg-white/5 border-white/10 text-indigo-200 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-base">{m.emoji}</span>
                      <span>{m.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSaveSleepFromPrompt}
              className="w-full bg-white text-indigo-950 font-black py-3 rounded-2xl text-xs hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              Registrar Noite e Iniciar Dia
            </button>
          </div>
        </div>
      )}

      {/* Vyn AI Insight Glassmorphic Card */}
      <section 
        onClick={handleGenerateInsight}
        className={`glass-card rounded-[32px] p-6 purple-glow relative overflow-hidden group cursor-pointer transition-all duration-300 transform active:scale-[0.99] hover:shadow-lg ${
          insightPulse ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-700 pointer-events-none" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="bg-[#8343f4]/15 p-2 rounded-xl flex-shrink-0 text-[#8343f4]">
            <Brain className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-[#8343f4] uppercase tracking-wider">
                Vyn AI Insight
              </span>
              <span className="text-[8px] bg-purple-500/10 text-[#8343f4] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest scale-90">Real</span>
            </div>
            <p className="text-sm font-semibold text-on-surface leading-tight">
              {getDynamicInsightMessage()}
            </p>
          </div>
        </div>
      </section>

      {/* Bento Grid Widgets */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* Weight Tracker Health Widget */}
        <div 
          onClick={() => onNavigate('weight')}
          className="glass-card rounded-[24px] p-5 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <Scale className="w-5 h-5 text-primary" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">SAÚDE</span>
          </div>

          <div className="flex flex-col items-center py-2 relative">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle 
                className="text-surface-container-high" 
                cx="40" 
                cy="40" 
                fill="transparent" 
                r="34" 
                stroke="currentColor" 
                strokeWidth="6.5" 
              />
              <circle 
                className="text-primary transition-all duration-1000" 
                cx="40" 
                cy="40" 
                fill="transparent" 
                r="34" 
                stroke="currentColor" 
                strokeDasharray="213.6" 
                strokeDashoffset={213.6 * (1 - 0.75)} 
                strokeLinecap="round"
                strokeWidth="7" 
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="block text-2xl font-bold text-on-surface leading-none">
                {state.currentWeight}
              </span>
              <span className="text-[8px] font-bold text-on-surface-variant">KG</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-on-surface-variant">
              Meta: <span className="font-bold text-on-surface">{state.weightGoal}kg</span>
            </p>
          </div>
        </div>

        {/* Hydration Habit Widget */}
        <div className="glass-card rounded-[24px] p-5 flex flex-col justify-between aspect-square">
          <div className="flex justify-between items-start">
            <Droplet className="w-5 h-5 text-sky-500" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">HÁBITO</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-on-surface">Beber Água</h3>
            <div className="flex items-end gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-on-surface leading-none">
                {state.waterIntakeCups}
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant pb-0.5">
                / {state.waterIntakeGoalCups} copos
              </span>
            </div>
          </div>

          <button 
            onClick={handleAddWater}
            disabled={state.waterIntakeCups >= state.waterIntakeGoalCups}
            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1 border ${
              state.waterIntakeCups >= state.waterIntakeGoalCups
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                : 'bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/10 text-sky-600 cursor-pointer'
            }`}
          >
            {state.waterIntakeCups >= state.waterIntakeGoalCups ? (
              <>
                <Check className="w-3.5 h-3.5" /> Concluído
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </>
            )}
          </button>
        </div>

        {/* Sleep Card Summary (Appears only after sleep questions registered) */}
        {hasTodaySleep && todaySleepLog && (
          <div 
            onClick={() => onNavigate('sleep')}
            className="glass-card rounded-[24px] p-5 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-white to-indigo-50/10 border border-indigo-500/10 dark:from-slate-900 dark:to-indigo-950/20 dark:border-indigo-500/20"
          >
            <div className="flex justify-between items-start">
              <Moon className="w-5 h-5 text-indigo-500 animate-pulse" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">SONO</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-on-surface">Sono Registrado</h3>
              <div className="flex items-end gap-1 mt-0.5">
                <span className="text-2xl font-extrabold text-on-surface leading-none">
                  {todaySleepLog.hours}h
                </span>
                <span className="text-[10px] font-semibold text-on-surface-variant pb-0.5">
                  / {state.sleepGoalHours || 8}h meta
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Qualidade</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{todaySleepLog.score}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700" 
                  style={{ width: `${todaySleepLog.score}%` }} 
                />
              </div>
              <p className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 truncate">
                Disposição: <span className="font-extrabold">{todaySleepLog.feeling || 'Bem'}</span>
              </p>
            </div>
          </div>
        )}

        {/* Nutrition Card Summary */}
        <div 
          onClick={() => setShowNutritionModal(true)}
          className="glass-card rounded-[24px] p-5 flex flex-col justify-between aspect-square cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/10 border border-emerald-500/10 dark:from-slate-900 dark:to-emerald-950/20 dark:border-emerald-500/20"
        >
          <div className="flex justify-between items-start">
            <Utensils className="w-5 h-5 text-emerald-500" />
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">NUTRIÇÃO</span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-on-surface">Calorias</h3>
            <div className="flex items-end gap-1 mt-0.5">
              <span className="text-2xl font-extrabold text-on-surface leading-none">
                {consumedCalories}
              </span>
              <span className="text-[10px] font-semibold text-on-surface-variant pb-0.5">
                / {calGoal} kcal
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Proteínas</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{consumedProtein}g / {proteinGoal}g</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-700" 
                style={{ width: `${Math.min(100, Math.round((consumedProtein / proteinGoal) * 100))}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-400 font-medium truncate">
              {todayMeals.length} refeições hoje
            </p>
          </div>
        </div>

        {/* Next Activity Card (Full Width Span) */}
        <div 
          onClick={() => onNavigate('fitness')}
          className="glass-card rounded-[24px] p-4 col-span-2 flex items-center justify-between border-l-4 border-l-primary cursor-pointer hover:shadow-md transition-shadow transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                PRÓXIMA ATIVIDADE
              </p>
              <h3 className="text-sm font-bold text-on-surface">
                Academia em 45 min
              </h3>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-on-surface-variant" />
        </div>

        {/* Streak / Sequence Card (Full Width Span) */}
        <div className="glass-card rounded-[24px] p-4 col-span-2 flex items-center justify-between bg-gradient-to-r from-white to-orange-50/20 border border-orange-500/10 shadow-sm dark:from-slate-900 dark:to-orange-950/10 dark:border-orange-500/15">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center text-xl text-orange-500">
              🔥
            </div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">
                {state.profile.streakDays} dias seguidos
              </h3>
              <p className="text-xs text-on-surface-variant">
                Sua sequência de consistência calculada em tempo real!
              </p>
            </div>
          </div>
          <div className="h-1.5 w-20 bg-surface-container-high rounded-full overflow-hidden shrink-0">
            <div 
              className="h-full bg-orange-500 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (state.profile.streakDays / 7) * 100)}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Daily Progress Section */}
      <section className="space-y-2 bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-[#c3c6d7]/20 dark:border-slate-800 shadow-[0px_8px_20px_rgba(0,0,0,0.02)]">
        <div className="flex justify-between items-end">
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
            Progresso Diário
          </h2>
          <span className="text-sm font-bold text-primary">
            {state.dailyProgressPercentage}% <span className="text-xs text-on-surface-variant font-normal">Completo</span>
          </span>
        </div>
        
        <div className="h-3 w-full bg-surface-container dark:bg-slate-800 rounded-full overflow-hidden border border-[#c3c6d7]/10 relative">
          <div 
            className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full shadow-[0_0_15px_rgba(37,99,235,0.25)] transition-all duration-700 ease-out" 
            style={{ width: `${state.dailyProgressPercentage}%` }}
          />
        </div>
      </section>

      {/* MODERN INTELLIGENT NUTRITION MODAL */}
      {showNutritionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 max-w-md w-full space-y-5 shadow-2xl border border-[#c3c6d7]/30 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Utensils className="w-5.5 h-5.5 text-emerald-500" />
                <h3 className="font-extrabold text-xl text-slate-800 dark:text-slate-100">Alimentação Inteligente</h3>
              </div>
              <button 
                onClick={() => setShowNutritionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-2xl p-1.5 bg-slate-50 dark:bg-slate-800 rounded-full"
              >
                ×
              </button>
            </div>

            {/* Quick Macro Indicators */}
            <div className="grid grid-cols-2 gap-3 bg-emerald-50/30 dark:bg-emerald-950/10 p-3 rounded-2xl border border-emerald-500/10">
              <div className="text-center border-r border-emerald-500/10">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Calorias Consumidas</span>
                <span className="text-lg font-black text-slate-800 dark:text-slate-100">{consumedCalories} <span className="text-[10px] text-slate-500 font-normal">/ {calGoal} kcal</span></span>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-black tracking-widest block">Proteína Acumulada</span>
                <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{consumedProtein}g <span className="text-[10px] text-slate-500 font-normal">/ {proteinGoal}g</span></span>
              </div>
            </div>

            {/* Period selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Associe ao Período</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(['Café da Manhã', 'Almoço', 'Jantar', 'Lanche'] as const).map((p) => {
                  const isSelected = mealPeriod === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMealPeriod(p)}
                      className={`py-2 rounded-xl text-[10px] font-extrabold text-center transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p.split(' ')[0]} {/* shortened */}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Registration Format Tabs */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-1.5 gap-2">
              {[
                { id: 'ia', label: 'Express Vyn AI', icon: Sparkles },
                { id: 'photo', label: 'Escanear Prato', icon: Camera },
                { id: 'manual', label: 'Manual', icon: Plus }
              ].map((t) => {
                const isSel = activeNutritionTab === t.id;
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveNutritionTab(t.id as any)}
                    className={`flex-1 py-2 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSel 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: EXPRESS IA TEXT */}
            {activeNutritionTab === 'ia' && (
              <form onSubmit={handleExpressAISubmit} className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">O que você comeu?</label>
                    <span className="text-[9px] bg-purple-500/10 text-purple-600 font-extrabold px-1.5 py-0.5 rounded">Vyn AI Engine</span>
                  </div>
                  <textarea
                    value={iaTextInput}
                    onChange={(e) => setIaTextInput(e.target.value)}
                    placeholder="Ex: Comi 2 ovos fritos na manteiga com 1 fatia de pão integral e café sem açúcar..."
                    required
                    rows={2}
                    className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal pl-0.5">
                    Digite livremente e o Vyn AI estimará instantaneamente as calorias e proteínas para você!
                  </p>
                </div>

                {iaError && (
                  <div className="text-red-500 text-[10px] bg-red-50 dark:bg-red-950/10 p-2 rounded-xl border border-red-500/10 font-bold">
                    {iaError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={iaLoading || !iaTextInput.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-2xl font-black text-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  {iaLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando com Vyn AI...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" /> Analisar e Registrar
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB CONTENT: PHOTO SCAN (REAL) */}
            {activeNutritionTab === 'photo' && (
              <div className="space-y-4 py-2">
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden min-h-[220px]">
                  
                  {/* Camera Live Stream */}
                  {cameraActive && scanStep === 1 && (
                    <div className="w-full flex flex-col items-center space-y-3">
                      <div className="relative w-full rounded-2xl overflow-hidden bg-black aspect-video">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-2xl pointer-events-none" />
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" /> Câmera Ativa
                        </div>
                      </div>
                      <div className="flex gap-2 w-full">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Tirar Foto
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="px-4 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Processing / Uploading state (with captured/loaded image preview) */}
                  {scanningPhoto && (
                    <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-10 flex flex-col items-center justify-center space-y-3 p-4 text-center">
                      {capturedImage ? (
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
                          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover filter blur-[1px]" />
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Analisando Prato com Vyn AI...</span>
                        <span className="text-[9px] text-slate-400">Extraindo alimentos e macros via Visão Computacional...</span>
                      </div>
                    </div>
                  )}

                  {/* Initial view: buttons to activate Camera or Upload from Gallery */}
                  {!cameraActive && scanStep === 0 && (
                    <div className="flex flex-col items-center justify-center space-y-4 w-full py-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-full text-emerald-600">
                        <Camera className="w-8 h-8" />
                      </div>
                      <div className="space-y-1 text-center max-w-[280px]">
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">Reconhecimento de Refeições por Foto</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Tire uma foto do seu prato em tempo real ou envie uma imagem da galeria do seu celular.</p>
                      </div>

                      {scanError && (
                        <div className="text-red-500 text-[10px] bg-red-50 dark:bg-red-950/10 p-2.5 rounded-xl border border-red-500/10 font-semibold text-center max-w-[320px]">
                          {scanError}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-2 w-full px-4">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" /> Iniciar Câmera
                        </button>
                        
                        <label className="flex-1 border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer text-center">
                          <Plus className="w-3.5 h-3.5" /> Escolher da Galeria
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleGalleryUpload} 
                            className="hidden" 
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Results: Editable inputs with final confirmation */}
                  {scanStep === 2 && (
                    <div className="space-y-4 w-full text-left animate-fade-in p-1">
                      <div className="flex items-center gap-3 bg-emerald-500/5 p-2 rounded-xl border border-emerald-500/10">
                        {capturedImage && (
                          <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow border border-slate-200 dark:border-slate-800">
                            <img src={capturedImage} alt="Prato analisado" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div>
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">Análise Concluída</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">Revise e ajuste as informações se necessário:</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {/* Name Field */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome da Refeição</label>
                          <input
                            type="text"
                            value={scannedName}
                            onChange={(e) => setScannedName(e.target.value)}
                            required
                            placeholder="Ex: Prato Feito de Almoço"
                            className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold"
                          />
                        </div>

                        {/* Nutrition Grid */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calorias (kcal)</label>
                            <input
                              type="number"
                              value={scannedCalories}
                              onChange={(e) => setScannedCalories(e.target.value)}
                              required
                              className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proteínas (g)</label>
                            <input
                              type="number"
                              value={scannedProtein}
                              onChange={(e) => setScannedProtein(e.target.value)}
                              required
                              className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-emerald-600 dark:text-emerald-400"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Carboidratos (g)</label>
                            <input
                              type="number"
                              value={scannedCarbs}
                              onChange={(e) => setScannedCarbs(e.target.value)}
                              className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gorduras (g)</label>
                            <input
                              type="number"
                              value={scannedFat}
                              onChange={(e) => setScannedFat(e.target.value)}
                              className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setScanStep(0);
                            setCapturedImage(null);
                          }}
                          className="flex-1 py-3 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl text-[10px] font-extrabold uppercase transition-all hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Escanear Outro
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddMeal(
                            scannedName, 
                            parseFloat(scannedCalories) || 0, 
                            parseFloat(scannedProtein) || 0, 
                            parseFloat(scannedCarbs) || 30, 
                            parseFloat(scannedFat) || 8
                          )}
                          disabled={!scannedName || !scannedCalories}
                          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase transition-all shadow-md shadow-emerald-600/10 disabled:opacity-55 cursor-pointer"
                        >
                          Confirmar e Salvar
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* TAB CONTENT: MANUAL ENTRY */}
            {activeNutritionTab === 'manual' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Alimento</label>
                  <input
                    type="text"
                    placeholder="Ex: Iogurte Whey com Banana"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calorias (kcal)</label>
                    <input
                      type="number"
                      placeholder="350"
                      value={manualCalories}
                      onChange={(e) => setManualCalories(e.target.value)}
                      className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proteína (g)</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(e.target.value)}
                      className="w-full bg-[#f3f4f6] dark:bg-slate-800 rounded-xl px-3 py-2 text-xs border-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleAddMeal(manualName, parseFloat(manualCalories) || 0, parseFloat(manualProtein) || 0)}
                  disabled={!manualName || !manualCalories}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Registrar Refeição
                </button>
              </div>
            )}

            {/* TODAY'S HISTORIC LIST (WITH DELETE OPTION) */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Refeições de Hoje</h4>
              
              {todayMeals.length === 0 ? (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-[11px] font-semibold text-slate-400">
                  Nenhuma refeição registrada hoje. Inicie registrando acima!
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {todayMeals.map((meal) => (
                    <div 
                      key={meal.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-600 px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-90">{meal.type}</span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold">{meal.time}</span>
                        </div>
                        <h5 className="font-extrabold text-slate-800 dark:text-slate-100">{meal.name}</h5>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                          🔥 {meal.calories} kcal • 🥩 {meal.protein}g proteína
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleDeleteMeal(meal.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 rounded-lg transition-colors cursor-pointer"
                        title="Excluir refeição"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
