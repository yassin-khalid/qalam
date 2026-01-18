
import React from 'react';
import { Phone, Mail } from 'lucide-react';

interface ContactInfoProps {
    title: string;
    value: string;
    type: 'phone' | 'email';
}

const ContactInfo: React.FC<ContactInfoProps> = ({ title, value, type }) => {
    return (
        <div className="bg-[#f1f9fa] dark:bg-slate-700/40 rounded-2xl p-4 flex items-center justify-between group transition-all hover:bg-[#e0f2f1] dark:hover:bg-slate-700 cursor-pointer border border-transparent dark:border-slate-600">
            <div className="text-right">
                <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-gray-600 dark:text-slate-400 font-medium tracking-wide">{value}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm text-[#00bcd4] group-hover:scale-110 transition-transform">
                {type === 'phone' ? (
                    <Phone className="w-6 h-6" />
                ) : (
                    <Mail className="w-6 h-6" />
                )}
            </div>
        </div>
    );
};

export default ContactInfo;
