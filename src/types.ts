export type AiMode = 'genel' | 'kod' | 'web' | 'icerik' | 'fikir';
export type AppLanguage = 'auto' | 'tr' | 'tk';
export type ThemeMode = 'dark' | 'system';
export type NavTab = 'chat' | 'conversations' | 'modes' | 'settings';

export interface ModeInfo {
  key: AiMode;
  label: string;
  description: string;
  icon: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  mode: AiMode | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  device_id: string;
  title: string | null;
  mode: AiMode;
  created_at: string;
  updated_at: string;
}

export interface AppSettings {
  language: AppLanguage;
  theme: ThemeMode;
}

export const AI_MODES: ModeInfo[] = [
  {
    key: 'genel',
    label: 'Genel Asistan',
    description: 'Genel sorular, bilgi ve günlük yardım',
    icon: 'Sparkles',
  },
  {
    key: 'kod',
    label: 'Yazılım & Kod',
    description: 'Kod yazma, hata ayıklama ve programlama',
    icon: 'Code2',
  },
  {
    key: 'web',
    label: 'Web Tasarım',
    description: 'Modern web tasarımı ve UI/UX önerileri',
    icon: 'Layout',
  },
  {
    key: 'icerik',
    label: 'İçerik Üretimi',
    description: 'Instagram ve TikTok için içerik üretimi',
    icon: 'Camera',
  },
  {
    key: 'fikir',
    label: 'Fikir Üretici',
    description: 'Yaratıcı fikirler ve beyin fırtınası',
    icon: 'Lightbulb',
  },
];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  auto: 'Otomatik',
  tr: 'Türkçe',
  tk: 'Türkmençe',
};
