/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import AdminPanel from "@/src/components/AdminPanel";

// Error Boundary Component
interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;

  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "Kutilmagan xatolik yuz berdi.";
      try {
        const errorData = JSON.parse(this.state.error?.message || "{}");
        if (errorData.error) {
          errorMessage = `Firebase xatoligi: ${errorData.error}`;
        }
      } catch {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="space-y-4 max-w-md">
            <h1 className="text-2xl font-bold text-red-500">Xatolik yuz berdi</h1>
            <p className="text-zinc-400">{errorMessage}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Sahifani yangilash
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback image in case Firestore is empty or fails
const DEFAULT_EXPERT_IMAGE = "https://drive.google.com/uc?export=download&id=1xa7a7O2AlSOfpX9yTsDjGkYHthl1FC-Q";

function LandingPage() {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [expertImage, setExpertImage] = useState<string>(() => {
    // Try to get the ultra-fast base64 version first, then the URL, then default
    return localStorage.getItem("expertImageBase64") || 
           localStorage.getItem("expertImageUrl") || 
           DEFAULT_EXPERT_IMAGE;
  });

  // Function to convert image URL to Base64 for instant loading next time
  const cacheImageAsBase64 = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Base64 caching failed:", e);
      return null;
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "main"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newUrl = data.expertImageUrl;
        
        if (newUrl && newUrl !== localStorage.getItem("expertImageUrl")) {
          // Preload and cache
          const img = new Image();
          img.src = newUrl;
          img.onload = async () => {
            setExpertImage(newUrl);
            localStorage.setItem("expertImageUrl", newUrl);
            
            // Aggressive caching: convert to base64 for 0ms delay next time
            const base64 = await cacheImageAsBase64(newUrl);
            if (base64) {
              localStorage.setItem("expertImageBase64", base64);
            }
          };
        }
      }
    }, (error) => {
      console.error("Firestore error:", error);
    });

    return () => unsub();
  }, []);

  // Hidden admin trigger
  const handleBadgeClick = () => {
    setClickCount(prev => {
      if (prev + 1 >= 5) {
        navigate("/admin");
        return 0;
      }
      return prev + 1;
    });
    // Reset count after 2 seconds of inactivity
    setTimeout(() => setClickCount(0), 2000);
  };

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
          src={expertImage}
          alt="Background"
          className="w-full h-full object-cover opacity-10 mix-blend-luminosity blur-sm"
          referrerPolicy="no-referrer"
        />
      </div>

      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-4 space-y-4 max-w-lg mx-auto w-full">
        {/* Top Badge - Hidden Trigger */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleBadgeClick}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full mb-2 cursor-default select-none active:scale-95 transition-transform"
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
          className="relative w-full max-w-[220px] aspect-[5/5] mx-auto -mb-3 flex items-center justify-center"
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            </div>
          )}
          <img
            src={expertImage}
            alt="Expert"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-contain drop-shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onError={(e) => {
              e.currentTarget.src = DEFAULT_EXPERT_IMAGE;
              setImageLoaded(true);
            }}
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* CTA Button */}
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

        {/* Benefits List */}
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

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
