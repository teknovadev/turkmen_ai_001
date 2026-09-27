import { Plus, MessageSquare, Trash2, X } from 'lucide-react';
import type { Conversation } from '@/types';
import { AI_MODES } from '@/types';

interface ConversationDrawerProps {
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ConversationDrawer({
  open, conversations, activeId, onSelect, onNew, onDelete, onClose,
}: ConversationDrawerProps) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />}
      <div className={`fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-tekno-surface z-50 flex flex-col transition-transform duration-300 safe-top ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-tekno-border">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-tekno-primary/15 flex items-center justify-center">
              <span className="text-sm font-bold text-gradient">T</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-tekno-text">Türkmen AI</p>
              <p className="text-[10px] text-tekno-textdim tracking-widest uppercase">by TekNova</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-tekno-textdim hover:text-tekno-text hover:bg-tekno-surface2 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-tekno-primary/10 border border-tekno-primary/30 text-tekno-primary font-medium text-sm active:scale-[0.98] transition-transform"
          >
            <Plus size={18} />
            Yeni Sohbet
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          <p className="text-[10px] font-semibold text-tekno-textdim uppercase tracking-wider px-2 mb-1">Sohbet Geçmişi</p>
          {conversations.length === 0 && (
            <p className="text-sm text-tekno-textdim px-2 py-4 text-center">Henüz sohbet yok</p>
          )}
          {conversations.map((conv) => {
            const modeLabel = AI_MODES.find((m) => m.key === conv.mode)?.label ?? 'Genel';
            const isActive = conv.id === activeId;
            return (
              <div
                key={conv.id}
                className={`group flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isActive ? 'bg-tekno-primary/10 border border-tekno-primary/20' : 'hover:bg-tekno-surface2'
                }`}
                onClick={() => onSelect(conv.id)}
              >
                <MessageSquare size={16} className={isActive ? 'text-tekno-primary shrink-0' : 'text-tekno-textdim shrink-0'} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${isActive ? 'text-tekno-text' : 'text-tekno-textdim'}`}>
                    {conv.title ?? 'Yeni Sohbet'}
                  </p>
                  <p className="text-[10px] text-tekno-textdim truncate">{modeLabel}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(conv.id); }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-tekno-textdim hover:text-tekno-error hover:bg-tekno-error/10 transition-colors shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-tekno-border safe-bottom">
          <p className="text-[10px] text-tekno-textdim text-center tracking-wider uppercase">
            TekNova · Türkmen AI v1.0
          </p>
        </div>
      </div>
    </>
  );
}
