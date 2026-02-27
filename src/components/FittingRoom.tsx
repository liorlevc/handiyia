/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, {
  useState, useRef, useCallback, useEffect,
  forwardRef, useImperativeHandle,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Camera, Sparkles,
  Share2, ShoppingBag, Tag, X,
} from 'lucide-react';
import { CATALOG, type ClothingItem } from '../data/catalog';
import { generateAllLooks, type GeneratedLook } from '../services/imagenService';
import { cn } from '../lib/utils';

// ── Types ────────────────────────────────────────────────────────────────────

type FittingRoomPhase = 'catalog' | 'capturing' | 'generating' | 'results';

export interface FittingRoomHandle {
  /** Called by App.tsx every MediaPipe frame with the current hand landmarks (or null) */
  processLandmarks: (landmarks: any[] | null) => void;
}

interface FittingRoomProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

// ── Gesture helpers ───────────────────────────────────────────────────────────

/** Count how many of the 4 main fingers (index/middle/ring/pinky) are extended */
function countExtendedFingers(lm: any[]): number {
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];
  const wrist = lm[0];
  let count = 0;
  for (let i = 0; i < tips.length; i++) {
    const tip = lm[tips[i]];
    const pip = lm[pips[i]];
    const dTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    const dPip  = Math.hypot(pip.x  - wrist.x, pip.y  - wrist.y);
    if (dTip > dPip) count++;
  }
  return count;
}

/** True when all 4 main fingers are folded (fist) */
function isFistGesture(lm: any[]): boolean {
  return countExtendedFingers(lm) === 0;
}

/**
 * True when thumb points UP and all 4 fingers are folded (thumbs up 👍)
 * - Thumb tip (4) y < Thumb MCP (2) y  →  thumb is above its base (pointing up)
 * - All index/middle/ring/pinky folded
 */
function isThumbsUp(lm: any[]): boolean {
  const thumbTip = lm[4];
  const thumbMcp = lm[2];
  const thumbPointingUp = thumbTip.y < thumbMcp.y - 0.04; // tip clearly above MCP

  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];
  const wrist = lm[0];
  const fingersFolded = tips.every((tip, i) => {
    const dTip = Math.hypot(lm[tip].x - wrist.x, lm[tip].y - wrist.y);
    const dPip = Math.hypot(lm[pips[i]].x - wrist.x, lm[pips[i]].y - wrist.y);
    return dTip < dPip;
  });

  return thumbPointingUp && fingersFolded;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COUNTDOWN_SECONDS    = 3;
const FIST_HOLD_MS         = 2000; // ms to hold fist in catalog before capture
const FINGER_STABLE_FRAMES = 8;    // frames finger count must be stable before switching image
const THUMBS_UP_FRAMES     = 10;   // frames thumbs-up must be stable before exiting results

// ── Component ─────────────────────────────────────────────────────────────────

const FittingRoom = forwardRef<FittingRoomHandle, FittingRoomProps>(
  ({ videoRef }, ref) => {

  const [phase, setPhase]               = useState<FittingRoomPhase>('catalog');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown]       = useState<number | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [generatedLooks, setGeneratedLooks] = useState<GeneratedLook[]>([]);
  const [selectedLookIndex, setSelectedLookIndex] = useState(0);
  const [shareToast, setShareToast]     = useState(false);
  const [thumbsUpProgress, setThumbsUpProgress] = useState(0); // 0‒1 for thumbs-up exit ring
  const [liveFingerCount, setLiveFingerCount]   = useState<number | null>(null);

  // Refs that must be readable inside processLandmarks without stale closures
  const phaseRef           = useRef<FittingRoomPhase>('catalog');
  const captureCanvasRef   = useRef<HTMLCanvasElement>(null);
  const catalogCooldown           = useRef(false);
  const postResetCooldown         = useRef(false); // blocks catalog gestures right after a reset
  const requireOpenHandAfterReset = useRef(false); // user must open hand before fist triggers again
  const fistStartTime      = useRef<number | null>(null); // catalog capture fist
  const thumbsUpBuffer     = useRef<number>(0);           // consecutive thumbs-up frames
  const fingerBuffer       = useRef<number[]>([]);
  const currentItemRef     = useRef<ClothingItem>(CATALOG[0]);
  const resetRef           = useRef<() => void>(() => {});
  const selectedIndexRef   = useRef(0);
  const swipeState         = useRef({ startX: 0, startTime: 0, isTracking: false });

  // Keep refs in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { currentItemRef.current = CATALOG[currentIndex]; }, [currentIndex]);
  useEffect(() => { selectedIndexRef.current = selectedLookIndex; }, [selectedLookIndex]);

  const currentItem = CATALOG[currentIndex];

  // ── Reset ────────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setPhase('catalog');
    setCapturedPhoto(null);
    setGeneratedLooks([]);
    setSelectedLookIndex(0);
    setCountdown(null);
    setThumbsUpProgress(0);
    fistStartTime.current   = null;
    thumbsUpBuffer.current  = 0;
    fingerBuffer.current    = [];
    // Require user to open their hand before fist can trigger capture again
    postResetCooldown.current         = true;
    requireOpenHandAfterReset.current = true;
    setTimeout(() => { postResetCooldown.current = false; }, 500); // short block then open-hand gate takes over
  }, []);

  useEffect(() => { resetRef.current = reset; }, [reset]);

  // ── Catalog swipe ────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (catalogCooldown.current || phaseRef.current !== 'catalog') return;
    catalogCooldown.current = true;
    setCurrentIndex(p => (p + 1) % CATALOG.length);
    setTimeout(() => { catalogCooldown.current = false; }, 800);
  }, []);

  const goPrev = useCallback(() => {
    if (catalogCooldown.current || phaseRef.current !== 'catalog') return;
    catalogCooldown.current = true;
    setCurrentIndex(p => (p - 1 + CATALOG.length) % CATALOG.length);
    setTimeout(() => { catalogCooldown.current = false; }, 800);
  }, []);

  // Stable refs so processLandmarks can call them without stale closures
  const goNextRef = useRef(goNext);
  const goPrevRef = useRef(goPrev);
  useEffect(() => { goNextRef.current = goNext; }, [goNext]);
  useEffect(() => { goPrevRef.current = goPrev; }, [goPrev]);

  // ── Photo capture ────────────────────────────────────────────────────────

  const startCapture = useCallback(() => {
    if (phaseRef.current !== 'catalog') return;
    setPhase('capturing');
    setCountdown(COUNTDOWN_SECONDS);
  }, []);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) { takePhoto(); return; }
    const t = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !captureCanvasRef.current) return;
    const video  = videoRef.current;
    const canvas = captureCanvasRef.current;
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    setCountdown(null);
    startGeneration(dataUrl);
  }, [videoRef]);

  // ── Generation ───────────────────────────────────────────────────────────

  const startGeneration = useCallback(async (photoDataUrl: string) => {
    const item = currentItemRef.current;
    setPhase('generating');
    setGeneratedLooks(item.scenes.map(scene => ({ scene, imageBase64: '', isLoading: true })));
    try {
      await generateAllLooks(photoDataUrl, item, results => setGeneratedLooks([...results]));
    } catch (err) {
      console.error('Generation failed:', err);
    }
    setPhase('results');
    setSelectedLookIndex(0);
  }, []);

  // ── Imperative gesture handler (called from App.tsx every frame) ──────────

  useImperativeHandle(ref, () => ({
    processLandmarks(lm: any[] | null) {
      const phase = phaseRef.current;

      // ── CATALOG: swipe + fist gestures ───────────────────────────────────
      if (phase === 'catalog') {
        if (!lm) {
          swipeState.current.isTracking = false;
          return;
        }
        if (postResetCooldown.current) return;

        const fingerCount = countExtendedFingers(lm);
        const fist        = fingerCount === 0;

        // Gate: after returning from results the user must open their hand
        // (3+ fingers extended) before a fist can trigger capture again
        if (requireOpenHandAfterReset.current) {
          if (fingerCount >= 3) {
            requireOpenHandAfterReset.current = false; // hand is open — ready
          } else {
            return; // still clenched or partially closed — ignore
          }
        }

        if (fist) {
          // Fist = start capture
          swipeState.current.isTracking = false;
          if (!catalogCooldown.current) {
            catalogCooldown.current = true;
            startCapture();
            setTimeout(() => { catalogCooldown.current = false; }, 1200);
          }
        } else {
          // Swipe detection (mirrored: hand moves left in camera = swipe left on screen)
          const currentX = lm[9].x;
          const now = Date.now();

          if (!swipeState.current.isTracking) {
            swipeState.current = { startX: currentX, startTime: now, isTracking: true };
          } else {
            const deltaX    = currentX - swipeState.current.startX;
            const elapsed   = now - swipeState.current.startTime;

            if (elapsed < 500) {
              if (deltaX < -0.15) {          // hand moves left → next item
                goNextRef.current();
                swipeState.current.isTracking = false;
              } else if (deltaX > 0.15) {   // hand moves right → prev item
                goPrevRef.current();
                swipeState.current.isTracking = false;
              }
            } else {
              // Too slow — reset tracking
              swipeState.current = { startX: currentX, startTime: now, isTracking: true };
            }
          }
        }
        return;
      }

      // ── RESULTS: finger count + thumbs-up to exit ────────────────────────
        if (phase === 'results') {
          if (!lm) {
            thumbsUpBuffer.current = 0;
            fingerBuffer.current   = [];
            setThumbsUpProgress(0);
            setLiveFingerCount(null);
            return;
          }

          const thumbUp = isThumbsUp(lm);
          const count   = countExtendedFingers(lm);

          if (thumbUp) {
            // Accumulate stable thumbs-up frames
            thumbsUpBuffer.current = Math.min(thumbsUpBuffer.current + 1, THUMBS_UP_FRAMES);
            const progress = thumbsUpBuffer.current / THUMBS_UP_FRAMES;
            setThumbsUpProgress(progress);
            setLiveFingerCount(null);
            fingerBuffer.current = [];

            if (thumbsUpBuffer.current >= THUMBS_UP_FRAMES) {
              thumbsUpBuffer.current = 0;
              resetRef.current();
            }
          } else {
            // Not thumbs up — decay the buffer and handle finger count
            thumbsUpBuffer.current = Math.max(thumbsUpBuffer.current - 1, 0);
            setThumbsUpProgress(thumbsUpBuffer.current / THUMBS_UP_FRAMES);

            if (count >= 1 && count <= 4) {
              setLiveFingerCount(count);
              // Debounce: need FINGER_STABLE_FRAMES consecutive identical readings
              fingerBuffer.current = [...fingerBuffer.current.slice(-(FINGER_STABLE_FRAMES - 1)), count];
              const buf = fingerBuffer.current;
              if (
                buf.length >= FINGER_STABLE_FRAMES &&
                buf.every(c => c === count) &&
                count - 1 !== selectedIndexRef.current
              ) {
                setSelectedLookIndex(count - 1);
              }
            } else {
              setLiveFingerCount(null);
              fingerBuffer.current = [];
            }
          }
          return;
        }

      // All other phases — nothing to do
    },
  }), [startCapture]);

  // ── Share ────────────────────────────────────────────────────────────────

  const shareLook = useCallback(async () => {
    const look = generatedLooks[selectedLookIndex];
    if (!look?.imageBase64 || look.isLoading) return;
    try {
      const res  = await fetch(look.imageBase64);
      const blob = await res.blob();
      const file = new File([blob], `handiyia-look-${look.scene.id}.jpg`, { type: 'image/jpeg' });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `הלוק שלי עם ${currentItem.nameHe}`,
          text: `${currentItem.nameHe} מ-${currentItem.brand} ב-${look.scene.labelHe} 🔥`,
          files: [file],
        });
      } else {
        const a = document.createElement('a');
        a.href = look.imageBase64;
        a.download = `my-look-${look.scene.id}.jpg`;
        a.click();
      }
      setShareToast(true);
      setTimeout(() => setShareToast(false), 3000);
    } catch (err) {
      console.error('Share failed:', err);
    }
  }, [generatedLooks, selectedLookIndex, currentItem]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden">
      <canvas ref={captureCanvasRef} className="hidden" />

      <AnimatePresence mode="wait">

        {/* ── CATALOG ─────────────────────────────────────────────────────── */}
        {phase === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="w-full h-full flex flex-col items-center justify-center px-8"
          >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center space-x-2 space-x-reverse">
              <ShoppingBag className="w-4 h-4 text-white/40" />
              <span className="text-xs text-white/40 font-mono">{currentIndex + 1} / {CATALOG.length}</span>
            </div>

            <button onClick={goPrev} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full opacity-30 hover:opacity-80 transition-opacity z-20">
              <ChevronRight className="w-6 h-6" />
            </button>
            <button onClick={goNext} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 glass rounded-full opacity-30 hover:opacity-80 transition-opacity z-20">
              <ChevronLeft className="w-6 h-6" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="flex flex-col md:flex-row items-center gap-8 max-w-3xl w-full"
              >
                <div className="relative w-56 h-72 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 glass border border-white/10">
                  <img src={currentItem.imageUrl} alt={currentItem.nameHe} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 bg-black/40 px-2 py-0.5 rounded-full">{currentItem.brand}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start space-y-4 text-right w-full" dir="rtl">
                  <div>
                    <h2 className="text-3xl font-extrabold tracking-tight">{currentItem.nameHe}</h2>
                    <p className="text-white/50 mt-1">{currentItem.descriptionHe}</p>
                  </div>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="text-2xl font-bold text-emerald-400">₪{currentItem.price}</span>
                    <span className="text-xs text-white/30 glass px-2 py-1 rounded-full">{currentItem.colorHe}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentItem.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 rounded-full glass border border-white/10 text-white/50 flex items-center gap-1">
                        <Tag className="w-3 h-3" />{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    {currentItem.scenes.map(s => (
                      <span key={s.id} className="text-xl" title={s.labelHe}>{s.emoji}</span>
                    ))}
                    <span className="text-xs text-white/30 mr-2">סצנות שיוצרו</span>
                  </div>
                  <button
                    onClick={startCapture}
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-white/10"
                  >
                    <Camera className="w-5 h-5" />
                    <span>✊ אגרוף = מדוד וירטואלית</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {CATALOG.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn("rounded-full transition-all duration-300", i === currentIndex ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/20")}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── CAPTURING ──────────────────────────────────────────────────── */}
        {phase === 'capturing' && (
          <motion.div
            key="capturing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            <div className="text-center" dir="rtl">
              <p className="text-white/50 text-sm uppercase tracking-widest mb-2">מצלם עבור</p>
              <h2 className="text-3xl font-bold">{currentItem.nameHe}</h2>
            </div>
            <div className="relative w-40 h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="4" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  transition={{ duration: COUNTDOWN_SECONDS, ease: 'linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  key={countdown}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-extrabold"
                >
                  {countdown}
                </motion.span>
              </div>
            </div>
            <p className="text-white/40 text-sm" dir="rtl">עמוד מול המצלמה בצורה טבעית</p>
            <Camera className="w-8 h-8 text-white/30 animate-pulse" />
          </motion.div>
        )}

        {/* ── GENERATING ─────────────────────────────────────────────────── */}
        {phase === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-10 px-8 max-w-xl mx-auto"
          >
            <div className="text-center" dir="rtl">
              <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-3xl font-bold mb-2">יוצר את הלוקים שלך</h2>
              <p className="text-white/40 text-sm">Gemini AI מייצר תמונות lifestyle...</p>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full" dir="rtl">
              {generatedLooks.map((look, i) => (
                <motion.div
                  key={look.scene.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={cn(
                    "p-4 rounded-2xl glass border transition-all duration-500",
                    look.isLoading ? "border-white/10" : look.error ? "border-red-500/30" : "border-emerald-500/40"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{look.scene.emoji}</span>
                    <div>
                      <p className="font-bold text-sm">{look.scene.labelHe}</p>
                      <p className="text-xs text-white/30">
                        {look.isLoading ? 'מייצר...' : look.error ? '❌ שגיאה' : '✅ מוכן!'}
                      </p>
                    </div>
                    {look.isLoading && <div className="mr-auto w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                  </div>
                </motion.div>
              ))}
            </div>
            {capturedPhoto && (
              <div className="w-20 h-24 rounded-xl overflow-hidden border border-white/20 opacity-60">
                <img src={capturedPhoto} alt="Your photo" className="w-full h-full object-cover" />
              </div>
            )}
          </motion.div>
        )}

        {/* ── RESULTS ────────────────────────────────────────────────────── */}
        {phase === 'results' && generatedLooks.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            {/* Header */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center" dir="rtl">
              <p className="text-white/40 text-xs uppercase tracking-widest">הלוקים שלך עם</p>
              <h3 className="text-lg font-bold">{currentItem.nameHe}</h3>
            </div>

            {/* Back button (click/touch) */}
            <button
              onClick={reset}
              className="absolute top-4 right-4 p-2 glass rounded-xl text-white/50 hover:text-white transition-colors z-30 flex items-center gap-1 text-xs"
            >
              <X className="w-4 h-4" /><span>חזור</span>
            </button>

            {/* Main image */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLookIndex}
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="relative w-64 h-80 md:w-72 md:h-96 rounded-3xl overflow-hidden shadow-2xl border border-white/10 mx-auto"
              >
                {generatedLooks[selectedLookIndex]?.isLoading ? (
                  <div className="w-full h-full glass flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  </div>
                ) : generatedLooks[selectedLookIndex]?.error ? (
                  <div className="w-full h-full glass flex flex-col items-center justify-center gap-3" dir="rtl">
                    <span className="text-3xl">😕</span>
                    <p className="text-sm text-white/40">לא הצלחנו לייצר</p>
                  </div>
                ) : (
                  <img
                    src={generatedLooks[selectedLookIndex]?.imageBase64}
                    alt={generatedLooks[selectedLookIndex]?.scene.labelHe}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-sm glass px-3 py-1 rounded-full font-bold">
                    {generatedLooks[selectedLookIndex]?.scene.emoji} {generatedLooks[selectedLookIndex]?.scene.labelHe}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Thumbnails */}
            <div className="flex gap-3 mt-5 px-4">
              {generatedLooks.map((look, i) => (
                <button
                  key={look.scene.id}
                  onClick={() => setSelectedLookIndex(i)}
                  className={cn(
                    "relative w-14 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0",
                    i === selectedLookIndex ? "border-white scale-110" : "border-white/20 opacity-50 hover:opacity-75"
                  )}
                  style={{ height: 56 }}
                >
                  {/* Finger number badge */}
                  <div className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center z-10 transition-all",
                    liveFingerCount === i + 1
                      ? "bg-white text-black scale-125"
                      : "bg-black/60 text-white/60"
                  )}>
                    {i + 1}
                  </div>
                  {look.isLoading ? (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full border border-white/30 border-t-white animate-spin" />
                    </div>
                  ) : look.imageBase64 ? (
                    <img src={look.imageBase64} alt={look.scene.labelHe} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center text-lg">{look.scene.emoji}</div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center py-0.5 font-bold">
                    {look.scene.emoji}
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-5">
              <button
                onClick={shareLook}
                disabled={generatedLooks[selectedLookIndex]?.isLoading || !!generatedLooks[selectedLookIndex]?.error}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              >
                <Share2 className="w-4 h-4" />שתף
              </button>
            </div>

            {/* Gesture hint */}
            <div className="flex items-center gap-4 mt-4" dir="rtl">
              <span className="text-xs text-white/25 font-mono">אצבעות 1‒4 לבחירת סצנה</span>
              <span className="text-white/20">·</span>
              <span className="text-xs text-white/25 font-mono">👍 אגודל למעלה לחזרה</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── THUMBS UP EXIT PROGRESS OVERLAY ──────────────────────────────── */}
      <AnimatePresence>
        {thumbsUpProgress > 0 && phase === 'results' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-[200]"
          >
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="44" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="44"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 44}`}
                  strokeDashoffset={`${2 * Math.PI * 44 * (1 - thumbsUpProgress)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-5xl select-none">👍</div>
            </div>
            <p className="mt-3 text-sm text-white/60 font-mono">
              {thumbsUpProgress >= 1 ? 'חוזר לקטלוג...' : 'אגודל למעלה — חוזר לקטלוג'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share toast */}
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-medium border border-emerald-500/30 z-[200]"
          >
            ✅ הלוק שותף בהצלחה!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FittingRoom.displayName = 'FittingRoom';
export default FittingRoom;
