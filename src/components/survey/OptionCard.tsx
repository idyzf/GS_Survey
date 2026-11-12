import type { ReactNode } from 'react';

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  compact?: boolean;
  children: ReactNode;
}

/** Clickable answer card with the glowing "selected" border. */
export function OptionCard({ selected, onSelect, compact = false, children }: OptionCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`group relative ${compact ? 'p-3.5' : 'p-4'} rounded-xl border text-left cursor-pointer transition-all ${
        selected
          ? 'glow-card-active bg-[#121824] border-cyan-400 shadow-md shadow-cyan-500/20'
          : 'bg-[#0a0d14] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      {children}
    </div>
  );
}

interface DetailInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  compact?: boolean;
}

/** Free-text field shown inside a selected "Other" option. Clicks don't toggle the card. */
export function DetailInput({ value, onChange, placeholder, label, compact = false }: DetailInputProps) {
  return (
    <div className={compact ? 'mt-2' : 'mt-3 pt-3 border-t border-slate-800'} onClick={(e) => e.stopPropagation()}>
      {label && <label className="block text-[11px] font-mono text-slate-400 mb-1">{label}</label>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full text-xs bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 ${
          compact ? 'px-2.5 py-1.5 rounded-md' : 'px-3 py-2 rounded-lg'
        }`}
      />
    </div>
  );
}
