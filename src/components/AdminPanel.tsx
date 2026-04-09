import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db, storage, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LogOut, Save, Image as ImageIcon, Loader2, Lock, Upload, AlertCircle, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Simple Admin Credentials
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if already logged in (session based for simplicity)
    const session = localStorage.getItem("admin_session");
    if (session === "active") {
      setIsLoggedIn(true);
      fetchConfig();
    }
    setLoading(false);
  }, []);

  const fetchConfig = async () => {
    const path = "config/main";
    try {
      const docSnap = await getDoc(doc(db, "config", "main"));
      if (docSnap.exists()) {
        setImageUrl(docSnap.data().expertImageUrl || "");
      }
    } catch (err) {
      console.error("Config yuklashda xato:", err);
      // Don't block the UI, just log it
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // User requested "login: admin, parol: admin"
    if (loginInput === "admin" && passwordInput === "admin") {
      setIsLoggedIn(true);
      localStorage.setItem("admin_session", "active");
      fetchConfig();
    } else {
      setError("Login yoki parol noto'g'ri!");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("admin_session");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Faqat rasm yuklash mumkin!");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Rasm hajmi 5MB dan oshmasligi kerak!");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    const storagePath = `expert-photos/photo_${Date.now()}`;
    try {
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (err) => {
          setError("Rasm yuklashda xatolik! Firebase Storage-da 'Get Started' tugmasi bosilganini tekshiring.");
          console.error(err);
          setUploading(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUrl(downloadURL);
          setSuccess("Rasm muvaffaqiyatli yuklandi!");
          setUploading(false);
        }
      );
    } catch (err) {
      setError("Kutilmagan xatolik yuz berdi.");
      console.error(err);
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl.trim()) {
      setError("Rasm URL manzili bo'sh bo'lishi mumkin emas!");
      return;
    }
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await setDoc(doc(db, "config", "main"), {
        expertImageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSuccess("Ma'lumotlar muvaffaqiyatli saqlandi!");
      // Update local storage for immediate landing page update
      localStorage.setItem("expertImageUrl", imageUrl);
    } catch (err) {
      setError("Saqlashda xatolik! Firestore qoidalarini tekshiring.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="bg-zinc-900/50 backdrop-blur-2xl border-zinc-800 text-white shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500" />
            <CardHeader className="text-center space-y-4 pt-10">
              <div className="mx-auto w-20 h-20 bg-orange-500/10 rounded-3xl flex items-center justify-center border border-orange-500/20 shadow-[0_0_40px_rgba(249,115,22,0.1)]">
                <ShieldCheck className="w-10 h-10 text-orange-500" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">Admin Panel</CardTitle>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Tizimga kirish</p>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Login</label>
                  <Input 
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    placeholder="admin"
                    className="bg-black/50 border-zinc-800 focus:border-orange-500 h-14 rounded-xl text-sm transition-all duration-300"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Parol</label>
                  <Input 
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="bg-black/50 border-zinc-800 focus:border-orange-500 h-14 rounded-xl text-sm transition-all duration-300"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black h-14 rounded-xl uppercase tracking-[0.2em] text-xs shadow-lg shadow-orange-500/20 transition-all duration-300 active:scale-[0.98]"
                >
                  Kirish
                </Button>
              </form>
              
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[11px] font-bold uppercase tracking-wider"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-orange-500/30">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-zinc-800/50">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-orange-500 text-[10px] font-black uppercase tracking-[0.4em]">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
              Boshqaruv Faol
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none italic">
              Admin <span className="text-zinc-800 not-italic">Panel</span>
            </h1>
            <p className="text-zinc-500 text-sm font-medium tracking-wide">Xush kelibsiz, <span className="text-white">Administrator</span></p>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-zinc-500 hover:text-white hover:bg-white/5 h-14 px-8 border border-zinc-800/50 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all duration-300"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Tizimdan chiqish
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <Card className="bg-zinc-900/20 backdrop-blur-xl border-zinc-800 text-white overflow-hidden rounded-[2rem] shadow-2xl">
              <CardHeader className="border-b border-zinc-800/50 bg-white/[0.01] p-8">
                <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-400">
                  <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                  </div>
                  Ekspert Vizual Sozlamalari
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-10">
                {/* Upload Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Rasm yuklash</label>
                    <span className="text-[10px] font-mono text-zinc-700 bg-zinc-800/50 px-2 py-1 rounded">5MB LIMIT</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                      onClick={() => !uploading && fileInputRef.current?.click()}
                      className={`
                        relative group cursor-pointer border-2 border-dashed rounded-[2rem] p-10 transition-all duration-700 flex flex-col items-center justify-center gap-5 overflow-hidden
                        ${uploading ? 'bg-orange-500/5 border-orange-500/50' : 'bg-black/40 border-zinc-800 hover:border-orange-500/40 hover:bg-orange-500/[0.02]'}
                      `}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 ${uploading ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:bg-orange-500 group-hover:text-white shadow-xl'}`}>
                        {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                      </div>
                      
                      <div className="text-center space-y-1">
                        <p className="text-sm font-black uppercase tracking-wider text-white">Kompyuterdan tanlash</p>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">JPG, PNG yoki WEBP</p>
                      </div>

                      {uploading && (
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-10 space-y-6">
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-white/5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${uploadProgress}%` }}
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]"
                            />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 animate-pulse">
                              Yuklanmoqda
                            </p>
                            <p className="text-2xl font-black italic text-white">
                              {Math.round(uploadProgress)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-black/40 border border-zinc-800 rounded-[2rem] p-8 flex flex-col justify-center space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">Yoki URL manzilini kiriting</label>
                        <Input 
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-900/50 border-zinc-800 focus:border-orange-500 h-14 rounded-xl text-xs font-mono transition-all duration-300"
                        />
                      </div>
                      <p className="text-[10px] text-zinc-600 font-medium leading-relaxed italic">
                        Maslahat: Google Drive yoki boshqa ochiq manbalardan rasm linkini qo'yishingiz ham mumkin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <AnimatePresence>
                  {imageUrl && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-6 pt-6 border-t border-zinc-800/50"
                    >
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Jonli ko'rinish</label>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-green-500/80">Tayyor</span>
                        </div>
                      </div>
                      <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden bg-black border border-zinc-800 group shadow-2xl">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-10">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500">Vizualizatsiya</p>
                            <p className="text-xs text-zinc-400 font-medium max-w-xs">Ushbu rasm asosiy sahifada ekspert bo'limida ko'rinadi.</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="pt-6 space-y-6">
                  <Button 
                    onClick={handleSave}
                    disabled={saving || uploading || !imageUrl}
                    className="w-full bg-white hover:bg-orange-500 text-black hover:text-white font-black h-16 rounded-2xl text-sm uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 disabled:opacity-30 active:scale-[0.98] group"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3 transition-transform group-hover:scale-110" />}
                    O'zgarishlarni saqlash
                  </Button>

                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 text-red-500 text-xs font-bold uppercase tracking-wider"
                      >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4 text-green-500 text-xs font-bold uppercase tracking-wider"
                      >
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        {success}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-10">
            <div className="bg-zinc-900/20 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Tizim Holati
              </h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/30">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Server</span>
                  <span className="text-[10px] font-black text-green-500 uppercase tracking-widest bg-green-500/10 px-2 py-1 rounded">Online</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800/30">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Xavfsizlik</span>
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">SSL Faol</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Vaqt</span>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl group-hover:bg-orange-500/10 transition-all duration-700" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 bg-orange-500/20 rounded-2xl flex items-center justify-center border border-orange-500/20">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Yo'riqnoma</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium italic">
                "Rasm yuklashda muammo bo'lsa, avval Firebase konsolida Storage bo'limini yoqing. 
                Keyin rasmni tanlang va 'Saqlash' tugmasini bosing. Tizim hammasini avtomatik bajaradi."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
