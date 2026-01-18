// import React, { useState, useEffect, useRef } from "react";

// const Testimonials: React.FC = () => {
// const originalReviews = [
//   {
//     name: "عبدالفتاح",
//     role: "طالب ثانوي",
//     text: "منصة قلم غيرت طريقتي في المذاكرة. المعلمين جداً متمكنين والتعامل مع المنصة سهل وسلس.",
//   },
//   {
//     name: "سارة أحمد",
//     role: "طالبة جامعية",
//     text: "أفضل ما في قلم هو جودة المعلمين والسرعة في الحصول على معلم في الوقت اللي أحتاجه.",
//   },
//   {
//     name: "محمد خالد",
//     role: "ولي أمر",
//     text: "سهولة في متابعة مستوى أبنائي واختيار المعلمين المميزين جعلنا نثق في قلم كخيار أول.",
//   },
//   {
//     name: "نورة العتيبي",
//     role: "طالبة لغات",
//     text: "اللغة الإنجليزية أصبحت أسهل بكثير مع المعلمين في قلم. التقنيات المستخدمة في الشرح رائعة ومبتكرة.",
//   },
//   {
//     name: "أحمد الزهراني",
//     role: "طالب علمي",
//     text: "ساعدني المساعد الذكي في حل مسائل الرياضيات الصعبة وفهم القوانين الفيزيائية المعقدة بسرعة.",
//   },
//   {
//     name: "ريم الدوسري",
//     role: "طالبة متوسط",
//     text: "البيئة آمنة جداً وأشعر بالراحة التامة في طرح الأسئلة والتفاعل مع المعلمين في أي وقت.",
//   },
//   {
//     name: "خالد المطيري",
//     role: "معلم فيزياء",
//     text: "كمعلم، المنصة توفر لي واجهة احترافية وسهلة لإدارة دروسي والتواصل مع طلابي بفعالية تامة.",
//   },
//   {
//     name: "ليلى الشهري",
//     role: "طالبة فنون",
//     text: "تنظيم الوقت والدروس في المنصة رائع جداً، وقد ساعدني ذلك على موازنة دراستي وهواياتي بنجاح.",
//   },
//   {
//     name: "فهد العتيبي",
//     role: "طالب ثانوي",
//     text: "كنت أعاني من مادة الكيمياء، لكن بفضل شرح المعلمين المتميز في قلم، حصلت على الدرجة الكاملة.",
//   },
//   {
//     name: "مريم الغامدي",
//     role: "ولي أمر",
//     text: "نظام التقارير الدورية في المنصة ساعدني كثيراً في معرفة نقاط القوة والضعف لدى أطفالي.",
//   },
// ];

//   const reviews = [...originalReviews, ...originalReviews, ...originalReviews];
//   const [currentIndex, setCurrentIndex] = useState(originalReviews.length + 2);
//   const [isAutoPlaying, setIsAutoPlaying] = useState(true);
//   const [visibleCards, setVisibleCards] = useState(3);
//   const [isTransitioning, setIsTransitioning] = useState(true);
//   const timeoutRef = useRef<NodeJS.Timeout | null>(null);

//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth < 1024) setVisibleCards(1);
//       else setVisibleCards(3);
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   useEffect(() => {
//     const threshold = originalReviews.length;
//     if (currentIndex >= threshold * 2) {
//       const timer = setTimeout(() => {
//         setIsTransitioning(false);
//         setCurrentIndex(currentIndex - threshold);
//       }, 700);
//       return () => clearTimeout(timer);
//     }
//     if (currentIndex < threshold) {
//       const timer = setTimeout(() => {
//         setIsTransitioning(false);
//         setCurrentIndex(currentIndex + threshold);
//       }, 700);
//       return () => clearTimeout(timer);
//     }
//     if (!isTransitioning) {
//       const timer = setTimeout(() => setIsTransitioning(true), 50);
//       return () => clearTimeout(timer);
//     }
//   }, [currentIndex, originalReviews.length, isTransitioning]);

//   useEffect(() => {
//     let interval: number | undefined;
//     if (isAutoPlaying) {
//       interval = window.setInterval(() => {
//         setCurrentIndex((prev) => prev + 1);
//       }, 6000);
//     }
//     return () => clearInterval(interval);
//   }, [isAutoPlaying]);

//   const resetAutoPlay = () => {
//     setIsAutoPlaying(false);
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     timeoutRef.current = setTimeout(() => setIsAutoPlaying(true), 15000);
//   };

//   const handleDotClick = (index: number) => {
//     setCurrentIndex(index + originalReviews.length);
//     resetAutoPlay();
//   };

//   const nextSlide = () => {
//     setCurrentIndex((prev) => prev + 1);
//     resetAutoPlay();
//   };
//   const prevSlide = () => {
//     setCurrentIndex((prev) => prev - 1);
//     resetAutoPlay();
//   };

//   const slotWidth = 100 / visibleCards;
//   const translation = 50 - (currentIndex + 0.5) * slotWidth;

//   return (
//     <section className="py-24 bg-zinc-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-500">
//       {/* Subtle Glows */}
//       <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-500/5 dark:bg-teal-500/10 blur-[150px] rounded-full transition-colors duration-500"></div>

//       <div className="max-w-7xl mx-auto relative z-10">
//         <div className="text-center space-y-4 mb-20 px-6">
//           <h2 className="text-4xl md:text-5xl font-black text-sky-950 dark:text-white transition-colors">
//             ماذا يقول طلابنا
//           </h2>
//           <p className="text-zinc-500 dark:text-zinc-400 text-lg md:text-xl font-medium">
//             آراء وتجارب حقيقية من مستخدمي المنصة المتميزين
//           </p>
//         </div>

//         <div className="relative group">
//           <div className="overflow-visible py-16">
//             <div
//               className={`flex ${isTransitioning ? "transition-transform duration-700" : ""}`}
//               style={{
//                 transform: `translateX(${translation}%)`,
//                 width: "100%",
//                 direction: "ltr",
//                 transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
//               }}
//             >
//               {reviews.map((review, i) => {
//                 const isActive = i === currentIndex;
//                 return (
//                   <div
//                     key={i}
//                     dir="rtl"
//                     style={{ flex: `0 0 ${slotWidth}%` }}
//                     className="px-4 flex justify-center items-center"
//                   >
//                     <div
//                       className={`w-full max-w-md p-8 md:p-10 rounded-[48px] transition-all duration-500 border-2 select-none relative ${
//                         isActive
//                           ? "bg-white dark:bg-slate-900 border-teal-500 dark:border-teal-400 scale-110 z-30 shadow-[0px_40px_80px_rgba(20,184,166,0.15)] dark:shadow-[0px_40px_80px_rgba(20,184,166,0.3)] opacity-100 ring-1 ring-teal-500/20"
//                           : "bg-sky-950 dark:bg-slate-900/50 border-transparent dark:border-white/5 opacity-40 scale-90 z-10"
//                       }`}
//                     >
//                       {/* Quote Content */}
//                       <div className="h-32 mb-10 relative">
//                         <p
//                           className={`text-base md:text-lg font-medium leading-relaxed text-center line-clamp-4 transition-colors ${
//                             isActive
//                               ? "text-sky-950 dark:text-white"
//                               : "text-white/80 dark:text-white/30"
//                           }`}
//                         >
//                           "{review.text}"
//                         </p>
//                       </div>

//                       <div className="flex flex-col items-center gap-4">
//                         <div
//                           className={`w-16 h-16 rounded-full overflow-hidden border-4 transition-all duration-500 ${
//                             isActive
//                               ? "border-teal-500 dark:border-teal-400 shadow-lg scale-110"
//                               : "border-white/10 dark:border-white/5"
//                           }`}
//                         >
//                           <img
//                             src={`https://picsum.photos/seed/user${i % originalReviews.length}/150/150`}
//                             alt={review.name}
//                             className="w-full h-full object-cover"
//                             draggable="false"
//                           />
//                         </div>
//                         <div className="text-center">
//                           <h5
//                             className={`font-bold text-xl transition-colors ${
//                               isActive
//                                 ? "text-sky-950 dark:text-white"
//                                 : "text-white dark:text-white/40"
//                             }`}
//                           >
//                             {review.name}
//                           </h5>
//                           <p
//                             className={`text-sm mt-1 font-semibold transition-colors ${
//                               isActive
//                                 ? "text-teal-600 dark:text-teal-400"
//                                 : "text-teal-500/50 dark:text-teal-500/20"
//                             }`}
//                           >
//                             {review.role}
//                           </p>
//                         </div>
//                       </div>

//                       {/* Bottom Accent */}
//                       {isActive && (
//                         <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-teal-500 dark:bg-teal-400 rounded-full blur-[0.5px] transition-colors duration-500"></div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Nav Controls */}
//           <button
//             onClick={prevSlide}
//             className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 z-40 bg-sky-950 dark:bg-slate-800 p-5 rounded-full text-white transition-all shadow-2xl border border-white/10 hover:bg-teal-500 dark:hover:bg-teal-400 dark:hover:text-slate-950 group"
//           >
//             <svg
//               className="w-7 h-7 group-active:translate-x-1 transition-transform"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2.5"
//                 d="M9 5l7 7-7 7"
//               />
//             </svg>
//           </button>
//           <button
//             onClick={nextSlide}
//             className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 z-40 bg-sky-950 dark:bg-slate-800 p-5 rounded-full text-white transition-all shadow-2xl border border-white/10 hover:bg-teal-500 dark:hover:bg-teal-400 dark:hover:text-slate-950 group"
//           >
//             <svg
//               className="w-7 h-7 group-active:-translate-x-1 transition-transform"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2.5"
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* Pagination */}
//         <div className="flex justify-center gap-3 mt-12 flex-wrap max-w-lg mx-auto">
//           {originalReviews.map((_, i) => (
//             <button
//               key={i}
//               onClick={() => handleDotClick(i)}
//               className={`transition-all duration-300 rounded-full h-2.5 ${currentIndex % originalReviews.length === i ? "w-12 bg-teal-500 dark:bg-teal-400" : "w-2.5 bg-zinc-300 dark:bg-white/10 hover:bg-sky-950 dark:hover:bg-white/30"}`}
//               aria-label={`Go to slide ${i + 1}`}
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Testimonials;

import React, { useState, useRef, useEffect } from 'react';
// import { TESTIMONIALS } from '../constants';

const TESTIMONIALS = [
  {
    id: 1,
    name: "عبدالفتاح",
    role: "طالب ثانوي",
    text: "منصة قلم غيرت طريقتي في المذاكرة. المعلمين جداً متمكنين والتعامل مع المنصة سهل وسلس.",
    company: "طالب ثانوي",
  },
  {
    id: 2,
    name: "سارة أحمد",
    role: "طالبة جامعية",
    text: "أفضل ما في قلم هو جودة المعلمين والسرعة في الحصول على معلم في الوقت اللي أحتاجه.",
    company: "طالبة جامعية",
  },
  {
    id: 3,
    name: "محمد خالد",
    role: "ولي أمر",
    text: "سهولة في متابعة مستوى أبنائي واختيار المعلمين المميزين جعلنا نثق في قلم كخيار أول.",
    company: "ولي أمر",
  },
  {
    id: 4,
    name: "نورة العتيبي",
    role: "طالبة لغات",
    text: "اللغة الإنجليزية أصبحت أسهل بكثير مع المعلمين في قلم. التقنيات المستخدمة في الشرح رائعة ومبتكرة.",
    company: "طالبة لغات",
  },
  {
    id: 5,
    name: "أحمد الزهراني",
    role: "طالب علمي",
    text: "ساعدني المساعد الذكي في حل مسائل الرياضيات الصعبة وفهم القوانين الفيزيائية المعقدة بسرعة.",
    company: "طالب علمي",
  },
  {
    id: 6,
    name: "ريم الدوسري",
    role: "طالبة متوسط",
    text: "البيئة آمنة جداً وأشعر بالراحة التامة في طرح الأسئلة والتفاعل مع المعلمين في أي وقت.",
    company: "طالبة متوسط",
  },
  {
    id: 7,
    name: "خالد المطيري",
    role: "معلم فيزياء",
    text: "كمعلم، المنصة توفر لي واجهة احترافية وسهلة لإدارة دروسي والتواصل مع طلابي بفعالية تامة.",
    company: "معلم فيزياء",
  },
  {
    id: 8,
    name: "ليلى الشهري",
    role: "طالبة فنون",
    text: "تنظيم الوقت والدروس في المنصة رائع جداً، وقد ساعدني ذلك على موازنة دراستي وهواياتي بنجاح.",
    company: "طالبة فنون",
  },
  {
    id: 9,
    name: "فهد العتيبي",
    role: "طالب ثانوي",
    text: "كنت أعاني من مادة الكيمياء، لكن بفضل شرح المعلمين المتميز في قلم، حصلت على الدرجة الكاملة.",
    company: "طالب ثانوي",
  },
  {
    id: 10,
    name: "مريم الغامدي",
    role: "ولي أمر",
    text: "نظام التقارير الدورية في المنصة ساعدني كثيراً في معرفة نقاط القوة والضعف لدى أطفالي.",
    company: "ولي أمر",
  },
];
const TestimonialCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Function to determine which card is in the center
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    // const center = container.scrollLeft + container.offsetWidth / 2;

    const cards = container.querySelectorAll('.testimonial-card');
    let closestIndex = 0;
    let minDistance = Infinity;

    cards.forEach((card, index) => {
      const rect = (card as HTMLElement).getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const distance = Math.abs((window.innerWidth / 2) - cardCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  };

  // Scroll to a specific card when clicked
  const scrollToCard = (index: number) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cards = container.querySelectorAll('.testimonial-card');
    const targetCard = cards[index] as HTMLElement;

    if (targetCard) {
      const targetScrollPos = targetCard.offsetLeft - (container.offsetWidth / 2) + (targetCard.offsetWidth / 2);
      container.scrollTo({
        left: targetScrollPos,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Initial centering of the default active card
    setTimeout(() => scrollToCard(activeIndex), 100);
  }, []);

  return (
    <section className="pt-20 bg-linear-to-b from-white to-cyan-500/20 dark:from-cyan-950/50 dark:to-cyan-900/50 overflow-hidden">
      <div className="container mx-auto px-4 mb-16">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-black text-sky-950 dark:text-white mb-4">ماذا يقول طلابنا</h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">آراء وتجارب حقيقية من مستخدمي المنصة</p>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar pb-12 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Left Spacer to allow first card to center */}
        <div className="flex-none w-[calc(50vw-160px)] md:w-[calc(50vw-225px)]" />

        <div className="flex items-center gap-6">
          {TESTIMONIALS.map((item, index) => {
            const isActive = index === activeIndex;

            return (
              <div
                key={item.id}
                onClick={() => scrollToCard(index)}
                className={`
                  testimonial-card shrink-0 snap-center transition-all duration-500 cursor-pointer relative rounded-[40px] p-8 flex flex-col justify-between
                  ${isActive
                    ? 'w-[320px] h-[320px] md:w-[450px] bg-white border-2 border-cyan-400 custom-shadow z-20 scale-100 opacity-100'
                    : 'w-[260px] h-[260px] md:w-[320px] bg-sky-950 z-10 scale-90 opacity-40 hover:opacity-60'
                  }
                `}
              >
                {/* Text Content */}
                <div className="relative">
                  <span className={`text-4xl absolute -top-4 -right-2 leading-none font-serif ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>"</span>
                  <p className={`text-sm leading-relaxed text-right mb-6 line-clamp-4 md:line-clamp-none ${isActive ? 'text-slate-600' : 'text-slate-100 opacity-80'}`}>
                    {item.text}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-end gap-3 mt-auto">
                  <div className="text-right">
                    <h4 className={`font-bold text-sm ${isActive ? 'text-sky-950' : 'text-white'}`}>{item.name}</h4>
                    <p className={`text-xs ${isActive ? 'text-slate-400 font-medium' : 'text-slate-300 opacity-70'}`}>
                      {item.role}, {item.company}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${isActive ? 'border-sky-950 bg-white' : 'border-white bg-transparent'}`}>
                    <svg className={`w-6 h-6 ${isActive ? 'text-sky-950' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Spacer to allow last card to center */}
        <div className="flex-none w-[calc(50vw-160px)] md:w-[calc(50vw-225px)]" />
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-3 mt-4">
        {TESTIMONIALS.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToCard(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${index === activeIndex ? 'w-10 bg-cyan-400 shadow-lg' : 'w-2.5 bg-slate-300'
              }`}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default TestimonialCarousel;