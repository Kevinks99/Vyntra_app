import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, Bot, User, Trash2, ArrowRight } from 'lucide-react';
import { AppState } from '../types';

interface AssistantViewProps {
  state: AppState;
  onStateChange: (newState: AppState) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AssistantView({ state, onStateChange }: AssistantViewProps) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('vyn_assistant_chat');
      return saved ? JSON.parse(saved) : [
        {
          id: 'welcome',
          role: 'assistant',
          content: `Olá, **${state.profile.name || 'Membro do Vyntra'}**! Eu sou o **Vyn AI**, seu assistente pessoal de desenvolvimento e alta performance.\n\nComo posso ajudar você hoje? Posso sugerir planos de treino, organizar seu calendário de estudos, planejar sua hidratação ou dar dicas para atingir suas metas de peso.`
        }
      ];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('vyn_assistant_chat', JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: textToSend
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userProfile: {
            name: state.profile.name,
            location: state.profile.location,
            temperature: state.profile.temperature,
            streakDays: state.profile.streakDays
          }
        }),
      });

      if (!response.ok) {
        throw new Error("Falha ao se comunicar com o servidor. Verifique a conexão.");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [
        ...prev,
        {
          id: 'reply-' + Date.now(),
          role: 'assistant',
          content: data.text || "Desculpe, não consegui gerar uma resposta."
        }
      ]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro desconhecido.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const defaultMsg: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `Chat reiniciado. Como posso apoiar você no seu dia hoje, **${state.profile.name || 'Membro do Vyntra'}**?`
    };
    setMessages([defaultMsg]);
    setError(null);
  };

  const quickPrompts = [
    { label: "Plano de Treinos 💪", prompt: "Sugerir um plano de treinos para iniciantes focado em consistência" },
    { label: "Rotina de Estudos 📚", prompt: "Como organizar minha rotina de estudos esta semana para render mais?" },
    { label: "Lanches Ricos em Proteína 🥗", prompt: "Sugerir 3 ideias de lanches saudáveis e fáceis de preparar" },
    { label: "Higiene do Sono 🌙", prompt: "Dicas de higiene do sono para alcançar 8 horas de sono de qualidade" }
  ];

  // Helper function to render text with bold and newline format safely
  const renderMarkdownText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Parse strong markup (**bold**)
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const renderedLine = parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-extrabold text-blue-900 dark:text-blue-200">{part}</strong>;
        }
        return part;
      });

      return (
        <span key={idx} className="block min-h-[1.2em]">
          {renderedLine}
        </span>
      );
    });
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col h-[calc(100vh-170px)] animate-fade-in" id="assistant-view-root">
      {/* Header */}
      <header className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/15">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              Vyn AI <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">Grátis</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-bold">Assistente de Alta Performance</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          title="Limpar conversa"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </header>

      {/* Message List Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'
            }`}>
              {msg.role === 'user' ? <User className="w-4.5 h-4.5" /> : <Bot className="w-4.5 h-4.5" />}
            </div>

            {/* Bubble */}
            <div className={`p-4 rounded-3xl text-xs font-semibold leading-relaxed shadow-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none'
            }`}>
              {renderMarkdownText(msg.content)}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white">
              <Loader2 className="w-4.5 h-4.5 animate-spin" />
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-3xl rounded-tl-none text-xs font-bold text-slate-400 flex items-center gap-2">
              Vyn AI está gerando resposta inteligente...
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 p-4 rounded-2xl text-xs font-bold text-center">
            ⚠️ {error}
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Suggesters */}
      {messages.length === 1 && !isLoading && (
        <div className="shrink-0 space-y-2 pb-3.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Sugestões de Perguntas:</span>
          <div className="grid grid-cols-1 gap-2">
            {quickPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.prompt)}
                className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl text-left text-xs font-bold text-slate-600 transition-all cursor-pointer hover:border-blue-200"
              >
                <span>{p.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box shrink-0 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="shrink-0 pt-2 pb-4 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte ao Vyn AI..."
          disabled={isLoading}
          autoComplete="off"
          autoCorrect="off"
          className="flex-1 bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800/80 rounded-2xl px-4 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500 transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/10 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
