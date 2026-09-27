import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, ChevronDown, Sparkles, Code2, Layout, Camera, Lightbulb, MessageSquare, Trash2, Check } from 'lucide-react';
import { Splash } from '@/components/Splash';
import { ModeSelector } from '@/components/ModeSelector';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { BottomNav } from '@/components/BottomNav';
import { SettingsScreen } from '@/components/SettingsScreen';
import { supabase, getDeviceId } from '@/lib/supabase';
import { sendChat, loadMessages, saveMessage, checkAiConfigured, deleteMessagesByConversation } from '@/lib/ai';
import { useSettings } from '@/lib/settings';
import { AI_MODES, LANGUAGE_LABELS, type AiMode, type Conversation, type Message, type ModeInfo, type NavTab } from '@/types';

const ICONS: Record<string, typeof Sparkles> = { Sparkles, Code2, Layout, Camera, Lightbulb };

function App() {
  const { settings, updateLanguage, updateTheme } = useSettings();

  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<NavTab>('chat');
  const [modeSelectorOpen, setModeSelectorOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<AiMode>('genel');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const deviceId = getDeviceId();

  const loadConversations = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('conversations')
      .select('*')
      .eq('device_id', deviceId)
      .order('updated_at', { ascending: false });
    if (err) return;
    setConversations((data ?? []) as Conversation[]);
  }, [deviceId]);

  useEffect(() => {
    if (!showSplash) {
      loadConversations();
      checkAiConfigured().then(setAiConfigured);
    }
  }, [showSplash, loadConversations]);

  const createConversation = useCallback(async (): Promise<string | null> => {
    const { data, error: err } = await supabase
      .from('conversations')
      .insert({ device_id: deviceId, mode: currentMode, title: 'Yeni Sohbet' })
      .select()
      .single();
    if (err || !data) return null;
    const conv = data as Conversation;
    setConversations((prev) => [conv, ...prev]);
    setActiveConvId(conv.id);
    setMessages([]);
    return conv.id;
  }, [deviceId, currentMode]);

  const handleNewChat = useCallback(async () => {
    setError(null);
    if (abortRef.current) abortRef.current.abort();
    await createConversation();
    setActiveTab('chat');
  }, [createConversation]);

  const handleSelectConversation = useCallback(async (id: string) => {
    if (abortRef.current) abortRef.current.abort();
    setActiveConvId(id);
    setError(null);
    setActiveTab('chat');
    try {
      const msgs = await loadMessages(id);
      setMessages(msgs);
      const conv = conversations.find((c) => c.id === id);
      if (conv) setCurrentMode(conv.mode);
    } catch {
      setError('Sohbet yüklenemedi');
    }
  }, [conversations]);

  const handleDeleteConversation = useCallback(async (id: string) => {
    const { error: err } = await supabase.from('conversations').delete().eq('id', id);
    if (err) return;
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
    }
  }, [activeConvId]);

  const handleClearConversation = useCallback(async () => {
    if (!activeConvId) return;
    try {
      await deleteMessagesByConversation(activeConvId);
      setMessages([]);
    } catch {
      setError('Sohbet temizlenemedi');
    }
  }, [activeConvId]);

  const callAi = useCallback(async (
    chatMessages: { role: string; content: string }[],
    convId: string,
    userText: string,
    isFirstMessage: boolean
  ) => {
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);

    try {
      const result = await sendChat(chatMessages, currentMode, settings.language, controller.signal);

      if (controller.signal.aborted) return;

      if (!result.configured || !result.reply) {
        setError(result.error ?? 'AI yapılandırılmadı');
        return;
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        conversation_id: convId,
        role: 'assistant',
        content: result.reply,
        mode: currentMode,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      saveMessage(convId, 'assistant', result.reply, currentMode).catch(() => {});

      if (isFirstMessage) {
        const title = userText.length > 40 ? userText.slice(0, 40) + '...' : userText;
        supabase
          .from('conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', convId)
          .then(() => loadConversations());
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error && err.name === 'AbortError'
        ? 'Yanıt durduruldu'
        : 'Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }, [currentMode, settings.language, loadConversations]);

  const handleSend = useCallback(async (text: string) => {
    setError(null);
    setLastUserMessage(text);

    let convId = activeConvId;
    if (!convId) {
      convId = await createConversation();
      if (!convId) {
        setError('Sohbet oluşturulamadı');
        return;
      }
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      conversation_id: convId,
      role: 'user',
      content: text,
      mode: currentMode,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    saveMessage(convId, 'user', text, currentMode).catch(() => {});

    const isFirst = messages.length === 0;
    const chatMessages = [...messages, { role: 'user', content: text }].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await callAi(chatMessages, convId, text, isFirst);
  }, [activeConvId, createConversation, currentMode, messages, callAi]);

  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      setLoading(false);
    }
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (!lastUserMessage || !activeConvId) return;

    const trimmed = messages[messages.length - 1]?.role === 'assistant'
      ? messages.slice(0, -1)
      : messages;
    const chatMessages = trimmed.map((m) => ({ role: m.role, content: m.content }));

    setMessages(trimmed);
    await callAi(chatMessages, activeConvId, lastUserMessage, false);
  }, [lastUserMessage, activeConvId, messages, callAi]);

  const handleRetry = useCallback(async () => {
    if (!lastUserMessage || !activeConvId) return;
    setError(null);
    const chatMessages = messages.map((m) => ({ role: m.role, content: m.content }));
    await callAi(chatMessages, activeConvId, lastUserMessage, false);
  }, [lastUserMessage, activeConvId, messages, callAi]);

  const handleModeChange = useCallback(async (mode: AiMode) => {
    setCurrentMode(mode);
    if (activeConvId) {
      await supabase
        .from('conversations')
        .update({ mode, updated_at: new Date().toISOString() })
        .eq('id', activeConvId);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConvId ? { ...c, mode } : c))
      );
    }
  }, [activeConvId]);

  const currentModeInfo = AI_MODES.find((m) => m.key === currentMode) ?? AI_MODES[0];
  const ModeIcon = ICONS[currentModeInfo.icon] ?? Sparkles;
  const canRegenerate = messages.length > 0 && !loading;

  if (showSplash) {
    return <Splash onDone={() => setShowSplash(false)} />;
  }

  if (activeTab === 'settings') {
    return (
      <div className="flex flex-col h-full bg-tekno-bg">
        <SettingsScreen
          settings={settings}
          onLanguageChange={updateLanguage}
          onThemeChange={updateTheme}
          onBack={() => setActiveTab('chat')}
        />
        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'conversations') {
    return (
      <div className="flex flex-col h-full bg-tekno-bg">
        <header className="flex items-center gap-3 px-4 py-3 safe-top glass border-b border-tekno-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tekno-primary/15 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-gradient">T</span>
            </div>
            <p className="text-[15px] font-semibold text-tekno-text">Sohbet Geçmişi</p>
          </div>
          <button
            onClick={handleNewChat}
            className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center text-tekno-primary bg-tekno-primary/10 active:scale-95 transition-transform"
          >
            <Plus size={20} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquare size={40} className="text-tekno-border mb-3" />
              <p className="text-tekno-textdim text-sm">Henüz sohbet yok</p>
            </div>
          )}
          {conversations.map((conv) => {
            const modeLabel = AI_MODES.find((m) => m.key === conv.mode)?.label ?? 'Genel';
            const isActive = conv.id === activeConvId;
            return (
              <div
                key={conv.id}
                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors active:scale-[0.98] ${
                  isActive ? 'bg-tekno-primary/10 border border-tekno-primary/20' : 'bg-tekno-surface2 border border-tekno-border'
                }`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <MessageSquare size={18} className={isActive ? 'text-tekno-primary shrink-0' : 'text-tekno-textdim shrink-0'} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isActive ? 'text-tekno-text' : 'text-tekno-textdim'}`}>
                    {conv.title ?? 'Yeni Sohbet'}
                  </p>
                  <p className="text-[10px] text-tekno-textdim truncate">{modeLabel}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-tekno-textdim hover:text-tekno-error hover:bg-tekno-error/10 transition-colors shrink-0"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>

        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    );
  }

  if (activeTab === 'modes') {
    return (
      <div className="flex flex-col h-full bg-tekno-bg">
        <header className="flex items-center gap-3 px-4 py-3 safe-top glass border-b border-tekno-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tekno-primary/15 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-gradient">T</span>
            </div>
            <p className="text-[15px] font-semibold text-tekno-text">AI Modları</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-sm text-tekno-textdim mb-2">
            Bir mod seçin. AI yanıtları seçtiğiniz moda göre özelleştirilir.
          </p>
          {AI_MODES.map((mode: ModeInfo) => {
            const Icon = ICONS[mode.icon] ?? Sparkles;
            const isActive = currentMode === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => { handleModeChange(mode.key); setActiveTab('chat'); }}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'border-tekno-primary bg-tekno-primary/10 glow-primary'
                    : 'border-tekno-border bg-tekno-surface2 hover:border-tekno-primary/40'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-tekno-primary/20' : 'bg-tekno-bg'
                }`}>
                  <Icon size={24} className={isActive ? 'text-tekno-primary' : 'text-tekno-textdim'} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium text-[15px] ${isActive ? 'text-tekno-primary' : 'text-tekno-text'}`}>
                    {mode.label}
                  </p>
                  <p className="text-xs text-tekno-textdim mt-0.5">{mode.description}</p>
                </div>
                {isActive && <Check size={20} className="text-tekno-primary shrink-0" />}
              </button>
            );
          })}
        </div>

        <BottomNav active={activeTab} onChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-tekno-bg">
      <header className="flex items-center gap-3 px-4 py-3 safe-top glass border-b border-tekno-border">
        <div className="flex-1 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-tekno-primary/15 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-gradient">T</span>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-tekno-text leading-tight truncate">
              Türkmen AI
            </p>
            <p className="text-[10px] text-tekno-textdim tracking-widest uppercase leading-tight">
              by TekNova
            </p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-tekno-textdim hover:text-tekno-primary hover:bg-tekno-surface2 transition-colors"
        >
          <Plus size={20} />
        </button>
      </header>

      <button
        onClick={() => setModeSelectorOpen(true)}
        className="flex items-center gap-2 mx-4 mt-3 px-3.5 py-2 rounded-xl bg-tekno-surface2 border border-tekno-border hover:border-tekno-primary/40 transition-colors active:scale-[0.98]"
      >
        <ModeIcon size={16} className="text-tekno-primary shrink-0" />
        <span className="text-sm font-medium text-tekno-text">{currentModeInfo.label}</span>
        <span className="text-xs text-tekno-textdim">·</span>
        <span className="text-xs text-tekno-textdim">{LANGUAGE_LABELS[settings.language]}</span>
        <ChevronDown size={14} className="text-tekno-textdim ml-auto" />
        {aiConfigured === false && (
          <span className="text-[10px] text-tekno-warning font-medium px-1.5 py-0.5 rounded bg-tekno-warning/10">
            API Bekliyor
          </span>
        )}
      </button>

      {modeSelectorOpen && (
        <ModeSelector
          current={currentMode}
          onSelect={handleModeChange}
          onClose={() => setModeSelectorOpen(false)}
        />
      )}

      <ChatMessages
        messages={messages}
        loading={loading}
        error={error}
        onRegenerate={handleRegenerate}
        onRetry={handleRetry}
        onClear={handleClearConversation}
        canRegenerate={canRegenerate}
      />

      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        disabled={loading}
        loading={loading}
      />

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default App;
