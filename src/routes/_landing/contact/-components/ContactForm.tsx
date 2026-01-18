


import React, { useState } from 'react';
import { User, Phone, Mail, Users, Settings, MessageSquare, Send, Loader2 } from 'lucide-react';

interface ContactFormProps {
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, isSubmitting }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        userType: '',
        serviceType: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputBase = "w-full px-4 py-4 pr-12 rounded-xl border outline-none transition-all duration-300";
    const lightClasses = "bg-white border-[#e2e8f0] text-gray-700 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500";
    const darkClasses = "dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:ring-teal-500/50 dark:focus:border-teal-500";

    const inputClasses = `${inputBase} ${lightClasses} ${darkClasses}`;
    const iconClasses = "absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 dark:text-slate-500 w-5 h-5 transition-colors duration-300";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="relative group">
                    <input
                        required
                        type="text"
                        name="name"
                        placeholder="الإسم"
                        className={inputClasses}
                        value={formData.name}
                        onChange={handleChange}
                    />
                    <User className={iconClasses} />
                </div>

                {/* Mobile */}
                <div className="relative group">
                    <input
                        required
                        type="tel"
                        name="phone"
                        placeholder="رقم الجوال"
                        className={inputClasses}
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <Phone className={iconClasses} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="relative group">
                    <input
                        required
                        type="email"
                        name="email"
                        placeholder="john@example.com"
                        className={inputClasses}
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <Mail className={iconClasses} />
                </div>

                {/* User Type */}
                <div className="relative group">
                    <select
                        name="userType"
                        className={`${inputClasses} appearance-none cursor-pointer`}
                        value={formData.userType}
                        onChange={handleChange}
                    >
                        <option value="" disabled className="dark:bg-slate-900">نوع المستخدم</option>
                        <option value="individual" className="dark:bg-slate-900">فرد</option>
                        <option value="corporate" className="dark:bg-slate-900">شركة</option>
                        <option value="provider" className="dark:bg-slate-900">مزود خدمة</option>
                    </select>
                    <Users className={iconClasses} />
                </div>
            </div>

            {/* Service Type */}
            <div className="relative group">
                <select
                    name="serviceType"
                    className={`${inputClasses} appearance-none cursor-pointer`}
                    value={formData.serviceType}
                    onChange={handleChange}
                >
                    <option value="" disabled className="dark:bg-slate-900">نوع الخدمة</option>
                    <option value="support" className="dark:bg-slate-900">دعم فني</option>
                    <option value="sales" className="dark:bg-slate-900">مبيعات</option>
                    <option value="billing" className="dark:bg-slate-900">الفواتير</option>
                    <option value="complaint" className="dark:bg-slate-900">شكوى</option>
                </select>
                <Settings className={iconClasses} />
            </div>

            {/* Message */}
            <div className="relative group">
                <textarea
                    required
                    name="message"
                    rows={5}
                    placeholder="اكتب ملاحظاتك"
                    className={`${inputClasses} pr-12 resize-none custom-scrollbar`}
                    value={formData.message}
                    onChange={handleChange}
                ></textarea>
                <MessageSquare className={`${iconClasses} top-8`} />
            </div>

            {/* Submit Button */}
            <button
                disabled={isSubmitting}
                type="submit"
                className="w-full bg-[#00bcd4] hover:bg-[#00acc1] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-100 dark:shadow-teal-900/20 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
                {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                    <Send className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                )}
                <span>ارسل رسالتك</span>
            </button>
        </form>
    );
};

export default ContactForm;
