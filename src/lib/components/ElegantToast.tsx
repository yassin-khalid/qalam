import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ToastProps } from '../types/toast';
import QalamLogo from './QalamLogo';

const ElegantToast: React.FC<ToastProps> = ({ message, title, type, t, duration = 5000 }) => {
//   const isDark = document.documentElement.classList.contains('dark');
  
  const config = {
    validation: {
      bg: 'bg-white/95 dark:bg-slate-900/90',
      border: 'border-slate-200 dark:border-cyan-500/20',
      accent: 'bg-[#00B5B5]',
      shadow: 'shadow-xl shadow-slate-200/50 dark:shadow-cyan-500/5',
      defaultTitle: 'تنبيه التدقيق'
    },
    server: {
      bg: 'bg-white/95 dark:bg-slate-900/90',
      border: 'border-slate-200 dark:border-rose-500/20',
      accent: 'bg-rose-500',
      shadow: 'shadow-xl shadow-slate-200/50 dark:shadow-rose-500/5',
      defaultTitle: 'خطأ تقني'
    },
    success: {
      bg: 'bg-white/95 dark:bg-slate-900/90',
      border: 'border-slate-200 dark:border-emerald-500/20',
      accent: 'bg-emerald-500',
      shadow: 'shadow-xl shadow-slate-200/50 dark:shadow-emerald-500/5',
      defaultTitle: 'تم بنجاح'
    },
    warning: {
      bg: 'bg-white/95 dark:bg-slate-900/90',
      border: 'border-slate-200 dark:border-amber-500/20',
      accent: 'bg-amber-500',
      shadow: 'shadow-xl shadow-slate-200/50 dark:shadow-amber-500/5',
      defaultTitle: 'تحذير هام'
    }
  }[type];

//   const getLogoAccent = () => {
//     switch (type) {
//       case 'server': return "#f43f5e";
//       case 'success': return "#10b981";
//       case 'warning': return "#f59e0b";
//       default: return "#00B5B5";
//     }
//   };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className={`
        relative flex flex-col w-full max-w-md mb-4 overflow-hidden 
        rounded-2xl border backdrop-blur-xl ${config.bg} ${config.border} ${config.shadow}
        shadow-2xl group transition-all duration-300 text-right
      `}
    >
      <div className="flex items-start gap-4 p-4 flex-1">
        {/* Logo Container */}
        <div className="shrink-0 relative">
          <QalamLogo 
            className="w-12 h-12" 
          />
          {/* Subtle logo pulse background */}
          <div className={`absolute inset-0 rounded-full blur-lg opacity-20 ${config.accent} scale-75 animate-pulse`} />
        </div>
        
        {/* Text Content */}
        <div className="flex flex-col flex-1 gap-1 mt-1 pr-1">
          <h3 className="text-[0.95rem] font-bold text-[#003049] dark:text-slate-100 tracking-tight leading-none">
            {title || config.defaultTitle}
          </h3>
          <p className="text-[0.8rem] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-1.5 -mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-xl transition-all shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800/50 overflow-hidden">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`h-full ${config.accent} opacity-60`}
        />
      </div>

      {/* Glossy Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent dark:from-white/0" />
    </motion.div>
  );
};

export default ElegantToast;
