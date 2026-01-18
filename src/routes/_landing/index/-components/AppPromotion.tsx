// import React from "react";

// const AppPromotion: React.FC = () => {
//   // Recreating a subset of the decorative pattern from Figma for performance and visual fidelity
//   const DecorativePattern = () => (
//     <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden select-none">
//       {[...Array(40)].map((_, i) => (
//         <div
//           key={i}
//           className="absolute bg-sky-50"
//           style={{
//             width: Math.random() * 20 + 2 + "px",
//             height: Math.random() * 30 + 5 + "px",
//             left: Math.random() * 100 + "%",
//             top: Math.random() * 100 + "%",
//             transform: `rotate(${Math.random() * 360}deg)`,
//           }}
//         />
//       ))}
//     </div>
//   );

//   return (
//     <section className="py-24 px-6 md:px-12 lg:px-36 bg-zinc-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
//       <div className="max-w-7xl mx-auto">
//         {/* Main Banner Container */}
//         <div className="bg-sky-950 rounded-[40px] md:rounded-[50px] min-h-[550px] relative overflow-hidden flex flex-col lg:flex-row items-center justify-between shadow-2xl">
//           {/* Recreating Figma Background Accents */}
//           <DecorativePattern />

//           {/* Signature Figma Teal Glow */}
//           <div className="absolute -left-20 top-[10%] w-[600px] h-[500px] bg-teal-500 rounded-full blur-[100px] rotate-[-24deg] opacity-30 pointer-events-none" />

//           {/* Text Content Area */}
//           <div className="relative z-20 lg:w-[45%] p-10 md:p-16 space-y-10 text-center lg:text-right order-2 lg:order-1">
//             <div className="space-y-6">
//               <h2 className="text-4xl md:text-6xl font-black text-white leading-[1.1]">
//                 تطبيق قلم <br />
//                 <span className="text-teal-400">بين يديك الآن</span>
//               </h2>
//               <p className="text-xl text-sky-100/60 max-w-lg lg:ml-0 mx-auto font-medium leading-relaxed">
//                 كل ما تحتاجه للتفوق في مكان واحد. حمل التطبيق الآن وابدأ رحلتك
//                 مع نخبة المعلمين السعوديين.
//               </p>
//             </div>

//             <div className="flex flex-wrap justify-center lg:justify-start gap-4">
//               <button className="bg-white text-sky-950 px-7 py-3.5 rounded-2xl flex items-center gap-3 hover:bg-teal-400 transition-all shadow-xl group hover:-translate-y-1">
//                 <div className="text-right">
//                   <p className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">
//                     Download on the
//                   </p>
//                   <p className="text-lg font-black leading-none">App Store</p>
//                 </div>
//                 <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
//                   <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
//                 </svg>
//               </button>

//               <button className="bg-sky-900/40 border border-white/10 text-white px-7 py-3.5 rounded-2xl flex items-center gap-3 hover:bg-white hover:text-sky-950 transition-all shadow-xl group hover:-translate-y-1">
//                 <div className="text-right">
//                   <p className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">
//                     GET IT ON
//                   </p>
//                   <p className="text-lg font-black leading-none">Google Play</p>
//                 </div>
//                 <svg className="w-7 h-7 fill-current" viewBox="0 0 24 24">
//                   <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L18.66,16.19C19.28,16.55 19.58,17.09 19.58,17.58C19.58,18.07 19.28,18.61 18.66,18.97L5.59,26.5L15,17.09L16.81,15.12M21,12C21,12.5 20.75,13 20.29,13.29L18.05,14.58L14.74,12L18.05,9.42L20.29,10.71C20.75,11 21,11.5 21,12M15,6.91L5.59,2.5L18.66,5.03C19.28,5.39 19.58,5.93 19.58,6.42C19.58,6.91 19.28,7.45 18.66,7.81L16.81,8.88L15,6.91Z" />
//                 </svg>
//               </button>
//             </div>
//           </div>

//           {/* Visual Mockups Area - Enhanced Integration with Image */}
//           <div className="lg:w-[55%] relative h-[450px] md:h-[650px] flex justify-center items-end order-1 lg:order-2 lg:-mr-20 xl:-mr-32">
//             <div className="relative w-full h-full flex items-end justify-center group/mockup">
//               {/* Actual Mockup Image from Figma */}
//               <img
//                 src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000&auto=format&fit=crop"
//                 alt="Qalam App Mockup"
//                 className="w-full h-full object-contain object-bottom translate-y-8 lg:translate-y-16 group-hover/mockup:translate-y-4 lg:group-hover/mockup:translate-y-10 transition-transform duration-700 select-none pointer-events-none drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
//                 style={{
//                   maskImage:
//                     "linear-gradient(to top, black 95%, transparent 100%)",
//                   WebkitMaskImage:
//                     "linear-gradient(to top, black 95%, transparent 100%)",
//                 }}
//               />

//               {/* Floating UI Elements Overlaid on Image */}
//               <div className="absolute left-[15%] top-[30%] w-32 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 z-30 flex items-center justify-center p-3 animate-pulse hidden xl:flex">
//                 <div className="w-full h-full bg-teal-500/20 rounded-lg flex items-center px-2 gap-2">
//                   <div className="w-6 h-6 bg-teal-400 rounded-full flex-shrink-0 shadow-lg"></div>
//                   <div className="w-full h-1.5 bg-white/30 rounded-full"></div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default AppPromotion;

const AppPromotion = () => {
  return (
    <section className="mt-96 mb-24 mx-6 lg:mx-0">
      {/* <div className="bg-sky-950 h-96 rounded-3xl relative">
        <div className="absolute top-0 left-0 w-fit h-fit rounded-3xl">
          <img src="/qalam-why-shape.svg" alt="Qalam Why Shape" />
        </div>
        <div className="absolute w-fit top-1/2 left-0 -translate-y-1/2 rounded-3xl -rotate-90">
          <img src="/qalam-why-shape.svg" alt="Qalam Why Shape" />
        </div>
        <div className="absolute bottom-0 left-0 w-fit h-fit rounded-3xl rotate-180">
          <img src="/qalam-why-shape.svg" alt="Qalam Why Shape" />
        </div>

        <div className="absolute bottom-0 right-0 w-fit h-fit rounded-3xl">
          <img src="/qalam-app-mockup.svg" alt="Qalam App Promotion" />
        </div>
      </div> */}
      <div className="relative max-w-[1440px] w-full h-64 lg:h-96 mx-auto bg-[url('/qalam-app-promotion.svg')] bg-cover bg-center">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative">
            <div className="absolute bottom-14 right-0 w-fit h-fit rounded-3xl z-10">
              <img src="/qalam-app-mockup.svg" alt="Qalam App Promotion" />
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-end text-center lg:text-right gap-12 p-12">
            {/* Main Text Content */}
            <div className="space-y-6 max-w-3xl">
              <p className="text-lg md:text-xl text-[#F2F8FC] leading-relaxed">
                استثمر في مستقبلك، وابدأ رحلتك التعليمية الآن! حمّل تطبيق "قلم" الآن، فهو بوابتك الذكية نحو التعلّم الممتع والفعّال.
              </p>
            </div>

            {/* Action Area (QR and Stores) */}
            <div className="flex flex-col md:flex-row items-center gap-10">

              {/* QR Code Container */}
              <div className="bg-transparent hover:bg-white/10 p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform cursor-pointer">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://example.com/download"
                  alt="Download QR Code"
                  className="w-28 h-28 md:w-36 md:h-36"
                />
              </div>

              {/* Download Buttons */}
              <div className="flex flex-col gap-4 w-full md:w-56">
                {/* App Store */}
                <a
                  href="#"
                  className="flex items-center gap-3 bg-black hover:bg-[#00B2B2] text-white px-6 py-3 rounded-xl transition-all border border-zinc-800 group"
                >
                  <div className="text-3xl">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 384 512">
                      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 21.8-88.5 21.8-11.4 0-51.1-20.8-82.3-20.8-40.2 0-77.5 21.5-92.6 48.3-30.9 54.8-7.9 135.9 22.3 180.7 14.8 21.5 32.7 45.4 55.4 44.6 21.7-.8 29.8-14.2 56.1-14.2 26.2 0 33.7 14.2 56.6 13.8 23.4-.4 38.9-21.5 53.5-42.9 16.9-24.8 23.9-48.8 24.1-50.1-.6-.3-46.6-17.9-46.9-71.3zm-39.7-183c15.8-19.1 26.4-45.6 23.5-72.1-22.9 1-50.7 15.4-67.1 34.6-14.7 17.1-27.5 44.2-24.1 69.8 25.5 2 51.9-13.3 67.7-32.3z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start leading-none text-right">
                    <span className="text-[10px] opacity-70 mb-1">حمل من علي</span>
                    <span className="text-xl font-bold font-sans">App Store</span>
                  </div>
                </a>

                {/* Google Play */}
                <a
                  href="#"
                  className="flex items-center gap-3 bg-black hover:bg-[#00B2B2] text-white px-6 py-3 rounded-xl transition-all border border-zinc-800 group"
                >
                  <div className="text-3xl">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 512 512">
                      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l220.7-121.3-60.7-60.7L47 512l57.6-13z" />
                    </svg>
                  </div>
                  <div className="flex flex-col items-start leading-none text-right">
                    <span className="text-[10px] opacity-70 mb-1">حمل من علي</span>
                    <span className="text-xl font-bold font-sans">Google Play</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section >
  );
};

export default AppPromotion;
