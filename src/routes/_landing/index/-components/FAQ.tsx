import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQ_KEYS = ['shipping', 'discounts', 'delivery', 'tracking', 'damage'] as const;

const FAQSection: React.FC = () => {
  const { t } = useTranslation('landing');
  const [openId, setOpenId] = useState<string | null>(FAQ_KEYS[0]);

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="py-24 transition-colors duration-700 relative overflow-hidden bg-slate-50 dark:bg-[#0F2F41]">

      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-opacity duration-700 bg-teal-500/5 dark:bg-cyan-500/10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 bg-indigo-500/5 dark:bg-blue-500/10" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">

        {/* Header & Theme Toggle */}
        <div className="flex flex-col items-center mb-16 relative">

          <h2 className="text-4xl md:text-5xl font-black transition-colors duration-500 text-sky-950 dark:text-white">
            {t('faq.heading')}
          </h2>
          <div className="w-24 h-1.5 mx-auto mt-6 rounded-full transition-colors duration-500 bg-teal-500 opacity-60 dark:bg-cyan-400 dark:opacity-80" />
        </div>

        {/* FAQ List */}
        <div className="space-y-5">
          {FAQ_KEYS.map((key) => {
            const isOpen = openId === key;

            return (
              <div
                key={key}
                className={`
                  transition-all duration-500 rounded-3xl border-2 overflow-hidden
                  ${isOpen
                    ? 'border-teal-500 bg-white shadow-xl dark:border-teal-400/50 dark:bg-slate-950 dark:shadow-[0_0_30px_rgba(45,212,191,0.15)]'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm dark:border-white/5 dark:bg-[#113B53]/50 dark:hover:bg-[#113B53] dark:hover:border-white/10'
                  }
                `}
              >
                <button
                  onClick={() => toggleFAQ(key)}
                  className="w-full px-8 py-6 flex items-center justify-between text-right flex-row-reverse gap-6 group"
                >
                  <div className={`
                    shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                    ${isOpen
                      ? 'bg-teal-500 text-white dark:bg-teal-400 dark:text-slate-950'
                      : 'bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-white group-hover:dark:bg-white/20'
                    }
                  `}>
                    {isOpen ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                  </div>
                  <span className={`
                    text-xl font-bold flex-1 transition-colors duration-300
                    ${isOpen
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-sky-950 dark:text-white'
                    }
                  `}>
                    {t(`faq.items.${key}.question`)}
                  </span>
                </button>

                <div className={`
                  transition-all duration-500 ease-in-out px-8
                  ${isOpen ? 'max-h-[500px] opacity-100 pb-8' : 'max-h-0 opacity-0 overflow-hidden'}
                `}>
                  <div className="border-t border-dashed pt-6 border-teal-100 dark:border-white/10">
                    <p className="leading-relaxed text-lg text-right font-medium transition-colors duration-500 text-slate-600 dark:text-slate-300">
                      {t(`faq.items.${key}.answer`)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
