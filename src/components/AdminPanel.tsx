import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  User
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LogOut, Save, Image as ImageIcon, Loader2, Lock, Upload, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ADMIN_EMAIL = "abbawork1231@gmail.com";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      if (u && u.email === ADMIN_EMAIL) {
        fetchConfig();
      }
    });
    return () => unsub();
  }, []);

  const fetchConfig = async () => {
    const path = "config/main";
    try {
      const docSnap = await getDoc(doc(db, "config", "main"));
      if (docSnap.exists()) {
        setImageUrl(docSnap.data().expertImageUrl || "");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, path);
    }
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error(err);
    }
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

    const storagePath = `expert-photos/photo_${Date.now()}`;
    try {
      const storageRef = ref(storage, storagePath);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setImageUrl(downloadURL);
      setSuccess("Rasm muvaffaqiyatli yuklandi!");
    } catch (err) {
      setError("Rasm yuklashda xatolik yuz berdi. Storage huquqlarini tekshiring.");
      handleFirestoreError(err, OperationType.UPLOAD, storagePath);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!imageUrl.trim()) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    const path = "config/main";
    try {
      await setDoc(doc(db, "config", "main"), {
        expertImageUrl: imageUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setSuccess("Barcha o'zgarishlar saqlandi!");
    } catch (err) {
      setError("Saqlashda xatolik yuz berdi. Firestore huquqlarini tekshiring.");
      handleFirestoreError(err, OperationType.WRITE, path);
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

  if (!user) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-zinc-900/50 backdrop-blur-xl border-zinc-800 text-white shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center border border-orange-500/20">
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tighter uppercase">Admin Panel</CardTitle>
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Xavfsiz kirish tizimi</p>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Button 
              onClick={handleLogin}
              className="w-full bg-white text-black hover:bg-orange-500 hover:text-white font-bold h-12 transition-all duration-300"
            >
              Google orqali kirish
            </Button>
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-500 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.email !== ADMIN_EMAIL) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="space-y-6 max-w-sm">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tighter uppercase text-white">Kirish taqiqlangan</h1>
            <p className="text-zinc-500 text-sm leading-relaxed">Sizda ushbu panelni boshqarish uchun ruxsat yo'q. Iltimos, admin hisobi bilan kiring.</p>
          </div>
          <Button onClick={() => signOut(auth)} variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-white/5">
            Boshqa hisob bilan kirish
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans selection:bg-orange-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-zinc-800">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-orange-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              Tizim faol
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              Boshqaruv <span className="text-zinc-700">Paneli</span>
            </h1>
            <p className="text-zinc-500 text-sm font-medium">Xush kelibsiz, <span className="text-white">{user.displayName}</span></p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => signOut(auth)}
            className="text-zinc-500 hover:text-white hover:bg-white/5 h-12 px-6 border border-zinc-800/50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Tizimdan chiqish
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-zinc-900/30 backdrop-blur-md border-zinc-800 text-white overflow-hidden">
              <CardHeader className="border-b border-zinc-800/50 bg-white/[0.02] py-4">
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                  Ekspert Vizual Ma'lumotlari
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Rasm yuklash tizimi</label>
                    <span className="text-[10px] font-mono text-zinc-600">MAX 5MB • JPG/PNG/WEBP</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`
                        relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all duration-500 flex flex-col items-center justify-center gap-4
                        ${uploading ? 'bg-orange-500/5 border-orange-500/50' : 'bg-black/40 border-zinc-800 hover:border-orange-500/50 hover:bg-orange-500/[0.02]'}
                      `}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${uploading ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:bg-orange-500 group-hover:text-white'}`}>
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-white">Kompyuterdan yuklash</p>
                        <p className="text-xs text-zinc-500 mt-1">Faylni tanlash uchun bosing</p>
                      </div>
                    </div>

                    <div className="bg-black/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-center space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Yoki URL orqali</label>
                        <Input 
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://..."
                          className="bg-zinc-900 border-zinc-800 focus:border-orange-500 h-11 text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                {imageUrl && (
                  <div className="space-y-4 pt-4 border-t border-zinc-800/50">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Hozirgi ko'rinish</label>
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-800 group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">Jonli ko'rinish faol</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 space-y-4">
                  <Button 
                    onClick={handleSave}
                    disabled={saving || uploading || !imageUrl}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black h-14 rounded-2xl text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all duration-500 disabled:opacity-50 disabled:shadow-none"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    O'zgarishlarni saqlash
                  </Button>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" />
                      {success}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <div className="bg-zinc-900/30 backdrop-blur-md border border-zinc-800 rounded-3xl p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">Tizim Ma'lumotlari</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
                  <span className="text-xs text-zinc-500 font-medium">Status</span>
                  <span className="text-xs font-bold text-green-500 uppercase">Online</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-zinc-800/50">
                  <span className="text-xs text-zinc-500 font-medium">Foydalanuvchi</span>
                  <span className="text-xs font-bold text-white truncate max-w-[120px]">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-xs text-zinc-500 font-medium">Oxirgi yangilanish</span>
                  <span className="text-xs font-bold text-zinc-400">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/10 rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">Muhim Eslatma</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                Rasm yuklangandan so'ng, uni bazada saqlash uchun "O'zgarishlarni saqlash" tugmasini bosishni unutmang. 
                Rasm URL manzili real vaqtda barcha foydalanuvchilar uchun yangilanadi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
