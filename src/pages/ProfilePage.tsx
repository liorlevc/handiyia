import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function ProfilePage() {
  const { dispatch } = useApp();
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const openFileInput = () => fileInputRef.current?.click();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPhotoUrl(reader.result as string);
    reader.readAsDataURL(file);
    setPhotoError('');
  };

  const openLiveCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      setStream(s);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      }, 100);
    } catch {
      setPhotoError('לא ניתן לגשת למצלמה. אנא אפשר הרשאות.');
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    setPhotoUrl(canvas.toDataURL('image/jpeg', 0.92));
    closeCamera();
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setShowCamera(false);
  };

  const handleSave = () => {
    if (!photoUrl) {
      setPhotoError('אנא הוסיפו תמונת פרופיל כדי להמשיך');
      return;
    }
    dispatch({
      type: 'SET_PROFILE',
      profile: { name: name || 'אורח', photoUrl },
    });
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#22101c]" dir="rtl">
      {/* Camera overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          <div className="relative flex-1">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute inset-0 camera-overlay" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
              <div className="w-56 h-72 border-2 border-dashed border-[#ee2bad] rounded-2xl flex items-center justify-center">
                <span className="material-symbols-outlined text-white/30" style={{ fontSize: 120 }}>
                  accessibility_new
                </span>
              </div>
            </div>
          </div>
          <div className="p-8 flex items-center justify-around bg-black/80">
            <button
              onClick={closeCamera}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-white/10 text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <button
              onClick={captureFromCamera}
              className="relative flex items-center justify-center w-20 h-20"
            >
              <div className="absolute w-20 h-20 rounded-full border-4 border-white/30" />
              <div className="w-16 h-16 rounded-full bg-white" />
            </button>
            <div className="w-14" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-16 pb-6 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-16 h-16 rounded-full bg-[#ee2bad]/20 border border-[#ee2bad]/40 flex items-center justify-center mx-auto mb-4"
        >
          <span className="material-symbols-outlined text-[#ee2bad]" style={{ fontSize: 32 }}>
            checkroom
          </span>
        </motion.div>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">ברוכים הבאים</h1>
        <p className="font-sans mt-2 text-slate-400 text-base">
          צרו פרופיל כדי להתחיל במדידה וירטואלית
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 pb-10 flex flex-col gap-6">
        {/* Photo picker */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative w-36 h-36 rounded-full overflow-hidden bg-[#2d1525] border-2 border-[#ee2bad]/30 cursor-pointer"
            onClick={openFileInput}
          >
            {photoUrl ? (
              <img src={photoUrl} alt="פרופיל" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <span className="material-symbols-outlined text-slate-500" style={{ fontSize: 40 }}>
                  person
                </span>
                <span className="text-xs text-slate-500">הוסף תמונה</span>
              </div>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#ee2bad] flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white" style={{ fontSize: 16 }}>
                add_a_photo
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={openFileInput}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ee2bad]/10 border border-[#ee2bad]/30 text-[#ee2bad] text-sm font-semibold"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_library</span>
              גלריה
            </button>
            <button
              onClick={openLiveCamera}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ee2bad]/10 border border-[#ee2bad]/30 text-[#ee2bad] text-sm font-semibold"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>photo_camera</span>
              מצלמה
            </button>
          </div>

          {photoError && (
            <p className="text-red-400 text-sm text-center">{photoError}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-2">
          <label className="font-sans text-sm font-semibold text-slate-300">שם (אופציונלי)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="מה שמך?"
            className="w-full h-14 px-4 rounded-2xl bg-[#2d1525] border border-[#ee2bad]/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ee2bad] transition-colors text-base"
          />
        </div>

        {/* Info card */}
        <div className="rounded-2xl bg-[#ee2bad]/10 border border-[#ee2bad]/20 p-4 flex gap-3">
          <span className="material-symbols-outlined text-[#ee2bad] shrink-0" style={{ fontSize: 22 }}>
            info
          </span>
          <p className="text-slate-300 text-sm leading-relaxed">
            התמונה שלכם תשמש ל<strong className="text-white">מדידה וירטואלית</strong> — AI ייצר
            תמונה עם הבגד שבחרתם על גופכם. התמונה נשמרת בדפדפן בלבד.
          </p>
        </div>

        {/* CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          className="w-full h-16 bg-[#ee2bad] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#ee2bad]/30 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>shopping_bag</span>
          התחילו לקנות
        </motion.button>

        {/* Skip */}
        <button
          onClick={() =>
            dispatch({
              type: 'SET_PROFILE',
              profile: { name: 'אורח', photoUrl: '' },
            })
          }
          className="text-center text-sm text-slate-500 underline underline-offset-2"
        >
          דלג על יצירת פרופיל
        </button>
      </div>
    </div>
  );
}
