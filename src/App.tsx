/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import {
  Clock, Cloud, Newspaper, Calendar, Hand,
  Settings, ChevronLeft, ChevronRight, AlertCircle,
  Music, Mic, MicOff, Play, Pause, ShoppingBag,
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { getNews, getWeather } from './services/geminiService';
import FittingRoom, { type FittingRoomHandle } from './components/FittingRoom';
import { cn } from './lib/utils';

// --- Types ---
type WidgetType = 'clock' | 'weather' | 'news' | 'appointments' | 'music' | 'fitting';

interface Appointment {
  id: string;
  time: string;
  title: string;
}

// --- Components ---

const ClockWidget = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-8xl font-extrabold tracking-tighter font-mono"
      >
        {format(time, 'HH:mm:ss')}
      </motion.div>
      <div className="text-2xl text-white/60 font-light">
        {format(time, 'EEEE, d MMMM yyyy', { locale: he })}
      </div>
    </div>
  );
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);

  useEffect(() => {
    getWeather().then(setWeather);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <Cloud className="w-32 h-32 text-blue-400 animate-pulse" />
      {weather ? (
        <div className="text-center">
          <div className="text-7xl font-bold">{weather.temp}°C</div>
          <div className="text-2xl text-white/70 mt-2">{weather.description}</div>
          <div className="text-lg text-white/40 mt-1">תל אביב</div>
        </div>
      ) : (
        <div className="animate-pulse text-white/20">טוען נתונים...</div>
      )}
    </div>
  );
};

const NewsWidget = () => {
  const [news, setNews] = useState<{ title: string; summary: string }[]>([]);

  useEffect(() => {
    getNews().then(setNews);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-2xl mx-auto">
      <Newspaper className="w-16 h-16 mb-8 text-emerald-400" />
      <div className="space-y-6 w-full">
        {news.length > 0 ? news.map((item, i) => (
          <motion.div
            key={i}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl glass border-l-4 border-emerald-500"
          >
            <h3 className="text-xl font-bold mb-1">{item.title}</h3>
            <p className="text-white/60 text-sm">{item.summary}</p>
          </motion.div>
        )) : (
          <div className="text-center text-white/20">מחפש כותרות...</div>
        )}
      </div>
    </div>
  );
};

const AppointmentsWidget = () => {
  const appointments: Appointment[] = [
    { id: '1', time: '14:00', title: 'פגישת צוות - פיתוח' },
    { id: '2', time: '16:30', title: 'בדיקת התקדמות פרויקט' },
    { id: '3', time: '19:00', title: 'אימון ערב' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 max-w-md mx-auto">
      <Calendar className="w-16 h-16 mb-8 text-purple-400" />
      <div className="space-y-4 w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">הפגישות שלך להיום</h2>
        {appointments.map((apt) => (
          <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl glass">
            <span className="font-mono text-purple-400 font-bold">{apt.time}</span>
            <span className="text-lg">{apt.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MusicWidget = ({ isPlaying }: { isPlaying: boolean }) => (
  <div className="flex flex-col items-center justify-center h-full space-y-8">
    <div className={cn("w-48 h-48 rounded-full border-4 border-white/10 flex items-center justify-center overflow-hidden transition-all duration-700", isPlaying ? "animate-[spin_10s_linear_infinite] glow border-pink-500/50" : "")}>
      <div className="w-12 h-12 bg-black rounded-full absolute z-10 border-2 border-white/20" />
      <img src="https://picsum.photos/seed/music/400/400" alt="Album Art" className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
    </div>
    <div className="text-center">
      <h2 className="text-3xl font-bold">שיר לדוגמה</h2>
      <p className="text-white/50 mt-2">SoundHelix</p>
    </div>
    <div className="flex items-center justify-center space-x-6 space-x-reverse">
      <button className="p-4 rounded-full glass text-white">
        {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
      </button>
    </div>
    <p className="text-sm text-white/30 font-mono">סגור אגרוף כדי לנגן/לעצור</p>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeWidget, setActiveWidget] = useState<number>(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [gestureStatus, setGestureStatus] = useState<string>('מחכה למחווה...');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceCommand, setVoiceCommand] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const gestureState = useRef({ startX: 0, lastX: 0, startTime: 0, isTracking: false });
  const [handPosition, setHandPosition] = useState<{ x: number, y: number } | null>(null);
  const cooldown = useRef<boolean>(false);

  // Ref to FittingRoom imperative handle — receives raw landmarks when active
  const fittingRoomRef = useRef<FittingRoomHandle>(null);
  // Ref that always holds latest activeWidget (avoids stale closures in MediaPipe callback)
  const activeWidgetRef = useRef(activeWidget);
  useEffect(() => { activeWidgetRef.current = activeWidget; }, [activeWidget]);

  const FITTING_ROOM_INDEX = 5;

  // Stable widgets array — FittingRoom is rendered separately to prevent remounting
  const widgets = useMemo(() => [
    { id: 'clock' as WidgetType, component: <ClockWidget />, icon: <Clock /> },
    { id: 'weather' as WidgetType, component: <WeatherWidget />, icon: <Cloud /> },
    { id: 'news' as WidgetType, component: <NewsWidget />, icon: <Newspaper /> },
    { id: 'appointments' as WidgetType, component: <AppointmentsWidget />, icon: <Calendar /> },
    { id: 'music' as WidgetType, component: <MusicWidget isPlaying={isPlaying} />, icon: <Music /> },
    { id: 'fitting' as WidgetType, component: null, icon: <ShoppingBag /> },
  ], [isPlaying]);

  const triggerCooldown = (message: string) => {
    cooldown.current = true;
    setGestureStatus(message);
    setTimeout(() => {
      cooldown.current = false;
      setGestureStatus('מוכן למחווה');
    }, 1200);
  };

  const nextWidget = useCallback(() => {
    if (cooldown.current) return;
    setActiveWidget((prev) => (prev + 1) % widgets.length);
    triggerCooldown('החלקה שמאלה! ⬅️');
  }, [widgets.length]);

  const prevWidget = useCallback(() => {
    if (cooldown.current) return;
    setActiveWidget((prev) => (prev - 1 + widgets.length) % widgets.length);
    triggerCooldown('החלקה ימינה! ➡️');
  }, [widgets.length]);

  const handlePinch = useCallback(() => {
    if (cooldown.current) return;
    setShowCamera(prev => !prev);
    triggerCooldown('צביטה! מחליף תצוגת מצלמה 🤏');
  }, []);

  const handleFist = useCallback(() => {
    if (cooldown.current) return;
    setIsPlaying(prev => !prev);
    triggerCooldown('אגרוף! מנגן/עוצר מוזיקה ✊');
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.error(e));
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      setVoiceCommand(`זיהוי קולי: "${transcript}"`);
      setTimeout(() => setVoiceCommand(''), 3000);

      if (transcript.includes('הבא') || transcript.includes('שמאלה')) nextWidget();
      else if (transcript.includes('קודם') || transcript.includes('ימינה')) prevWidget();
      else if (transcript.includes('נגן') || transcript.includes('פליי')) setIsPlaying(true);
      else if (transcript.includes('עצור') || transcript.includes('פאוז')) setIsPlaying(false);
      else if (transcript.includes('שעון')) setActiveWidget(0);
      else if (transcript.includes('מזג')) setActiveWidget(1);
      else if (transcript.includes('חדשות')) setActiveWidget(2);
      else if (transcript.includes('פגישות') || transcript.includes('תורים')) setActiveWidget(3);
      else if (transcript.includes('מוזיקה')) setActiveWidget(4);
      else if (transcript.includes('לבוש') || transcript.includes('בגדים') || transcript.includes('מראה')) setActiveWidget(5);
    };

    recognition.onend = () => {
      if (isListening) recognition.start();
    };

    if (isListening) recognition.start();
    return () => recognition.stop();
  }, [isListening, nextWidget, prevWidget]);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    let isMounted = true;
    let cameraInstance: Camera | null = null;
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: Results) => {
      if (!isMounted || !canvasRef.current || !videoRef.current) return;

      const canvasCtx = canvasRef.current.getContext('2d');
      if (!canvasCtx) return;

      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        setHandPosition({ x: landmarks[9].x, y: landmarks[9].y });

        if (showCamera) {
          drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 2 });
          drawLandmarks(canvasCtx, landmarks, { color: '#FF0000', lineWidth: 1 });
        }

        // ── FittingRoom handles its own gestures entirely ─────────────────
        if (activeWidgetRef.current === FITTING_ROOM_INDEX) {
          fittingRoomRef.current?.processLandmarks(landmarks);
          canvasCtx.restore();
          return;
        }

        // ── Standard gesture processing for all other widgets ─────────────
        const currentX = landmarks[9].x;
        const now = Date.now();

        // Pinch
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const pinchDistance = Math.sqrt(
          Math.pow(thumbTip.x - indexTip.x, 2) +
          Math.pow(thumbTip.y - indexTip.y, 2)
        );
        const isPinching = pinchDistance < 0.08;

        // Fist
        const isFingerFolded = (tip: any, pip: any, wrist: any) => {
          const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
          const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
          return distTip < distPip;
        };

        const isFist = isFingerFolded(landmarks[8], landmarks[6], landmarks[0]) &&
          isFingerFolded(landmarks[12], landmarks[10], landmarks[0]) &&
          isFingerFolded(landmarks[16], landmarks[14], landmarks[0]) &&
          isFingerFolded(landmarks[20], landmarks[18], landmarks[0]);

        if (isPinching) {
          handlePinch();
          gestureState.current.isTracking = false;
        } else if (isFist) {
          handleFist();
          gestureState.current.isTracking = false;
        } else {
          if (!gestureState.current.isTracking) {
            gestureState.current = { startX: currentX, lastX: currentX, startTime: now, isTracking: true };
          } else {
            const deltaX = currentX - gestureState.current.startX;
            const timeElapsed = now - gestureState.current.startTime;

            if (timeElapsed < 500) {
              if (deltaX < -0.15) {
                nextWidget();
                gestureState.current.isTracking = false;
              } else if (deltaX > 0.15) {
                prevWidget();
                gestureState.current.isTracking = false;
              }
            } else {
              gestureState.current.isTracking = false;
            }
          }
        }
      } else {
        setHandPosition(null);
        gestureState.current.isTracking = false;
        // Notify FittingRoom that no hand is detected
        if (activeWidgetRef.current === FITTING_ROOM_INDEX) {
          fittingRoomRef.current?.processLandmarks(null);
        }
      }
      canvasCtx.restore();
    });

    const startCamera = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!isMounted || !videoRef.current) return;

        cameraInstance = new Camera(videoRef.current, {
          onFrame: async () => {
            if (isMounted && videoRef.current) {
              try {
                await hands.send({ image: videoRef.current });
              } catch (e) {
                console.error("Hands send error:", e);
              }
            }
          },
          width: 640,
          height: 480,
        });

        await cameraInstance.start();
        if (isMounted) setIsCameraReady(true);
      } catch (error) {
        console.error("Camera start error:", error);
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (cameraInstance) cameraInstance.stop();
      hands.close();
    };
  }, [nextWidget, prevWidget, handlePinch, handleFist, showCamera]);

  const widgetLabels: Record<WidgetType, string> = {
    clock: 'שעון',
    weather: 'מזג אוויר',
    news: 'חדשות',
    appointments: 'תורים',
    music: 'מוזיקה',
    fitting: 'מלתחה',
  };

  return (
    <div className="relative w-full h-screen bg-black text-white font-sans overflow-hidden flex flex-col" dir="rtl">

      {/* Hand Tracking Cursor */}
      {handPosition && (
        <motion.div
          className="fixed w-8 h-8 border-2 border-white/30 rounded-full z-[60] pointer-events-none flex items-center justify-center"
          animate={{
            left: `${(1 - handPosition.x) * 100}%`,
            top: `${handPosition.y * 100}%`,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 0.5 }}
        >
          <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
        </motion.div>
      )}

      {/* Header */}
      <header className="p-8 flex justify-between items-center z-10">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center glow">
            <Hand className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Handiyia Mirror</h1>
            <p className="text-xs text-white/40 uppercase tracking-widest font-mono">Gesture Control System v2.0</p>
          </div>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <div className={cn(
            "px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors",
            isCameraReady ? "border-emerald-500/50 text-emerald-400" : "border-red-500/50 text-red-400"
          )}>
            {isCameraReady ? 'מצלמה פעילה' : 'מצלמה בטעינה...'}
          </div>
          <button
            onClick={() => setIsListening(!isListening)}
            className={cn("p-2 rounded-lg transition-colors", isListening ? "bg-red-500/20 text-red-400 border border-red-500/50" : "glass hover:bg-white/10")}
            title="שליטה קולית"
          >
            {isListening ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowCamera(!showCamera)}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex items-center justify-center overflow-hidden">

        {/* Navigation Indicators */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-20">
          {widgets.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: activeWidget === i ? 32 : 8,
                backgroundColor: activeWidget === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)',
              }}
              className="w-1 rounded-full"
            />
          ))}
        </div>

        {/* Swipe hint arrows */}
        {activeWidget !== FITTING_ROOM_INDEX && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 pointer-events-none opacity-20">
            <ChevronRight className="w-12 h-12" />
            <ChevronLeft className="w-12 h-12" />
          </div>
        )}

        {/* Widgets Container */}
        <div className="w-full h-full max-w-5xl px-12">

          {/* FittingRoom — always mounted to preserve state, shown/hidden via CSS */}
          <div className={cn("w-full h-full", activeWidget === FITTING_ROOM_INDEX ? "block" : "hidden")}>
            <FittingRoom ref={fittingRoomRef} videoRef={videoRef} />
          </div>

          {/* Other widgets — animated */}
          {activeWidget !== FITTING_ROOM_INDEX && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWidget}
                initial={{ x: 100, opacity: 0, scale: 0.95 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: -100, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full h-full"
              >
                {widgets[activeWidget].component}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Gesture Status Toast */}
        <motion.div
          key={gestureStatus}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full glass text-sm font-medium tracking-wide border border-white/10"
        >
          {gestureStatus}
        </motion.div>

        {/* Voice Command Toast */}
        <AnimatePresence>
          {voiceCommand && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="absolute bottom-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium tracking-wide border border-blue-500/30"
            >
              {voiceCommand}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Audio */}
      <audio ref={audioRef} src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" loop />

      {/* Camera Feed Overlay */}
      <div className={cn(
        "fixed bottom-8 right-8 w-48 h-36 rounded-2xl overflow-hidden glass border-2 border-white/10 transition-all duration-500 z-50",
        showCamera ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
      )}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ transform: 'scaleX(-1)' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          width={640}
          height={480}
          style={{ transform: 'scaleX(-1)' }}
        />
        <div className="absolute bottom-2 left-2 text-[8px] font-mono text-white/50 bg-black/50 px-1 rounded">
          LIVE FEED
        </div>
      </div>

      {/* Loading Overlay */}
      {!isCameraReady && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-8 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <Hand className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold">ברוכים הבאים ל-Handiyia</h2>
            <p className="text-white/60 leading-relaxed">
              אנא אשר גישה למצלמה. לאחר מכן, החלק את היד ימינה או שמאלה כדי לעבור בין מצבים,
              ובמצב המלתחה — אגרוף יצלם אותך ויייצר לוק מגניב עם AI.
            </p>
            <div className="flex items-center justify-center space-x-2 space-x-reverse text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>מומלץ להשתמש בתאורה טובה</span>
            </div>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      <footer className="p-6 flex justify-center items-center space-x-6 space-x-reverse z-10">
        {widgets.map((w, i) => (
          <button
            key={w.id}
            onClick={() => setActiveWidget(i)}
            className={cn(
              "p-3 rounded-2xl transition-all duration-300 flex flex-col items-center space-y-1",
              activeWidget === i
                ? cn("glass text-white scale-110", w.id === 'fitting' ? 'glow shadow-pink-500/20' : 'glow')
                : "text-white/20 hover:text-white/40"
            )}
          >
            {React.cloneElement(w.icon as React.ReactElement<any>, {
              className: cn("w-5 h-5", w.id === 'fitting' && activeWidget === i ? "text-pink-400" : "")
            })}
            <span className="text-[9px] font-bold uppercase tracking-tighter">
              {widgetLabels[w.id]}
            </span>
          </button>
        ))}
      </footer>
    </div>
  );
}
