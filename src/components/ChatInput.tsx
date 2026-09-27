import { useEffect, useRef, useState } from 'react';
import { Send, Square, Mic } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop: () => void;
  disabled: boolean;
  loading: boolean;
}

export function ChatInput({ onSend, onStop, disabled, loading }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-4 pt-2 pb-3 safe-bottom bg-tekno-bg/80 backdrop-blur-lg border-t border-tekno-border">
      <div className="flex items-end gap-2">
        <button
          className="w-11 h-11 rounded-2xl bg-tekno-surface2 border border-tekno-border flex items-center justify-center shrink-0 text-tekno-textdim active:scale-95 transition-transform"
          title="Sesli giriş (yakında)"
        >
          <Mic size={18} />
        </button>
        <div className="flex-1 bg-tekno-surface2 border border-tekno-border rounded-2xl focus-within:border-tekno-primary/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mesajınızı yazın..."
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-[15px] text-tekno-text placeholder:text-tekno-textdim px-4 py-3 outline-none resize-none disabled:opacity-50"
          />
        </div>
        {loading ? (
          <button
            onClick={onStop}
            className="w-11 h-11 rounded-2xl bg-tekno-error text-tekno-bg flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <Square size={18} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="w-11 h-11 rounded-2xl bg-tekno-primary text-tekno-bg flex items-center justify-center shrink-0 disabled:opacity-30 disabled:bg-tekno-border enabled:active:scale-95 transition-all enabled:glow-primary"
          >
            <Send size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
