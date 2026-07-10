import React, { useState, useRef, useEffect } from 'react';
import { User, MapPin, Award, LogOut, Check, Scale, Droplet, Ruler, Sparkles, Image as ImageIcon, ShieldAlert, Moon, Sun, HelpCircle, Compass, Loader2, ChevronDown, BookOpen, Bell, Settings } from 'lucide-react';
import { AppState } from '../types';
import { getCleanInitialState } from '../data';

interface ProfileViewProps {
  state: AppState;
  onStateChange: (newState: AppState, overwrite?: boolean) => void;
  onLogout: () => void;
}

const AVATAR_POOL = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDzEsS18JVcfROhaddVaM8zWmZg1gBPube1uEVvvWEeKP9X3KZEg6_cuRHes2nCRQp1oD9YrtL1HY9nejHJDdJLzIahW2bz39CMHK-JrdjJnADMCocsd993rX0-MQifZRxZbOiVmlljtCiwerybuPp_U_QZgLFK4xI1ID6L_kbIVKrV0eI-ql64lnbtJG5Tj6E15254IzesjQJVzFCk9ux2Duf8BD9OfTmaS4V16orG6rWqaf1_GOGpbU9oFkNNBOXuwL2hG5utqGgr",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200"
];

export default function ProfileView({ state, onStateChange, onLogout }: ProfileViewProps) {
  const [name, setName] = useState(state.profile.name || '');
  const [location, setLocation] = useState(state.profile.location || '');
  const [temp, setTemp] = useState(state.profile.temperature || '');
  const [birthDate, setBirthDate] = useState(state.profile.birthDate || '');
  
  const [savedMsg, setSavedMsg] = useState(false);
  const [showGalleryPermission, setShowGalleryPermission] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeInstruction, setActiveInstruction] = useState<number | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLevelsModal, setShowLevelsModal] = useState(false);

  const handleResetData = () => {
    const cleanState = getCleanInitialState(name || 'Usuário');
    onStateChange(cleanState, true);
    
    setName(cleanState.profile.name);
    setLocation(cleanState.profile.location);
    setTemp(cleanState.profile.temperature);
    setBirthDate(cleanState.profile.birthDate || '');
    
    setShowResetConfirm(false);
    setLocationError("Todos os dados do seu perfil foram limpos e reiniciados com sucesso!");
    setTimeout(() => {
      setLocationError(null);
    }, 5000);
  };

  // Dark Mode State initialized from localStorage or body element class
  const [isDark, setIsDark] = useState(() => {
    return document.body.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
  });

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleToggleNotifications = async () => {
    const nextVal = !state.notificationsEnabled;
    if (nextVal) {
      if ('Notification' in window) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            onStateChange({
              ...state,
              notificationsEnabled: true
            });
            setLocationError("Permissão de notificações concedida com sucesso!");
            setTimeout(() => setLocationError(null), 3500);
          } else {
            setLocationError("Permissão de notificações foi negada pelo navegador.");
            setTimeout(() => setLocationError(null), 4000);
          }
        } catch (e) {
          onStateChange({
            ...state,
            notificationsEnabled: true
          });
          setLocationError("Notificações simuladas ativadas com sucesso!");
          setTimeout(() => setLocationError(null), 3500);
        }
      } else {
        onStateChange({
          ...state,
          notificationsEnabled: true
        });
      }
    } else {
      onStateChange({
        ...state,
        notificationsEnabled: false
      });
    }
  };

  const handleToggleLocation = async () => {
    const nextVal = !state.locationEnabled;
    if (nextVal) {
      if (navigator.geolocation) {
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const geoData = await geoRes.json();
              const city = geoData.address.city || geoData.address.town || geoData.address.village || geoData.address.state || "Sua Cidade";
              
              const weatherRes = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
              );
              const weatherData = await weatherRes.json();
              const currentTemp = weatherData.current_weather?.temperature;

              onStateChange({
                ...state,
                locationEnabled: true,
                profile: {
                  ...state.profile,
                  location: city,
                  temperature: currentTemp !== undefined ? `${Math.round(currentTemp)}°C` : state.profile.temperature
                }
              });
              setLocation(city);
              if (currentTemp !== undefined) {
                setTemp(`${Math.round(currentTemp)}°C`);
              }
              setLocationError("Serviços de localização ativados com sucesso!");
              setTimeout(() => setLocationError(null), 3500);
            } catch (err) {
              onStateChange({
                ...state,
                locationEnabled: true
              });
              setLocationError("Localização GPS ativada, mas houve erro ao carregar nome da cidade.");
              setTimeout(() => setLocationError(null), 4000);
            } finally {
              setLoadingLocation(false);
            }
          },
          (err) => {
            setLoadingLocation(false);
            setLocationError("Permissão de localização negada pelo navegador.");
            setTimeout(() => setLocationError(null), 4000);
          }
        );
      } else {
        onStateChange({
          ...state,
          locationEnabled: true
        });
      }
    } else {
      onStateChange({
        ...state,
        locationEnabled: false
      });
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onStateChange({
      ...state,
      profile: {
        ...state.profile,
        name: name,
        location: location,
        temperature: temp,
        birthDate: birthDate
      }
    });

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const triggerGallerySelect = () => {
    setShowGalleryPermission(true);
  };

  const handleGrantPermission = () => {
    setShowGalleryPermission(false);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        onStateChange({
          ...state,
          profile: {
            ...state.profile,
            avatarUrl: base64Url
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 animate-fade-in">
      
      {/* Hidden File Input for Native Photo Library */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Page Header */}
      <section className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Meu Perfil</h2>
        <p className="text-xs text-on-surface-variant font-medium">Ajustes & Desempenho Pessoal</p>
      </section>

      {savedMsg && (
        <div className="bg-[#6cf8bb]/15 border border-[#006c49]/30 text-[#00714d] px-4 py-3 rounded-xl text-xs font-semibold animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4" /> Configurações salvas e sincronizadas com sucesso!
        </div>
      )}

      {/* Profile Overview Card with Avatar cycling */}
      <section className="glass-card p-6 rounded-[28px] flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        
        {/* Avatar element */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-md bg-slate-50">
            {state.profile.avatarUrl ? (
              <img 
                src={state.profile.avatarUrl} 
                alt={state.profile.name || "Perfil"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                <User className="w-10 h-10" />
              </div>
            )}
          </div>
          <button 
            type="button"
            onClick={triggerGallerySelect}
            className="absolute bottom-0 right-0 p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 active:scale-90 transition-all cursor-pointer shadow-md"
            title="Escolher Foto da Galeria"
          >
            <ImageIcon className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="text-lg font-bold text-on-surface">{state.profile.name || 'Nova Conta'}</h3>
          <p className="text-xs text-on-surface-variant font-medium flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-primary" /> {state.profile.location || 'Sem Localização'}
          </p>
        </div>

        {/* Dynamic Premium Level Calculator */}
        {(() => {
          const getPremiumLevel = (streak: number) => {
            if (streak < 7) {
              return { name: "Novato", next: "Bronze", target: 7, diff: 7 - streak };
            } else if (streak < 30) {
              return { name: "Bronze", next: "Prata", target: 30, diff: 30 - streak };
            } else if (streak < 60) {
              return { name: "Prata", next: "Ouro", target: 60, diff: 60 - streak };
            } else if (streak < 90) {
              return { name: "Ouro", next: "Elite", target: 90, diff: 90 - streak };
            } else {
              return { name: "Elite", next: null, target: 90, diff: 0 };
            }
          };
          const levelInfo = getPremiumLevel(state.profile.streakDays || 0);

          return (
            <div className="w-full mt-6 space-y-4 border-t border-[#c3c6d7]/30 pt-4">
              <div className="flex gap-6 w-full justify-around">
                <div>
                  <span className="text-[9px] font-bold text-[#737686] uppercase block">Dias Ativos</span>
                  <span className="text-lg font-extrabold text-on-surface flex items-center gap-1 justify-center mt-0.5">
                    🔥 {state.profile.streakDays || 0}
                  </span>
                </div>
                <div className="w-[1px] bg-[#c3c6d7]/20" />
                <div>
                  <button onClick={() => setShowLevelsModal(true)} className="text-[9px] font-bold text-[#737686] uppercase block hover:text-blue-600 transition-colors">Nível</button>
                  <button onClick={() => setShowLevelsModal(true)} className="text-lg font-extrabold text-primary flex items-center gap-1 justify-center mt-0.5 hover:opacity-80 transition-opacity">
                    <Award className="w-4 h-4 text-primary" /> {levelInfo.name}
                  </button>
                </div>
              </div>

              {/* level progression guide */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100/50 p-2.5 rounded-2xl text-[10px] font-bold text-slate-500 text-center leading-normal">
                {levelInfo.next ? (
                  <span>
                    Próxima Meta: Alcance <span className="text-blue-600 font-extrabold">{levelInfo.target} dias ativos</span> para subir ao nível <span className="text-blue-600 font-extrabold">{levelInfo.next}</span> (faltam {levelInfo.diff} dias ativos).
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    👑 Parabéns! Você atingiu o nível máximo de **Elite** no Vyntra!
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* Edit Form */}
      <form onSubmit={handleSaveSettings} className="glass-card p-6 rounded-[28px] space-y-4">
        <h4 className="text-xs font-bold text-[#737686] uppercase tracking-widest border-b border-[#c3c6d7]/20 pb-2 mb-2">
          Editar Dados Cadastrais
        </h4>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#434655] ml-1">Nome de Exibição</label>
          <input 
            type="text" 
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#434655] ml-1">Data de Nascimento</label>
          <input 
            type="date" 
            placeholder="DD/MM/AAAA"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#434655] ml-1">Cidade</label>
            <input 
              type="text" 
              placeholder="Ex: São Paulo"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#434655] ml-1">Temperatura</label>
            <input 
              type="text" 
              placeholder="Ex: 24°C"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="w-full bg-[#f3f4f6] rounded-xl px-4 py-3 text-sm focus:bg-white focus:ring-1 focus:ring-primary focus:outline-none transition-all"
            />
          </div>
        </div>

        {locationError && (() => {
          const isSuccess = locationError.toLowerCase().includes("sucesso") || locationError.toLowerCase().includes("concedida") || locationError.toLowerCase().includes("ativad");
          return (
            <div className={`text-[11px] font-bold p-3 rounded-xl animate-fade-in text-center leading-normal border ${
              isSuccess 
                ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" 
                : "text-red-500 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border-red-100 dark:border-red-900/30"
            }`}>
              {locationError}
            </div>
          );
        })()}

        <button 
          type="submit"
          className="w-full bg-[#2563eb] text-white py-3.5 rounded-xl font-bold hover:opacity-95 active:scale-95 transition-all cursor-pointer text-sm"
        >
          Salvar Alterações
        </button>
      </form>

      {/* Configurações de Alerta Section */}
      <section className="glass-card p-6 rounded-[28px] space-y-5">
        <h4 className="text-xs font-bold text-[#737686] uppercase tracking-widest border-b border-[#c3c6d7]/20 pb-2 mb-2 flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-blue-600 animate-pulse" /> Configurações de Alerta
        </h4>

        {/* Notifications Toggle */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100/50 dark:border-slate-800/50">
          <div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">Permitir Notificações</h5>
            <p className="text-[11px] text-slate-500 font-medium">Receba alertas em tempo real sobre compromissos da agenda e lembretes de saúde</p>
          </div>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${state.notificationsEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${state.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}>
              <Bell className={`w-3 h-3 ${state.notificationsEnabled ? 'text-blue-600' : 'text-slate-400'}`} />
            </div>
          </button>
        </div>

        {/* Location Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 font-sans">Capturar minha localização</h5>
            <p className="text-[11px] text-slate-500 font-medium">Sincronize sua cidade e região para obter previsões climáticas automáticas</p>
          </div>
          <button
            type="button"
            disabled={loadingLocation}
            onClick={handleToggleLocation}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${state.locationEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'} ${loadingLocation ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${state.locationEnabled ? 'translate-x-6' : 'translate-x-0'}`}>
              {loadingLocation ? (
                <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
              ) : (
                <Compass className={`w-3 h-3 ${state.locationEnabled ? 'text-blue-600' : 'text-slate-400'}`} />
              )}
            </div>
          </button>
        </div>
      </section>

      {/* Preferências do Aplicativo Section */}
      <section className="glass-card p-6 rounded-[28px] space-y-5">
        <h4 className="text-xs font-bold text-[#737686] uppercase tracking-widest border-b border-[#c3c6d7]/20 pb-2 mb-2 flex items-center gap-1.5">
          <Settings className="w-4 h-4 text-blue-600 animate-spin-slow" /> Preferências do Aplicativo
        </h4>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">Modo Escuro</h5>
            <p className="text-[11px] text-slate-500 font-medium">Ativa o visual de alto contraste escuro</p>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${isDark ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDark ? 'translate-x-6' : 'translate-x-0'}`}>
              {isDark ? <Moon className="w-3.5 h-3.5 text-blue-600" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            </div>
          </button>
        </div>
      </section>

      {/* App Instructions Accordion */}
      <section className="glass-card p-6 rounded-[28px] space-y-4">
        <h4 className="text-xs font-bold text-[#737686] uppercase tracking-widest border-b border-[#c3c6d7]/20 pb-2 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-blue-600" /> Instruções do Aplicativo
        </h4>
        <div className="space-y-2.5">
          {[
            {
              q: "Como registrar meus treinos personalizados?",
              a: "Na aba Treinos, clique em 'Registrar Novo Treino'. Você pode selecionar categorias pré-definidas (Musculação, Corrida, Funcional) ou digitar um esporte personalizado de sua preferência como Futevôlei, Natação ou Surf."
            },
            {
              q: "Como gerenciar meus cursos e progresso?",
              a: "Na aba Estudos, cadastre os cursos que está realizando informando o título, instrutor e o link URL do curso. Use o botão 'Estudar' para abrir o link diretamente, e o botão 'Avançar +5%' ou 'Terminar Curso' para enviar ao histórico de concluintes."
            },
            {
              q: "Como configurar os alertas e notificações?",
              a: "Na aba Calendário, clique no ícone do sino de notificações. O sistema solicitará permissão do dispositivo para emitir alertas e notificações das suas programações registradas."
            },
            {
              q: "Como conectar com contatos no Ranking?",
              a: "Na aba Ranking, você verá sua posição baseada nos seus treinos, hidratação e estudos semanais. É possível convidar novos contatos por e-mail/nome na barra de busca superior para competir de forma saudável."
            },
            {
              q: "Como registrar minha hidratação diária?",
              a: "Na aba Saúde > Alimentação, o bloco de Hidratação exibe o progresso de copos de água consumidos. Clique no botão de adicionar copos para atualizar em tempo real, acompanhando a animação fluida da água subindo."
            }
          ].map((item, idx) => {
            const isOpen = activeInstruction === idx;
            return (
              <div key={idx} className="border-b border-slate-100 last:border-b-0 pb-2 last:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveInstruction(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left py-1 text-xs font-bold text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <p className="mt-1 text-[11px] text-slate-500 leading-relaxed pl-1 font-medium animate-fade-in">
                    {item.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* GALLERY PERMISSION DIALOG MODAL */}
      {showGalleryPermission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full text-center space-y-4 shadow-xl">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <ImageIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-800">Acesso à Galeria</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Este aplicativo requer sua permissão para acessar suas fotos e carregar uma imagem de perfil personalizada. Deseja permitir o acesso?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowGalleryPermission(false)}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Recusar
              </button>
              <button
                type="button"
                onClick={handleGrantPermission}
                className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Permitir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Levels Progress Modal */}
      {showLevelsModal && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[10000] animate-fade-in"
          onClick={() => setShowLevelsModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Progressão de Nível</h3>
              <button 
                onClick={() => setShowLevelsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dias ativos são contados a partir da sua sequência diária de metas cumpridas (treinos, hidratação e peso). Mantenha a constância para subir de nível!
            </p>
            <div className="space-y-3">
              {[
                { name: "Novato", min: 0 },
                { name: "Bronze", min: 7 },
                { name: "Prata", min: 30 },
                { name: "Ouro", min: 60 },
                { name: "Elite", min: 90 }
              ].map((level) => (
                <div key={level.name} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-300">{level.name}</span>
                  <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">{level.min}+ dias ativos</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLevelsModal(false)}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-sm hover:bg-blue-700 transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Reset Database/Data Card */}

      <section className="glass-card p-6 rounded-[28px] border border-[#ffdad6]/30 space-y-4">
        <h4 className="text-xs font-bold text-[#ba1a1a] uppercase tracking-widest border-b border-[#ffdad6]/20 pb-2 mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4" /> Manutenção de Dados
        </h4>
        
        {!showResetConfirm ? (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Deseja zerar todas as informações cadastradas (metas de peso, água, treinos registrados, cursos e histórico) e começar totalmente do zero?
            </p>
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-[#ba1a1a] border border-red-200/50 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Zerar e Limpar Todos os Dados
            </button>
          </div>
        ) : (
          <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100/80 space-y-3 animate-fade-in">
            <p className="text-xs font-bold text-[#ba1a1a] text-center leading-normal">
              ⚠️ Tem certeza absoluta? Essa ação apagará de forma irreversível todo o seu progresso do banco de dados!
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Logout Action Button */}
      <button 
        onClick={onLogout}
        className="w-full bg-white border border-[#ffdad6] text-[#ba1a1a] py-3.5 rounded-xl font-bold hover:bg-[#ffdad6]/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer text-sm"
      >
        <LogOut className="w-4 h-4" /> Sair da Conta
      </button>
    </div>
  );
}

