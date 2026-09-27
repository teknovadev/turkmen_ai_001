import { AI_MODES, type AiMode, type ModeInfo } from '@/types';
import { Sparkles, Code2, Layout, Camera, Lightbulb, Check } from 'lucide-react';

const ICONS: Record<string, typeof Sparkles> = {
  Sparkles, Code2, Layout, Camera, Lightbulb,
};

interface ModeSelectorProps {
  current: AiMode;
  onSelect: (mode: AiMode) => void;
  onClose: () => void;
}

export function ModeSelector({ current, onSelect, onClose }: ModeSelectorProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative w-full bg-tekno-surface rounded-t-3xl border-t border-tekno-border p-5 pb-8 safe-bottom animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-tekno-border rounded-full mx-auto mb-5" />
        <h2 className="text-lg font-semibold text-tekno-text mb-1">AI Modu Seç</h2>
        <p className="text-sm text-tekno-textdim mb-5">Yanıtlar seçtiğiniz moda göre özelleştirilir</p>
        <div className="space-y-2.5">
          {AI_MODES.map((mode: ModeInfo) => {
            const Icon = ICONS[mode.icon] ?? Sparkles;
            const isActive = current === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => { onSelect(mode.key); onClose(); }}
                className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'border-tekno-primary bg-tekno-primary/10 glow-primary'
                    : 'border-tekno-border bg-tekno-surface2 hover:border-tekno-primary/40'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-tekno-primary/20' : 'bg-tekno-bg'
                }`}>
                  <Icon size={22} className={isActive ? 'text-tekno-primary' : 'text-tekno-textdim'} />
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
      </div>
    </div>
  );
}
