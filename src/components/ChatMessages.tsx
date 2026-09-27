import { useEffect, useRef, useState } from 'react';
import { User, Copy, Check, AlertTriangle, RotateCw, Trash2 } from 'lucide-react';
import type { Message } from '@/types';

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onRegenerate: () => void;
  onRetry: () => void;
  onClear: () => void;
  canRegenerate: boolean;
}

export function ChatMessages({
  messages, loading, error, onRegenerate, onRetry, onClear, canRegenerate,
}: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.length === 0 && !loading && !error && (
        <div className="flex flex-col items-center justify-center h-full text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-tekno-primary/10 flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-gradient">T</span>
          </div>
          <p className="text-tekno-text font-medium mb-1">Sohbete başlayın</p>
          <p className="text-sm text-tekno-textdim">
            Bir soru yazın, Türkmen AI size yardımcı olsun
          </p>
        </div>
      )}

      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {loading && <TypingIndicator />}

      {error && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-tekno-error/10 border border-tekno-error/30">
            <AlertTriangle size={18} className="text-tekno-error shrink-0 mt-0.5" />
            <p className="text-sm text-tekno-error/90 flex-1">{error}</p>
          </div>
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-tekno-error/10 border border-tekno-error/30 text-tekno-error text-sm font-medium active:scale-[0.98] transition-transform"
          >
            <RotateCw size={16} />
            Tekrar Dene
          </button>
        </div>
      )}

      {!loading && !error && messages.length > 0 && canRegenerate && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tekno-surface2 border border-tekno-border text-tekno-textdim hover:text-tekno-primary hover:border-tekno-primary/40 text-xs font-medium transition-colors"
          >
            <RotateCw size={14} />
            Yeniden Oluştur
          </button>
          <button
            onClick={onClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tekno-surface2 border border-tekno-border text-tekno-textdim hover:text-tekno-error hover:border-tekno-error/40 text-xs font-medium transition-colors"
          >
            <Trash2 size={14} />
            Sohbeti Temizle
          </button>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-2.5 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
        isUser ? 'bg-tekno-surface2' : 'bg-tekno-primary/15'
      }`}>
        {isUser ? (
          <User size={16} className="text-tekno-textdim" />
        ) : (
          <span className="text-xs font-bold text-gradient">T</span>
        )}
      </div>
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-2.5 selectable ${
          isUser
            ? 'bg-tekno-primary/15 border border-tekno-primary/20 rounded-tr-md'
            : 'bg-tekno-surface2 border border-tekno-border rounded-tl-md'
        }`}>
          <p className="text-[15px] leading-relaxed text-tekno-text whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
        {!isUser && (
          <button
            onClick={handleCopy}
            className="mt-1 flex items-center gap-1 text-xs text-tekno-textdim hover:text-tekno-primary transition-colors pl-1"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Kopyalandı' : 'Kopyala'}
          </button>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 animate-fade-in">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-tekno-primary/15">
        <span className="text-xs font-bold text-gradient">T</span>
      </div>
      <div className="bg-tekno-surface2 border border-tekno-border rounded-2xl rounded-tl-md px-4 py-3.5">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 rounded-full bg-tekno-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 rounded-full bg-tekno-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 rounded-full bg-tekno-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
