import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function CameraPage() {
  const { state, dispatch } = useApp();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startCamera = useCallback(async (facing: 'user' | 'environment') => {
    setIsReady(false);
    setError('');
    // Stop previous stream
    streamRef.current?.getTracks().forEach((t) => t.stop());
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => setIsReady(true);
      }
    } catch {
      setError('לא ניתן לגשת למצלמה. אנא אפשרו הרשאות מצלמה בדפדפן.');
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [startCamera, facingMode]);

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || countdown !== null) return;
    let count = 3;
    setCountdown(count);

    const tick = () => {
      count--;
      if (count > 0) {
        setCountdown(count);
        countdownRef.current = setTimeout(tick, 1000);
      } else {
        setCountdown(0);
        // Take snapshot
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current!.videoWidth;
        canvas.height = videoRef.current!.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (facingMode === 'user') {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(videoRef.current!, 0, 0);
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        dispatch({ type: 'SET_CAPTURED_PHOTO', photo: dataUrl });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        setCountdown(null);
        dispatch({ type: 'NAVIGATE', page: 'results' });
      }
    };

    countdownRef.current = setTimeout(tick, 1000);
  }, [countdown, facingMode, dispatch]);

  const cancelCountdown = () => {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setCountdown(null);
  };

  const useFromGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch({ type: 'SET_CAPTURED_PHOTO', photo: reader.result as string });
        streamRef.current?.getTracks().forEach((t) => t.stop());
        dispatch({ type: 'NAVIGATE', page: 'results' });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const product = state.selectedProduct;

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-black" dir="rtl">
      {/* Camera feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
      />

      {/* Overlays */}
      <div className="absolute inset-0 camera-overlay" />

      {/* Silhouette guide */}
      {isReady && countdown === null && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.35, scale: 1 }}
            className="w-[45vw] max-w-[200px] h-[70vh] max-h-[500px] border-2 border-dashed border-[#ee2bad] rounded-3xl flex items-center justify-center"
          >
            <span
              className="material-symbols-outlined text-white/20"
              style={{ fontSize: 'min(28vw, 140px)' }}
            >
              accessibility_new
            </span>
          </motion.div>
        </div>
      )}

      {/* Countdown overlay */}
      <AnimatePresence>
        {countdown !== null && countdown > 0 && (
          <motion.div
            key={countdown}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-white font-bold drop-shadow-2xl" style={{ fontSize: '30vw' }}>
              {countdown}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4 pt-safe">
        <button
          onClick={() => {
            cancelCountdown();
            streamRef.current?.getTracks().forEach((t) => t.stop());
            dispatch({ type: 'NAVIGATE', page: 'catalog' });
          }}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 backdrop-blur-md text-white"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="flex-1 text-center">
          <h2 className="font-display text-white text-base font-bold italic">צילום למדידה</h2>
          {product && (
            <p className="font-sans text-[#ee2bad] text-xs font-medium">{product.name} — {product.brand}</p>
          )}
        </div>

        <button
          onClick={flipCamera}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 backdrop-blur-md text-white"
        >
          <span className="material-symbols-outlined">flip_camera_ios</span>
        </button>
      </div>

      {/* Instructions */}
      {isReady && countdown === null && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 flex flex-col items-center pt-4 px-6 text-center"
        >
          <h3 className="font-display text-white text-2xl font-bold drop-shadow-lg">עמדו מול המצלמה</h3>
          <p className="font-sans text-slate-200 text-sm mt-1 drop-shadow-sm">ודאו שכל הגוף נראה בפריים</p>
        </motion.div>
      )}

      {/* Error */}
      {error && (
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 text-center">
          <div className="rounded-2xl bg-red-500/20 border border-red-500/30 p-6">
            <span className="material-symbols-outlined text-red-400 mb-2" style={{ fontSize: 40 }}>
              camera_off
            </span>
            <p className="text-red-300 font-medium">{error}</p>
            <button
              onClick={() => startCamera(facingMode)}
              className="mt-4 px-6 py-2 bg-[#ee2bad] text-white rounded-full text-sm font-semibold"
            >
              נסו שוב
            </button>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Bottom controls */}
      <div className="relative z-10 px-8 pb-12 flex flex-col gap-6">
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          <div className="h-1 w-10 rounded-full bg-white/30" />
          <div className="h-1 w-10 rounded-full bg-[#ee2bad]" />
          <div className="h-1 w-10 rounded-full bg-white/30" />
        </div>

        <div className="flex items-center justify-around">
          {/* Gallery */}
          <button
            onClick={useFromGallery}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>photo_library</span>
            </div>
          </button>

          {/* Shutter */}
          <button
            onClick={countdown !== null ? cancelCountdown : capturePhoto}
            disabled={!isReady && countdown === null}
            className="relative flex items-center justify-center"
          >
            <div className="absolute w-24 h-24 rounded-full border-4 border-white/30" />
            <motion.div
              whileTap={{ scale: 0.9 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                countdown !== null ? 'bg-[#ee2bad]' : 'bg-white'
              }`}
            >
              {countdown !== null ? (
                <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>
                  close
                </span>
              ) : (
                <div className="w-16 h-16 rounded-full border-2 border-black/10" />
              )}
            </motion.div>
          </button>

          {/* Flip camera (mobile extra) */}
          <button
            onClick={flipCamera}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>flip_camera_ios</span>
            </div>
          </button>
        </div>

        <div className="text-center">
          <span className="font-sans text-white/50 text-xs font-bold uppercase tracking-widest">
            {countdown !== null ? `מצלם בעוד ${countdown}...` : 'לחצו לצילום'}
          </span>
        </div>
      </div>
    </div>
  );
}
