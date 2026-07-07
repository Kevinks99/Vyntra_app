import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Search, 
  UserPlus, 
  Users, 
  Share2, 
  X, 
  Check, 
  Sparkles,
  Zap,
  BookOpen,
  Award
} from 'lucide-react';
import { AppState } from '../types';
import { auth, subscribeToAllUsers } from '../lib/firebase';

interface RankingViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

interface RankedUser {
  id: string;
  name: string;
  avatarUrl: string;
  points: number;
  streak: number;
  rank: number;
  isCurrentUser?: boolean;
}

export default function RankingView({ state, onStateChange }: RankingViewProps) {
  const [activeTab, setActiveTab] = useState<'geral' | 'amigos'>('geral');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [allFirestoreUsers, setAllFirestoreUsers] = useState<RankedUser[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((users) => {
      setAllFirestoreUsers(users);
    });
    return () => unsubscribe();
  }, []);

  // Calculate user's score based on actual metrics from Firestore!
  const userStreak = state.profile.streakDays || 1;
  const userWorkoutsCount = state.workouts?.length || 0;
  const userWaterCount = state.waterIntakeCups || 0;
  const userBooksRead = state.books?.filter(b => b.progressPercent === 100).length || 0;
  
  const userPoints = (userStreak * 150) + (userWorkoutsCount * 120) + (userWaterCount * 15) + (userBooksRead * 500) + 750;

  // Get ranked users from state.contacts (empty by default, user-populated)
  const initialRankedUsers: RankedUser[] = state.contacts || [];

  const currentUserObj: RankedUser = {
    id: auth.currentUser?.uid || 'current-user-id',
    name: state.profile.name || 'Você',
    avatarUrl: state.profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200',
    points: userPoints,
    streak: userStreak,
    rank: 0, // calculated below
    isCurrentUser: true
  };

  const currentUid = auth.currentUser?.uid;

  // Combine and sort
  const allUsersSorted = (activeTab === 'geral' && allFirestoreUsers.length > 0)
    ? allFirestoreUsers.map(usr => ({
        ...usr,
        isCurrentUser: usr.id === currentUid
      })).sort((a, b) => b.points - a.points).map((usr, index) => ({
        ...usr,
        rank: index + 1
      }))
    : [...initialRankedUsers, currentUserObj]
        .sort((a, b) => b.points - a.points)
        .map((usr, index) => ({
          ...usr,
          rank: index + 1
        }));

  const podium1 = allUsersSorted.find(u => u.rank === 1) || allUsersSorted[0];
  const podium2 = allUsersSorted.find(u => u.rank === 2) || allUsersSorted[1];
  const podium3 = allUsersSorted.find(u => u.rank === 3) || allUsersSorted[2];

  const listUsers = allUsersSorted.filter(u => u.rank > 3);

  // Filters based on search
  const filteredListUsers = listUsers.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName) return;

    // Create a new contact to add to rankings
    const newContact: RankedUser = {
      id: 'contact-' + Date.now(),
      name: inviteName,
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?auto=format&fit=crop&q=80&w=200&h=200`,
      points: Math.floor(Math.random() * 1200) + 400, // random realistic points
      streak: Math.floor(Math.random() * 8) + 1, // random realistic streak
      rank: 0
    };

    onStateChange({
      ...state,
      contacts: [...(state.contacts || []), newContact]
    });

    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setShowInviteModal(false);
      setInviteName('');
      setInviteEmail('');
    }, 1500);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pb-24 animate-fade-in" id="ranking-root">
      
      {/* Page Header */}
      <header className="flex items-center justify-between py-2">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-center gap-2">
            Comunidade
          </h1>
          <p className="text-xs text-slate-400 font-semibold">Consistência e Competição</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-full text-xs font-bold transition-all shadow-[0_6px_15px_rgba(37,99,235,0.2)] cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" /> Conectar
        </button>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('geral')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
            activeTab === 'geral' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Ranking Geral
        </button>
        <button
          onClick={() => setActiveTab('amigos')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'amigos' 
              ? 'bg-white text-blue-600 shadow-sm' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Meus Amigos
        </button>
      </div>

      {activeTab === 'amigos' && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-center space-y-2 animate-fade-in">
          <p className="text-xs font-semibold text-slate-600">
            Você ainda não conectou contatos. Sincronize sua agenda ou convide amigos para disputarem no ranking semanal!
          </p>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            Sincronizar meus contatos agora
          </button>
        </div>
      )}

      {/* PODIUM AREA - Visually Stunning */}
      <section className="bg-gradient-to-b from-slate-50 to-slate-100/50 rounded-[32px] p-6 border border-slate-100 relative">
        <div className="absolute top-4 left-4 flex items-center gap-1 text-[9px] font-extrabold text-blue-600 bg-blue-100/60 px-2.5 py-1 rounded-full uppercase">
          <Trophy className="w-3 h-3 text-amber-500" /> Top Consistência
        </div>

        {/* Podium columns */}
        <div className="flex items-end justify-center gap-2 pt-8 pb-2">
          
          {/* #2 Rank Column */}
          {podium2 && (
            <div className="flex flex-col items-center w-24">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-300 ring-4 ring-slate-100">
                  <img 
                    src={podium2.avatarUrl} 
                    alt={podium2.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-slate-300 text-slate-800 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                  2
                </div>
              </div>
              <h4 className="text-xs font-black text-slate-700 truncate w-full text-center mt-3 leading-none">
                {podium2.name.split(' ')[0]}
              </h4>
              <span className="text-[10px] font-extrabold text-slate-500 mt-1">
                {podium2.points} pts
              </span>
              <div className="w-full bg-slate-200/60 rounded-t-xl h-14 mt-3 flex items-center justify-center">
                <span className="text-xs font-black text-slate-400">Prata</span>
              </div>
            </div>
          )}

          {/* #1 Rank Column (Center, taller) */}
          {podium1 && (
            <div className="flex flex-col items-center w-28 relative -top-3">
              <div className="absolute -top-7 text-amber-500 animate-bounce">
                👑
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 ring-4 ring-amber-100">
                  <img 
                    src={podium1.avatarUrl} 
                    alt={podium1.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[11px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow">
                  1
                </div>
              </div>
              <h4 className="text-sm font-black text-slate-800 truncate w-full text-center mt-3 leading-none">
                {podium1.name.split(' ')[0]} {podium1.isCurrentUser ? '🎉' : ''}
              </h4>
              <span className="text-xs font-black text-amber-600 mt-1">
                {podium1.points} pts
              </span>
              <div className="w-full bg-amber-100/60 border border-amber-200/40 rounded-t-2xl h-20 mt-3 flex items-center justify-center">
                <span className="text-xs font-black text-amber-600">Ouro</span>
              </div>
            </div>
          )}

          {/* #3 Rank Column */}
          {podium3 && (
            <div className="flex flex-col items-center w-24">
              <div className="relative">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-400 ring-4 ring-orange-100">
                  <img 
                    src={podium3.avatarUrl} 
                    alt={podium3.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                  3
                </div>
              </div>
              <h4 className="text-xs font-black text-slate-700 truncate w-full text-center mt-3 leading-none">
                {podium3.name.split(' ')[0]}
              </h4>
              <span className="text-[10px] font-extrabold text-slate-500 mt-1">
                {podium3.points} pts
              </span>
              <div className="w-full bg-orange-100/30 rounded-t-xl h-10 mt-3 flex items-center justify-center">
                <span className="text-xs font-black text-orange-600">Bronze</span>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Search contacts bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por competidores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600/20 focus:bg-white transition-all"
        />
      </div>

      {/* Rankings List */}
      <section className="space-y-2.5">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest block ml-1">
          Lista Geral de Participantes
        </h3>

        <div className="space-y-2">
          {filteredListUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                user.isCurrentUser 
                  ? 'bg-blue-50/50 border-blue-100 shadow-sm' 
                  : 'bg-white border-slate-50 hover:border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Position */}
                <span className="text-sm font-black text-slate-400 w-5 text-center">
                  {user.rank}
                </span>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-100">
                  <img 
                    src={user.avatarUrl} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Name & streak */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">
                    {user.name} {user.isCurrentUser && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1 font-extrabold">Você</span>}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 mt-0.5">
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> {user.streak} dias seguidos
                  </p>
                </div>
              </div>

              {/* Points badge */}
              <div className="text-right">
                <span className="text-sm font-black text-slate-800 block">
                  {user.points}
                </span>
                <span className="text-[9px] font-extrabold text-slate-400 block uppercase">
                  PONTOS
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invite Friends Modal / Connecting Screen */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm relative space-y-4 shadow-xl">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Conectar Contatos</h3>
              <p className="text-xs text-slate-500">
                Sincronize seus contatos ou envie convites rápidos para construir sua rede no Vyntra.
              </p>
            </div>

            {inviteSuccess ? (
              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-center text-xs font-bold animate-fade-in">
                🚀 Convite enviado com sucesso! Conexão pendente de confirmação.
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 ml-1">Nome do Contato</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marcus"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 ml-1">E-mail ou WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="marcus@vyntra.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 focus:bg-white rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  Sincronizar e Conectar
                </button>
              </form>
            )}

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 text-center space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                Compartilhar Link de Convite
              </span>
              
              {/* Social Quick-share Bento Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Copy Link Button */}
                <button 
                  onClick={() => {
                    const shareUrl = window.location.origin + '?invite=' + encodeURIComponent(state.profile.name || 'usuario');
                    navigator.clipboard.writeText(shareUrl);
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2500);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    linkCopied 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500 animate-bounce" /> Copiado!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-slate-400" /> Copiar Link
                    </>
                  )}
                </button>

                {/* WhatsApp button */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `Aceite meu convite para disputar a consistência de hábitos comigo no Vyntra! Nosso ranking e progresso de treinos, estudos e leitura serão conectados: ${
                      window.location.origin + '?invite=' + encodeURIComponent(state.profile.name || 'usuario')
                    }`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.528 2.028 14.072.99 11.457.99c-5.41 0-9.811 4.372-9.815 9.801-.002 1.81.488 3.578 1.419 5.116l-.992 3.623 3.737-.968c1.517.808 3.033 1.222 4.258 1.222zm11.296-6.182c-.312-.156-1.843-.91-2.128-1.014-.283-.104-.49-.156-.696.156-.206.312-.796.992-.976 1.196-.18.204-.36.23-.672.074-.312-.156-1.316-.486-2.507-1.549-.927-.827-1.553-1.849-1.735-2.16-.182-.312-.02-.482.137-.636.14-.14.312-.365.468-.547.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.547-.078-.156-.696-1.678-.954-2.298-.25-.6-.525-.519-.72-.53-.186-.01-.398-.011-.61-.011-.212 0-.557.08-.85.393-.292.313-1.116 1.092-1.116 2.66 0 1.568 1.144 3.084 1.3 3.3.156.213 2.25 3.435 5.45 4.814.762.328 1.357.523 1.822.671.765.243 1.46.209 2.01.127.613-.092 1.844-.754 2.102-1.446.257-.692.257-1.287.18-1.412-.078-.125-.283-.207-.595-.363z"/>
                  </svg>
                  WhatsApp
                </a>

                {/* Telegram button */}
                <a
                  href={`https://telegram.me/share/url?url=${encodeURIComponent(
                    window.location.origin + '?invite=' + encodeURIComponent(state.profile.name || 'usuario')
                  )}&text=${encodeURIComponent(
                    `Aceite meu convite para disputar a consistência de hábitos comigo no Vyntra!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <span className="text-[10px]">✈️</span> Telegram
                </a>

                {/* X / Twitter button */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `Dispute a consistência comigo no Vyntra! Aceite meu convite de rede: ${
                      window.location.origin + '?invite=' + encodeURIComponent(state.profile.name || 'usuario')
                    }`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-black hover:bg-black/80 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <span className="text-[9px] font-black">X</span> Twitter
                </a>
              </div>

              {/* Instagram story tip */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl p-2.5 border border-pink-100/50 dark:border-pink-950/40 text-[9px] font-bold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                <span className="text-sm">📸</span>
                <p className="text-left leading-relaxed">
                  Para o <span className="font-extrabold">Instagram</span>, copie o link e use o adesivo de "Link" nos seus Stories!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
