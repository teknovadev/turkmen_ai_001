import { useState } from 'react';
import { ChevronLeft, Globe, Moon, Info, Shield, Cpu, Check } from 'lucide-react';
import type { AppSettings, AppLanguage, ThemeMode } from '@/types';
import { LANGUAGE_LABELS } from '@/types';

interface SettingsScreenProps {
  settings: AppSettings;
  onLanguageChange: (lang: AppLanguage) => void;
  onThemeChange: (theme: ThemeMode) => void;
  onBack: () => void;
}

export function SettingsScreen({
  settings, onLanguageChange, onThemeChange, onBack,
}: SettingsScreenProps) {
  const [section, setSection] = useState<'main' | 'language' | 'theme' | 'about' | 'privacy' | 'model'>('main');

  if (section !== 'main') {
    return (
      <div className="flex flex-col h-full bg-tekno-bg animate-fade-in">
        <header className="flex items-center gap-3 px-4 py-3 safe-top glass border-b border-tekno-border">
          <button
            onClick={() => setSection('main')}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-tekno-textdim hover:text-tekno-text hover:bg-tekno-surface2 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-[15px] font-semibold text-tekno-text">
            {section === 'language' && 'Dil Seçimi'}
            {section === 'theme' && 'Tema'}
            {section === 'about' && 'Hakkında'}
            {section === 'privacy' && 'Gizlilik'}
            {section === 'model' && 'AI Modeli'}
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          {section === 'language' && (
            <LanguageSection current={settings.language} onSelect={onLanguageChange} />
          )}
          {section === 'theme' && (
            <ThemeSection current={settings.theme} onSelect={onThemeChange} />
          )}
          {section === 'about' && <AboutSection />}
          {section === 'privacy' && <PrivacySection />}
          {section === 'model' && <ModelSection />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-tekno-bg animate-fade-in">
      <header className="flex items-center gap-3 px-4 py-3 safe-top glass border-b border-tekno-border">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-tekno-textdim hover:text-tekno-text hover:bg-tekno-surface2 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-[15px] font-semibold text-tekno-text">Ayarlar</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <SettingsRow
          icon={<Globe size={18} />}
          label="Dil"
          value={LANGUAGE_LABELS[settings.language]}
          onClick={() => setSection('language')}
        />
        <SettingsRow
          icon={<Moon size={18} />}
          label="Tema"
          value={settings.theme === 'dark' ? 'Koyu' : 'Sistem'}
          onClick={() => setSection('theme')}
        />
        <SettingsRow
          icon={<Cpu size={18} />}
          label="AI Modeli"
          value="Gemini 3.8 Flash"
          onClick={() => setSection('model')}
        />
        <SettingsRow
          icon={<Info size={18} />}
          label="Hakkında"
          onClick={() => setSection('about')}
        />
        <SettingsRow
          icon={<Shield size={18} />}
          label="Gizlilik"
          onClick={() => setSection('privacy')}
        />
      </div>
    </div>
  );
}

function SettingsRow({
  icon, label, value, onClick,
}: { icon: React.ReactNode; label: string; value?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-tekno-surface2 border border-tekno-border hover:border-tekno-primary/40 transition-colors active:scale-[0.98]"
    >
      <div className="w-9 h-9 rounded-xl bg-tekno-bg flex items-center justify-center text-tekno-primary shrink-0">
        {icon}
      </div>
      <span className="flex-1 text-left text-[15px] text-tekno-text">{label}</span>
      {value && <span className="text-sm text-tekno-textdim">{value}</span>}
      <ChevronLeft size={16} className="text-tekno-textdim rotate-180" />
    </button>
  );
}

function LanguageSection({ current, onSelect }: { current: AppLanguage; onSelect: (l: AppLanguage) => void }) {
  const options: AppLanguage[] = ['auto', 'tr', 'tk'];
  return (
    <div className="space-y-2.5">
      <p className="text-sm text-tekno-textdim mb-2">
        AI yanıtlarının dilini seçin. "Otomatik" seçildiğinde, yazdığınız dile göre yanıt verilir.
      </p>
      {options.map((lang) => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
            current === lang
              ? 'border-tekno-primary bg-tekno-primary/10'
              : 'border-tekno-border bg-tekno-surface2 hover:border-tekno-primary/40'
          }`}
        >
          <span className={`flex-1 text-left text-[15px] ${current === lang ? 'text-tekno-primary' : 'text-tekno-text'}`}>
            {LANGUAGE_LABELS[lang]}
          </span>
          {current === lang && <Check size={18} className="text-tekno-primary" />}
        </button>
      ))}
    </div>
  );
}

function ThemeSection({ current, onSelect }: { current: ThemeMode; onSelect: (t: ThemeMode) => void }) {
  const options: { key: ThemeMode; label: string }[] = [
    { key: 'dark', label: 'Koyu' },
    { key: 'system', label: 'Sistem Varsayılanı' },
  ];
  return (
    <div className="space-y-2.5">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all ${
            current === opt.key
              ? 'border-tekno-primary bg-tekno-primary/10'
              : 'border-tekno-border bg-tekno-surface2 hover:border-tekno-primary/40'
          }`}
        >
          <span className={`flex-1 text-left text-[15px] ${current === opt.key ? 'text-tekno-primary' : 'text-tekno-text'}`}>
            {opt.label}
          </span>
          {current === opt.key && <Check size={18} className="text-tekno-primary" />}
        </button>
      ))}
    </div>
  );
}

function AboutSection() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center py-6">
        <div className="w-20 h-20 rounded-3xl bg-tekno-primary/10 flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-gradient">T</span>
        </div>
        <h3 className="text-xl font-bold text-tekno-text">Türkmen AI</h3>
        <p className="text-xs text-tekno-textdim tracking-widest uppercase mt-1">by TekNova</p>
        <p className="text-sm text-tekno-textdim mt-3">Sürüm 1.0</p>
      </div>
      <div className="p-4 rounded-2xl bg-tekno-surface2 border border-tekno-border space-y-2">
        <p className="text-sm text-tekno-text">
          Türkmen AI, TekNova tarafından geliştirilen yapay zeka asistanıdır. Türkçe ve Türkmençe dil desteği sunar.
        </p>
        <p className="text-sm text-tekno-textdim">
          Google Gemini altyapısı kullanılarak güvenli bir API katmanı üzerinden çalışır.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-tekno-surface2 border border-tekno-border">
        <h4 className="text-sm font-semibold text-tekno-text mb-2">TekNova</h4>
        <p className="text-sm text-tekno-textdim">
          TekNova, yapay zeka teknolojileri geliştiren bir teknoloji markasıdır.
        </p>
      </div>
    </div>
  );
}

function PrivacySection() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-tekno-surface2 border border-tekno-border space-y-3">
        <h4 className="text-sm font-semibold text-tekno-text">Gizlilik Bilgileri</h4>
        <p className="text-sm text-tekno-textdim leading-relaxed">
          Sohbetleriniz güvenli bir sunucu üzerinden işlenir. API anahtarları hiçbir zaman uygulama içine açıklanmaz.
        </p>
        <p className="text-sm text-tekno-textdim leading-relaxed">
          Sohbet geçmişiniz cihazınıza özel olarak saklanır. Başka cihazlarla paylaşılmaz.
        </p>
        <p className="text-sm text-tekno-textdim leading-relaxed">
          Mesajlarınız yapay zeka modeline yanıt üretmek için gönderilir ve kaydedilir.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-tekno-surface2 border border-tekno-border">
        <h4 className="text-sm font-semibold text-tekno-text mb-2">Veri Güvenliği</h4>
        <p className="text-sm text-tekno-textdim leading-relaxed">
          Tüm iletişim şifreli bağlantı üzerinden yapılır. API anahtarları güvenli ortam değişkenlerinde saklanır.
        </p>
      </div>
    </div>
  );
}

function ModelSection() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-tekno-surface2 border border-tekno-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-tekno-primary/15 flex items-center justify-center">
            <Cpu size={20} className="text-tekno-primary" />
          </div>
          <div>
            <p className="text-[15px] font-semibold text-tekno-text">Gemini 3.8 Flash</p>
            <p className="text-xs text-tekno-textdim">Google AI</p>
          </div>
        </div>
        <p className="text-sm text-tekno-textdim leading-relaxed">
          Mevcut AI modeli: Gemini 3.8 Flash. Bu model hızlı ve verimli yanıtlar için optimize edilmiştir.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-tekno-surface2 border border-tekno-border">
        <p className="text-sm text-tekno-textdim leading-relaxed">
          Gelecekte premium plan ile ek AI modelleri eklenecektir.
        </p>
      </div>
    </div>
  );
}
