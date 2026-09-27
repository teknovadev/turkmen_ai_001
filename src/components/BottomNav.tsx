import { MessageCircle, MessageSquare, Sparkles, Settings } from 'lucide-react';
import type { NavTab } from '@/types';

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const TABS: { key: NavTab; label: string; icon: typeof MessageCircle }[] = [
  { key: 'chat', label: 'Sohbet', icon: MessageCircle },
  { key: 'conversations', label: 'Geçmiş', icon: MessageSquare },
  { key: 'modes', label: 'Modlar', icon: Sparkles },
  { key: 'settings', label: 'Ayarlar', icon: Settings },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="flex items-center justify-around px-2 pt-1.5 pb-1 safe-bottom glass border-t border-tekno-border">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Icon
              size={22}
              className={isActive ? 'text-tekno-primary' : 'text-tekno-textdim'}
            />
            <span
              className={`text-[10px] font-medium ${isActive ? 'text-tekno-primary' : 'text-tekno-textdim'}`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
