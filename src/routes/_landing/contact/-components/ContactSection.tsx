import { useState } from "react";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";

const ContactSection = () => {

    const [isSubmitting, setIsSubmitting] = useState(false)


    const handleFormSubmit = async (formData: any) => {
        setIsSubmitting(true);

        try {
            const submissionPromise = new Promise(resolve => setTimeout(resolve, 1500));

            // toast.success('تم إرسال رسالتك بنجاح!', {
            //   duration: 4000,
            //   position: 'top-center',
            //   style: isDarkMode ? { background: '#1e293b', color: '#fff' } : {},
            // });

        } catch (error) {
            console.error(error);
            // toast.error('عذراً، حدث خطأ أثناء الإرسال.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return <div className={`min-h-screen flex items-center justify-center p-4 md:p-10 transition-colors duration-300 dark:bg-[#0f172a] bg-[#f1f5f9]`} dir="rtl">


        <div className="max-w-6xl w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-[#e2e8f0] dark:border-slate-700 flex flex-col lg:flex-row relative theme-transition">

            {/* Left Side: Illustration & Contact Info */}
            <div className="lg:w-[45%] bg-[#fcfdfe] dark:bg-slate-800/80 p-8 md:p-12 flex flex-col justify-between border-l border-[#f1f5f9] dark:border-slate-700 theme-transition">
                <div className="flex-1 flex flex-col items-center justify-center mb-12">
                    <img src="/qalam-contact-illustration.svg" alt="Contact" className="w-full h-auto object-cover" />
                </div>

                <div className="space-y-4">
                    <ContactInfo
                        title="الرقم الموحد"
                        value="920016154"
                        type="phone"
                    />
                    <ContactInfo
                        title="البريد الإلكتروني"
                        value="info@qalam.com"
                        type="email"
                    />
                </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className="lg:w-[55%] p-8 md:p-12 bg-white dark:bg-slate-800 theme-transition">
                <header className="mb-10 text-right">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">تواصل معنا</h1>
                    <p className="text-gray-500 dark:text-slate-400">نحن هنا لمساعدتك، لا تتردد في مراسلتنا في أي وقت.</p>
                </header>

                <ContactForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} />
            </div>
        </div>

    </div>
}

export default ContactSection;