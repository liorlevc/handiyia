import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { generateAllLooks } from '../services/imagenService';

export default function ResultsPage() {
  const { state, dispatch } = useApp();
  const { selectedProduct: product, capturedPhoto, generatedLooks, selectedLookIndex } = state;
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[1] ?? '');
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'original'>('photo');

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

    generateAllLooks(
      capturedPhoto,
      product,
      (updated) => {
        dispatch({ type: 'SET_GENERATED_LOOKS', looks: updated });
      }
    ).finally(() => {
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
      item: {
        product,
        quantity: 1,
        size: selectedSize,
        color: product.colors[0],
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (!product || !capturedPhoto) {
    return (
      <div className="flex items-center justify-center h-dvh bg-[#22101c] text-white" dir="rtl">
        <div className="text-center">
          <span className="material-symbols-outlined text-slate-500 mb-4" style={{ fontSize: 60 }}>
            checkroom
          </span>
          <p className="text-slate-400">לא נבחר פריט. חזרו לקטלוג.</p>
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
            className="mt-4 px-6 py-2 bg-[#ee2bad] text-white rounded-full text-sm font-semibold"
          >
            חזרה לקטלוג
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-dvh bg-[#22101c]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#22101c]/90 backdrop-blur-md border-b border-[#ee2bad]/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
          className="p-2 hover:bg-[#ee2bad]/10 rounded-full"
        >
          <span className="material-symbols-outlined text-slate-300">arrow_forward_ios</span>
        </button>
        <h1 className="font-display text-base font-bold text-white italic">תוצאת מדידה</h1>
        <button
          onClick={() => {
            if (currentLook?.imageDataUrl) {
              const a = document.createElement('a');
              a.href = currentLook.imageDataUrl;
              a.download = `look-${product.id}.jpg`;
              a.click();
            }
          }}
          className="p-2 hover:bg-[#ee2bad]/10 rounded-full"
        >
          <span className="material-symbols-outlined text-slate-300">share</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-56">
        {/* AI badge */}
        <div className="flex justify-center my-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ee2bad]/20 border border-[#ee2bad]/30">
            <span className="material-symbols-outlined text-[#ee2bad]" style={{ fontSize: 16 }}>
              auto_awesome
            </span>
            <span className="text-xs font-semibold text-[#ee2bad] uppercase tracking-wider">
              מעובד בטכנולוגיית AI
            </span>
          </div>
        </div>

        {/* Main result image */}
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-[#ee2bad]/20 bg-[#2d1525]">
          <AnimatePresence mode="wait">
            {currentLook?.isLoading || !currentLook?.imageDataUrl ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              >
                {/* Animated pulse rings */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute w-24 h-24 rounded-full bg-[#ee2bad]/20"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.2, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    className="absolute w-16 h-16 rounded-full bg-[#ee2bad]/30"
                  />
                  <span
                    className="material-symbols-outlined text-[#ee2bad]"
                    style={{ fontSize: 40 }}
                  >
                    auto_awesome
                  </span>
                </div>
                <p className="font-sans text-white/60 text-sm font-medium">AI יוצר את הלוק שלך...</p>
                {/* Show captured photo as placeholder */}
                <img
                  src={capturedPhoto}
                  alt="צילום"
                  className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                />
              </motion.div>
            ) : (
              <motion.div
                key={`look-${selectedLookIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0"
              >
                {/* Toggle: result vs original */}
                <img
                  src={activeTab === 'photo' ? currentLook.imageDataUrl : capturedPhoto}
                  alt="תוצאה"
                  className="w-full h-full object-cover"
                />

                {/* Live badge */}
                <div className="absolute top-3 right-3 glass-panel px-3 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  {activeTab === 'photo' ? 'לוק AI' : 'צילום מקורי'}
                </div>

                {/* Scan line */}
                <div className="absolute inset-x-0 h-px bg-[#ee2bad]/40 shadow-[0_0_12px_#ee2bad] top-1/2" />

                {/* Toggle compare button */}
                <button
                  onClick={() => setActiveTab((t) => (t === 'photo' ? 'original' : 'photo'))}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-5 py-2 rounded-full text-xs font-semibold text-white border border-[#ee2bad]/40 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>compare</span>
                  {activeTab === 'photo' ? 'ראה צילום מקורי' : 'ראה לוק AI'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scene selector */}
        {generatedLooks.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto hide-scrollbar pb-1">
            {generatedLooks.map((look, i) => (
              <button
                key={i}
                onClick={() => dispatch({ type: 'SET_SELECTED_LOOK', index: i })}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                  selectedLookIndex === i
                    ? 'bg-[#ee2bad]/20 border border-[#ee2bad]/60'
                    : 'bg-[#2d1525] border border-transparent'
                }`}
              >
                {look.isLoading ? (
                  <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-12 h-12 rounded-xl bg-[#ee2bad]/20"
                  />
                ) : look.imageDataUrl ? (
                  <img
                    src={look.imageDataUrl}
                    alt={look.sceneLabel}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 20 }}>
                      broken_image
                    </span>
                  </div>
                )}
                <span className={`text-[10px] font-semibold ${selectedLookIndex === i ? 'text-[#ee2bad]' : 'text-slate-500'}`}>
                  {look.sceneLabel}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Product details */}
        <div className="mt-5 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-[#ee2bad] font-bold">{product.brand}</span>
              <h2 className="font-display text-xl font-bold text-white mt-0.5">{product.name}</h2>
              <p className="font-sans text-slate-400 text-xs mt-1">קולקציית אביב-קיץ 2025</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-black text-[#ee2bad]">₪{product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-xs text-slate-500 line-through text-left">
                  ₪{product.originalPrice.toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* AI fit score */}
          {allDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 p-4 rounded-2xl bg-[#ee2bad]/5 border border-[#ee2bad]/15"
            >
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">התאמת בד ומידות AI</span>
                <span className="text-[#ee2bad]">מצוין (96%)</span>
              </div>
              <div className="h-1.5 w-full bg-[#2d1525] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '96%' }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="h-full bg-[#ee2bad] rounded-full"
                />
              </div>
            </motion.div>
          )}

          {/* Specs */}
          <div className="flex gap-3">
            <div className="flex-1 p-3 rounded-2xl border border-[#ee2bad]/15 bg-[#2d1525]/50 flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">מידה</span>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="bg-transparent text-white text-sm font-bold text-center appearance-none cursor-pointer w-full"
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s} className="bg-[#22101c]">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 p-3 rounded-2xl border border-[#ee2bad]/15 bg-[#2d1525]/50 flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">צבע</span>
              <div
                className="w-5 h-5 rounded-full border border-white/20 mt-0.5"
                style={{ backgroundColor: '#ee2bad' }}
              />
            </div>
            <div className="flex-1 p-3 rounded-2xl border border-[#ee2bad]/15 bg-[#2d1525]/50 flex flex-col items-center gap-1">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider">מלאי</span>
              <span className="text-green-400 text-sm font-bold">זמין</span>
            </div>
          </div>

          {/* Description */}
          <p className="font-sans text-slate-400 text-sm leading-relaxed">{product.description}</p>
        </div>
      </main>

      {/* Sticky action buttons — sits ABOVE the BottomNav (z-50) */}
      <div className="fixed bottom-[80px] inset-x-0 px-4 pb-3 pt-6 bg-gradient-to-t from-[#22101c] via-[#22101c]/90 to-transparent z-[60]">
        <div className="flex flex-col gap-2 max-w-md mx-auto">
          {/* Add to cart + view cart row */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              className={`flex-[2] h-14 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-2 transition-colors ${
                addedToCart
                  ? 'bg-green-500 shadow-green-500/30'
                  : 'bg-[#ee2bad] shadow-[#ee2bad]/30'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {addedToCart ? 'check_circle' : 'shopping_bag'}
              </span>
              {addedToCart ? 'נוסף לעגלה! ✓' : 'הוסף לעגלת קניות'}
            </motion.button>
            <button
              onClick={() => dispatch({ type: 'NAVIGATE', page: 'cart' })}
              className="w-14 h-14 bg-[#2d1525] rounded-2xl flex items-center justify-center border border-[#ee2bad]/25 shrink-0"
            >
              <span className="material-symbols-outlined text-[#ee2bad]" style={{ fontSize: 22 }}>shopping_cart</span>
            </button>
          </div>

          {/* Go back button */}
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
            className="w-full h-11 rounded-2xl flex items-center justify-center gap-2 text-slate-400 text-sm font-semibold bg-[#2d1525]/60 border border-white/5 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward_ios</span>
            חזרה לקטלוג
          </button>
        </div>
      </div>
    </div>
  );
}
