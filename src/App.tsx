/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight, Instagram, Send, Youtube } from "lucide-react";

export default function App() {
  const points = [
    "Qanday qilib istalgan biznesni qisqa muddatda rivojlantirish usuli.",
    "Mobilografiya orqali istalgan instagram profil daromadini 5x oshirish rejasi.",
    "Mijozlarni va sotuvlarni oshirishni qisqa yo'li.",
  ];

  return (
    <div className="h-screen bg-[#050505] text-white selection:bg-orange-500/30 font-sans overflow-hidden relative flex flex-col">
      {/* Immersive Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-[#1a0f0a] z-10" />
        
        {/* Atmospheric Glows */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.05, 0.1, 0.05] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" 
        />

        <img
          src="https://drive.google.com/uc?export=download&id=1xa7a7O2AlSOfpX9yTsDjGkYHthl1FC-Q"
          alt="Background"
          className="w-full h-full object-cover opacity-10 mix-blend-luminosity"
          referrerPolicy="no-referrer"
        />
      </div>

      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full mb-2"
        >
          <span className="text-[10px] font-bold tracking-[0.2em] text-orange-500 uppercase">Narxi: BEPUL</span>
        </motion.div>

        {/* Headline Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-0.5"
        >
          <span className="text-[9px] uppercase tracking-[0.3em] text-zinc-500 font-bold">
            Eksklyuziv Master-klass
          </span>
          <h1 className="text-xl md:text-3xl font-black tracking-tighter leading-[0.9] uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-600 text-glow">
              MOBILOGRAFIYA
            </span> <br />
            <span className="text-white">ORQALI</span> <span className="text-zinc-500">RIVOJLANTIRISH</span>
          </h1>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative w-full max-w-[220px] aspect-[5/5] mx-auto -mb-3"
        >
          <img
            src="/src/doniyoraka.png"
            alt="Expert"
            className="w-full h-full object-contain drop-shadow-[0_0_40px_rgba(249,115,22,0.4)]"
            onError={(e) => {
              // Fallback to a high-quality placeholder if the link fails
              e.currentTarget.src = "https://drive.google.com/uc?export=download&id=1xa7a7O2AlSOfpX9yTsDjGkYHthl1FC-Q";
            }}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* CTA Button - Smaller and moved down */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center w-full pt-2"
        >
          <Button 
            asChild
            className="w-auto px-8 h-10 text-xs font-black bg-white text-black hover:bg-orange-500 hover:text-white rounded-lg transition-all duration-500 shadow-2xl flex items-center justify-center gap-2 uppercase tracking-tighter overflow-hidden group relative"
          >
            <a href="https://t.me/doniyorfx_bepul_darsbot" target="_blank" rel="noopener noreferrer">
              <span className="relative z-10">Bepul qatnashish</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-500 relative z-10" />
              <div className="absolute inset-0 bg-orange-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </a>
          </Button>
        </motion.div>

        {/* Benefits List - Now at the bottom */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-4 pt-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-zinc-400 whitespace-nowrap">
              Bepul darsda siz:
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent" />
          </div>
          
          <div className="space-y-3 text-left">
            {points.map((point, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="flex items-start gap-4 group"
              >
                <div className="mt-0.5 shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-500" />
                </div>
                <p className="text-sm text-zinc-400 leading-tight group-hover:text-white transition-colors">
                  {point}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
