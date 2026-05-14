
import React from 'react';
import { useTranslation } from 'react-i18next';

interface StrengthMeterProps {
  score: number;
}

const StrengthMeter: React.FC<StrengthMeterProps> = ({ score }) => {
  const segments = [1, 2, 3, 4];
  const { t } = useTranslation('teacher');

  const getSegmentColor = (index: number) => {
    if (index > score) return 'bg-slate-200 dark:bg-slate-800';
    if (score === 1) return 'bg-rose-500';
    if (score === 2) return 'bg-amber-500';
    if (score === 3) return 'bg-blue-400';
    return 'bg-[#00B5B5]';
  };

  const getStrengthLabel = () => {
    if (score === 0) return t('auth.register.password.strength.start');
    if (score === 1) return t('auth.register.password.strength.veryWeak');
    if (score === 2) return t('auth.register.password.strength.weak');
    if (score === 3) return t('auth.register.password.strength.good');
    return t('auth.register.password.strength.veryStrong');
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 px-1">
        <span>{t('auth.register.password.strength.title')}</span>
        <span className="transition-colors duration-300 uppercase tracking-tighter" style={{ color: score === 4 ? '#00B5B5' : undefined }}>
          {getStrengthLabel()}
        </span>
      </div>
      <div className="flex gap-2 h-2">
        {segments.map((s) => (
          <div
            key={s}
            className={`flex-1 rounded-sm transition-all duration-500 ease-out ${getSegmentColor(s)}`}
            style={{
              opacity: s <= score ? 1 : 0.4
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StrengthMeter;