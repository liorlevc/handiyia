import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { generateAllLooks } from '../services/imagenService';

// Map common color names (Hebrew/English) → CSS color
const COLOR_MAP: Record<string, string> = {
  שחור: '#111111', black: '#111111',
  לבן: '#f5f5f5', white: '#f5f5f5',
  אפור: '#9ca3af', gray: '#9ca3af', grey: '#9ca3af',
  אדום: '#ef4444', red: '#ef4444',
  כחול: '#3b82f6', blue: '#3b82f6',
  כחול_כהה: '#1e3a5f', navy: '#1e3a5f',
  ירוק: '#22c55e', green: '#22c55e',
  צהוב: '#facc15', yellow: '#facc15',
  כתום: '#f97316', orange: '#f97316',
  סגול: '#a855f7', purple: '#a855f7',
  ורוד: '#ec4899', pink: '#ec4899',
  חום: '#92400e', brown: '#92400e',
  בז: '#d4b483', beige: '#d4b483',
  זית: '#84863a', olive: '#84863a',
  מנטה: '#6ee7b7', mint: '#6ee7b7',
  קרם: '#fef3c7', cream: '#fef3c7',
  קורל: '#fb7185', coral: '#fb7185',
  בורדו: '#7f1d1d', burgundy: '#7f1d1d',
  "ג'ינס": '#4a6fa5', denim: '#4a6fa5',
  פחם: '#374151', charcoal: '#374151',
};

function colorToCss(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, '_');
  return COLOR_MAP[name] ?? COLOR_MAP[key] ?? '#6b7280';
}

export default function ResultsPage() {
  const { state, dispatch } = useApp();
  const { selectedProduct: product, capturedPhoto, generatedLooks, selectedLookIndex } = state;

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[1] ?? product?.sizes?.[0] ?? '');
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] ?? '');
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'original'>('ai');
  const [descExpanded, setDescExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  // Detect missing API key
  const apiKeyMissing = !((import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY));

  // Start generation when page mounts
  useEffect(() => {
    if (!product || !capturedPhoto || generatedLooks.length > 0) return;

    dispatch({ type: 'SET_GENERATING', isGenerating: true });
    const initial = product.scenes.map((s) => ({
      sceneLabel: s.label,
      imageDataUrl: '',
      isLoading: true,
    }));
    dispatch({ type: 'SET_GENERATED_LOOKS', looks: initial });

    generateAllLooks(capturedPhoto, product, (updated) => {
      dispatch({ type: 'SET_GENERATED_LOOKS', looks: updated });
    }).finally(() => {
      dispatch({ type: 'SET_GENERATING', isGenerating: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentLook = generatedLooks[selectedLookIndex];
  const allDone = generatedLooks.length > 0 && generatedLooks.every((l) => !l.isLoading);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    dispatch({
      type: 'ADD_TO_CART',
      item: { product, quantity: 1, size: selectedSize, color: selectedColor },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (!product || !capturedPhoto) {
    return (
      <div className="flex items-center justify-center h-dvh bg-[#22101c] text-white" dir="rtl">
        <div className="text-center px-6">
          <span className="material-symbols-outlined text-slate-500 block mb-4" style={{ fontSize: 60 }}>checkroom</span>
          <p className="text-slate-400 mb-4">לא נבחר פריט. חזרו לקטלוג.</p>
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
            className="px-6 py-2.5 bg-[#ee2bad] text-white rounded-full text-sm font-semibold"
          >
            חזרה לקטלוג
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-[#22101c] overflow-hidden" dir="rtl">

      {/* ── TOP: Image panel ───────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ height: '52vh' }}>

        {/* Header overlay */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 pt-3">
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_forward_ios</span>
          </button>

          {/* AI badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-[#ee2bad]/40">
            <span className="material-symbols-outlined text-[#ee2bad]" style={{ fontSize: 14 }}>auto_awesome</span>
            <span className="font-sans text-[10px] font-bold text-[#ee2bad] uppercase tracking-wider">Virtual Try-On AI</span>
          </div>

          <button
            onClick={() => {
              if (currentLook?.imageDataUrl) {
                const a = document.createElement('a');
                a.href = currentLook.imageDataUrl;
                a.download = `look-${product.id}.jpg`;
                a.click();
              }
            }}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
          </button>
        </div>

        {/* Image */}
        <AnimatePresence mode="wait">
          {currentLook?.isLoading || !currentLook?.imageDataUrl ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#2d1525] flex flex-col items-center justify-center gap-3"
            >
              <img
                src={capturedPhoto}
                alt="צילום"
                className="absolute inset-0 w-full h-full object-cover opacity-15 blur-sm"
              />
              <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
                {apiKeyMissing ? (
                  <>
                    <span className="material-symbols-outlined text-red-400" style={{ fontSize: 40 }}>key_off</span>
                    <p className="font-sans text-red-300 text-sm font-semibold">מפתח API חסר</p>
                    <p className="font-sans text-red-400/70 text-xs leading-relaxed">
                      הגדר את <code className="bg-red-900/40 px-1 rounded">VITE_GEMINI_API_KEY</code> בהגדרות הסביבה של Render ופרס מחדש.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute w-16 h-16 rounded-full bg-[#ee2bad]/25"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                        className="absolute w-10 h-10 rounded-full bg-[#ee2bad]/35"
                      />
                      <span className="material-symbols-outlined text-[#ee2bad]" style={{ fontSize: 32 }}>auto_awesome</span>
                    </div>
                    <p className="font-sans text-white/70 text-sm font-semibold">AI יוצר את הלוק שלך...</p>
                    <p className="font-sans text-white/35 text-xs">אנחנו מלבישים אותך על {currentLook?.sceneLabel}</p>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`look-${selectedLookIndex}-${activeTab}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 cursor-zoom-in"
              onClick={() => setFullscreen(true)}
            >
              <img
                src={activeTab === 'ai' ? currentLook.imageDataUrl : capturedPhoto}
                alt="תוצאה"
                className="w-full h-full object-cover object-top"
              />
              {/* Status badge */}
              <div className="absolute top-14 right-3 glass-panel px-2.5 py-1 rounded-full text-[9px] font-bold text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                {activeTab === 'ai' ? 'לוק AI' : 'צילום מקורי'}
              </div>
              {/* Expand hint */}
              <div className="absolute bottom-12 left-3 glass-panel p-1.5 rounded-full">
                <span className="material-symbols-outlined text-white/70" style={{ fontSize: 16 }}>open_in_full</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare toggle — bottom of image */}
        {!currentLook?.isLoading && currentLook?.imageDataUrl && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center z-20">
            <div className="flex bg-black/50 backdrop-blur-md rounded-full p-1 gap-1 border border-white/10">
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-[#ee2bad] text-white shadow-md'
                    : 'text-white/60'
                }`}
              >
                לוק AI
              </button>
              <button
                onClick={() => setActiveTab('original')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeTab === 'original'
                    ? 'bg-white/20 text-white shadow-md'
                    : 'text-white/60'
                }`}
              >
                צילום שלי
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM: Product info card ──────────────────────────────────────── */}
      <div className="flex-1 bg-[#1a0d16] rounded-t-3xl overflow-y-auto pb-32 border-t border-[#ee2bad]/15">

        {/* Scene selector row */}
        <div className="flex gap-2 px-4 pt-4 pb-3 overflow-x-auto hide-scrollbar">
          {generatedLooks.map((look, i) => (
            <button
              key={i}
              onClick={() => dispatch({ type: 'SET_SELECTED_LOOK', index: i })}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                selectedLookIndex === i
                  ? 'bg-[#ee2bad] border-[#ee2bad] text-white'
                  : 'bg-[#2d1525] border-[#ee2bad]/20 text-slate-400'
              }`}
            >
              {look.isLoading ? (
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-current"
                />
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                  {look.imageDataUrl ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              )}
              {look.sceneLabel}
            </button>
          ))}
        </div>

        <div className="px-4 flex flex-col gap-5">

          {/* Brand + name + price */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-sans text-[11px] text-[#ee2bad] font-black uppercase tracking-widest">{product.brand}</span>
              <h2 className="font-display text-xl font-bold text-white mt-0.5 leading-snug">{product.name}</h2>
              <p className="font-sans text-slate-500 text-xs mt-1">קולקציה 2025</p>
            </div>
            <div className="text-left shrink-0">
              <p className="text-2xl font-black text-[#ee2bad] leading-none">₪{product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="font-sans text-xs text-slate-500 line-through mt-1">
                  ₪{product.originalPrice.toLocaleString()}
                </p>
              )}
              {product.originalPrice && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% הנחה
                </span>
              )}
            </div>
          </div>

          {/* AI fit score — shows when done */}
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-[#ee2bad]/8 border border-[#ee2bad]/20"
            >
              <span className="material-symbols-outlined text-[#ee2bad] shrink-0" style={{ fontSize: 20 }}>
                auto_awesome
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-sans text-xs text-slate-400 font-semibold">התאמת AI</span>
                  <span className="font-sans text-xs text-[#ee2bad] font-black">96% מצוין</span>
                </div>
                <div className="h-1.5 w-full bg-[#2d1525] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '96%' }}
                    transition={{ duration: 1.2, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-[#ee2bad] to-pink-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Size picker */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="font-sans text-sm font-bold text-white">מידה</span>
              <span className="font-sans text-xs text-[#ee2bad] font-semibold">מדריך מידות</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`min-w-[3rem] h-10 px-3 rounded-xl border text-sm font-bold transition-all ${
                    selectedSize === s
                      ? 'bg-[#ee2bad] border-[#ee2bad] text-white shadow-lg shadow-[#ee2bad]/25'
                      : 'bg-[#2d1525] border-[#ee2bad]/20 text-slate-300 hover:border-[#ee2bad]/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          {product.colors && product.colors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-sans text-sm font-bold text-white">
                  צבע: <span className="text-[#ee2bad]">{selectedColor}</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    title={color}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`w-9 h-9 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-[#ee2bad] scale-110 shadow-lg shadow-[#ee2bad]/30'
                          : 'border-white/20 hover:border-white/50'
                      }`}
                      style={{ backgroundColor: colorToCss(color) }}
                    />
                    <span className={`font-sans text-[9px] font-semibold ${selectedColor === color ? 'text-[#ee2bad]' : 'text-slate-500'}`}>
                      {color}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="rounded-2xl bg-[#2d1525]/60 border border-[#ee2bad]/10 p-4">
            <button
              onClick={() => setDescExpanded((v) => !v)}
              className="w-full flex items-center justify-between mb-2"
            >
              <span className="font-sans text-sm font-bold text-white">תיאור המוצר</span>
              <span className="material-symbols-outlined text-slate-400 transition-transform" style={{ fontSize: 18, transform: descExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                expand_more
              </span>
            </button>
            <p className={`font-sans text-slate-400 text-sm leading-relaxed transition-all ${descExpanded ? '' : 'line-clamp-2'}`}>
              {product.description}
            </p>
          </div>

          {/* Stock + delivery badges */}
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-sans text-xs text-green-400 font-semibold">במלאי</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2d1525] border border-[#ee2bad]/15">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 14 }}>local_shipping</span>
              <span className="font-sans text-xs text-slate-400 font-semibold">משלוח חינם</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#2d1525] border border-[#ee2bad]/15">
              <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 14 }}>replay</span>
              <span className="font-sans text-xs text-slate-400 font-semibold">החזרה 30 יום</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── FULLSCREEN IMAGE MODAL ─────────────────────────────────────────── */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
            onClick={() => setFullscreen(false)}
          >
            {/* Close button */}
            <button
              className="absolute top-4 left-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
              onClick={(e) => { e.stopPropagation(); setFullscreen(false); }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
            </button>

            {/* Scene / tab label */}
            <div className="absolute top-4 inset-x-0 flex justify-center pointer-events-none">
              <div className="glass-panel px-4 py-1.5 rounded-full text-xs font-bold text-white">
                {activeTab === 'ai' ? `לוק AI — ${currentLook?.sceneLabel}` : 'צילום מקורי'}
              </div>
            </div>

            {/* Full image */}
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              transition={{ duration: 0.25 }}
              src={activeTab === 'ai' ? currentLook?.imageDataUrl : capturedPhoto}
              alt="fullscreen look"
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Scene switcher at bottom */}
            {generatedLooks.length > 1 && (
              <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 px-4">
                {generatedLooks.map((look, i) => (
                  look.imageDataUrl && (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); dispatch({ type: 'SET_SELECTED_LOOK', index: i }); setActiveTab('ai'); }}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedLookIndex === i ? 'border-[#ee2bad] scale-110' : 'border-white/20'
                      }`}
                    >
                      <img src={look.imageDataUrl} alt={look.sceneLabel} className="w-full h-full object-cover" />
                    </button>
                  )
                ))}
              </div>
            )}

            {/* Download button */}
            {currentLook?.imageDataUrl && (
              <button
                className="absolute top-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  const a = document.createElement('a');
                  a.href = currentLook.imageDataUrl;
                  a.download = `look-${product.id}.jpg`;
                  a.click();
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FIXED BOTTOM: Action buttons ──────────────────────────────────── */}
      <div className="fixed bottom-[80px] inset-x-0 px-4 pt-4 pb-2 bg-gradient-to-t from-[#1a0d16] via-[#1a0d16]/95 to-transparent z-[60]">
        <div className="flex gap-3 max-w-md mx-auto">
          {/* Back */}
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
            className="w-12 h-13 shrink-0 flex items-center justify-center rounded-2xl bg-[#2d1525] border border-[#ee2bad]/20 text-slate-300"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>arrow_forward_ios</span>
          </button>

          {/* Add to cart */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAddToCart}
            className={`flex-1 h-13 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-colors ${
              addedToCart
                ? 'bg-green-500 shadow-green-500/25'
                : 'bg-[#ee2bad] shadow-[#ee2bad]/25'
            }`}
            style={{ height: '3.25rem' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              {addedToCart ? 'check_circle' : 'shopping_bag'}
            </span>
            {addedToCart ? 'נוסף לעגלה! ✓' : 'הוסף לעגלה'}
          </motion.button>

          {/* Cart shortcut */}
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'cart' })}
            className="w-12 shrink-0 flex items-center justify-center rounded-2xl bg-[#2d1525] border border-[#ee2bad]/20"
            style={{ height: '3.25rem' }}
          >
            <span className="material-symbols-outlined text-[#ee2bad]" style={{ fontSize: 22 }}>shopping_cart</span>
          </button>
        </div>
      </div>

    </div>
  );
}
