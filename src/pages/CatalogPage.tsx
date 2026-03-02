import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BRANDS, PRODUCTS, type Product } from '../data/products';
import { generateQuickLook } from '../services/imagenService';

const GENDER_FILTERS = [
  { id: 'all', label: 'הכל' },
  { id: 'women', label: 'נשים' },
  { id: 'men', label: 'גברים' },
] as const;

export default function CatalogPage() {
  const { state, dispatch } = useApp();
  const [search, setSearch] = useState('');
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeGender, setActiveGender] = useState<'all' | 'men' | 'women'>('all');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  // Quick try-on: per-product generated image URL and loading state
  const [quickImages, setQuickImages] = useState<Record<string, string>>({});
  const [quickLoading, setQuickLoading] = useState<Set<string>>(new Set());
  const [quickError, setQuickError] = useState<Record<string, string>>({});
  // Fullscreen zoom viewer
  const [zoomedImage, setZoomedImage] = useState<{ src: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchBrand = !activeBrand || p.brandId === activeBrand;
      const matchGender =
        activeGender === 'all' || p.gender === activeGender || p.gender === 'unisex';
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((t) => t.includes(search.toLowerCase()));
      return matchBrand && matchGender && matchSearch;
    });
  }, [search, activeBrand, activeGender]);

  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);

  const handleTryOn = (product: Product) => {
    dispatch({ type: 'SELECT_PRODUCT', product });
    dispatch({ type: 'CLEAR_RESULTS' });
    if (!state.profile?.photoUrl) {
      dispatch({ type: 'NAVIGATE', page: 'camera' });
    } else {
      dispatch({ type: 'NAVIGATE', page: 'camera' });
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleQuickTryOn = async (product: Product) => {
    // If already generated, reset to original
    if (quickImages[product.id]) {
      setQuickImages((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
      setQuickError((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
      return;
    }
    // Need a profile photo
    if (!state.profile?.photoUrl) {
      dispatch({ type: 'NAVIGATE', page: 'profile' });
      return;
    }
    setQuickLoading((prev) => new Set(prev).add(product.id));
    setQuickError((prev) => { const n = { ...prev }; delete n[product.id]; return n; });
    try {
      const url = await generateQuickLook(state.profile.photoUrl, product);
      setQuickImages((prev) => ({ ...prev, [product.id]: url }));
    } catch (err) {
      console.error('Quick try-on failed:', err);
      setQuickError((prev) => ({ ...prev, [product.id]: 'שגיאה בייצור התמונה' }));
    } finally {
      setQuickLoading((prev) => { const n = new Set(prev); n.delete(product.id); return n; });
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#22101c]" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#22101c]/90 backdrop-blur-md border-b border-[#ee2bad]/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'profile' })}
            className="p-2 hover:bg-[#ee2bad]/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 22 }}>
              person
            </span>
          </button>

          <h1 className="font-display text-xl font-bold tracking-tight text-white italic">קטלוג מותגים</h1>

          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'cart' })}
            className="relative p-2 hover:bg-[#ee2bad]/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-slate-300" style={{ fontSize: 22 }}>
              shopping_bag
            </span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#ee2bad] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-28">
        {/* Search */}
        <div className="px-4 pt-4 pb-2">
          <div className="relative">
            <span
              className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              style={{ fontSize: 20 }}
            >
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש מותגים או פריטים..."
              className="w-full h-12 pr-11 pl-4 rounded-2xl bg-[#ee2bad]/5 border border-[#ee2bad]/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ee2bad]/40 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Gender filter */}
        <div className="flex gap-2 px-4 py-2">
          {GENDER_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveGender(f.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                activeGender === f.id
                  ? 'bg-[#ee2bad] text-white'
                  : 'bg-[#ee2bad]/10 text-slate-300 hover:bg-[#ee2bad]/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Featured Brands */}
        <section className="mb-6">
          <div className="flex items-center justify-between px-4 mb-3 mt-2">
            <h2 className="font-display text-base font-bold text-white">מותגים נבחרים</h2>
            <button
              onClick={() => setActiveBrand(null)}
              className="text-[#ee2bad] text-xs font-semibold"
            >
              הכל
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-4 hide-scrollbar pb-1">
            {BRANDS.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setActiveBrand(activeBrand === brand.id ? null : brand.id)}
                className="flex-shrink-0 flex flex-col items-center gap-2"
              >
                <div
                  className={`w-16 h-16 rounded-full bg-[#2d1525] overflow-hidden transition-all border-2 ${
                    activeBrand === brand.id
                      ? 'border-[#ee2bad] scale-105'
                      : 'border-transparent hover:border-[#ee2bad]/50'
                  }`}
                >
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    activeBrand === brand.id ? 'text-[#ee2bad]' : 'text-slate-400'
                  }`}
                >
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Product Grid */}
        <section className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-white">
              {activeBrand
                ? BRANDS.find((b) => b.id === activeBrand)?.name
                : 'קולקציה חדשה'}
            </h2>
            <span className="text-xs text-slate-500">{filtered.length} פריטים</span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <span className="material-symbols-outlined mb-2" style={{ fontSize: 48 }}>
                search_off
              </span>
              <p>לא נמצאו פריטים</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex flex-col gap-3 group"
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#ee2bad]/5">
                    {/* Product / generated image */}
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={quickImages[product.id] ? 'generated' : 'original'}
                        src={quickImages[product.id] ?? product.image}
                        alt={product.name}
                        loading="lazy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </AnimatePresence>

                    {/* Loading overlay */}
                    {quickLoading.has(product.id) && (
                      <div className="absolute inset-0 bg-[#1a0d16]/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                        <motion.div
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                          className="absolute w-14 h-14 rounded-full bg-[#ee2bad]/30"
                        />
                        <span className="material-symbols-outlined text-[#ee2bad] relative z-10" style={{ fontSize: 28 }}>auto_awesome</span>
                        <p className="font-sans text-white text-[10px] font-semibold relative z-10">מייצר לוק...</p>
                      </div>
                    )}

                    {/* Error overlay */}
                    {quickError[product.id] && !quickLoading.has(product.id) && (
                      <div className="absolute inset-x-0 bottom-0 bg-red-900/80 text-red-200 text-[9px] font-semibold text-center py-1 px-2">
                        {quickError[product.id]}
                      </div>
                    )}

                    {/* "AI Look" badge when showing generated image */}
                    {quickImages[product.id] && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ee2bad] text-white text-[9px] font-bold"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 10 }}>auto_awesome</span>
                        לוק AI
                      </motion.div>
                    )}

                    {/* Badges (isNew / discount) — hide when showing generated */}
                    {!quickImages[product.id] && product.isNew && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#ee2bad] text-white text-[10px] font-bold">
                        חדש
                      </div>
                    )}
                    {!quickImages[product.id] && product.originalPrice && (
                      <div className={`absolute ${product.isNew ? 'top-8' : 'top-2'} right-2 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold`}>
                        {Math.round((1 - product.price / product.originalPrice) * 100)}% הנחה
                      </div>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 left-2 p-1.5 bg-black/30 backdrop-blur-md rounded-full text-white transition-colors"
                    >
                      <span
                        className={`material-symbols-outlined ${wishlist.has(product.id) ? 'fill-icon text-[#ee2bad]' : ''}`}
                        style={{ fontSize: 18 }}
                      >
                        favorite
                      </span>
                    </button>

                    {/* Zoom button — bottom-right, only when generated image is ready */}
                    {quickImages[product.id] && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setZoomedImage({ src: quickImages[product.id], name: product.name })}
                        className="absolute bottom-10 left-2 p-1.5 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/20 z-10"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>zoom_in</span>
                      </motion.button>
                    )}

                    {/* Quick Try-On button — bottom of thumbnail */}
                    <button
                      onClick={() => handleQuickTryOn(product)}
                      disabled={quickLoading.has(product.id)}
                      className={`absolute bottom-0 inset-x-0 py-2 flex items-center justify-center gap-1.5 text-[10px] font-bold transition-all backdrop-blur-md
                        ${quickImages[product.id]
                          ? 'bg-white/20 text-white'
                          : 'bg-[#ee2bad]/90 text-white'}
                        ${quickLoading.has(product.id) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                        {quickImages[product.id] ? 'refresh' : 'person_celebrate'}
                      </span>
                      {quickImages[product.id] ? 'איפוס' : 'לוק מהיר עם תמונתי'}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#ee2bad] font-bold">{product.brand}</span>
                    <h3 className="font-display text-sm font-semibold text-white line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-bold text-white">
                        ₪{product.price.toLocaleString()}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ₪{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleTryOn(product)}
                      className="mt-2 w-full py-2.5 bg-[#ee2bad] text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#ee2bad]/20"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        checkroom
                      </span>
                      מדידה וירטואלית
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── Fullscreen zoom viewer ───────────────────────────────────────── */}
      <AnimatePresence>
        {zoomedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/95 flex flex-col"
            onClick={() => setZoomedImage(null)}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ee2bad]" style={{ fontSize: 16 }}>auto_awesome</span>
                <span className="font-sans text-white text-sm font-bold line-clamp-1">{zoomedImage.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Download */}
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = zoomedImage.src;
                    a.download = `ai-look-${Date.now()}.jpg`;
                    a.click();
                  }}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                </button>
                {/* Close */}
                <button
                  onClick={() => setZoomedImage(null)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 text-white"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
              <motion.img
                src={zoomedImage.src}
                alt={zoomedImage.name}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Tap anywhere hint */}
            <p className="text-center text-white/30 text-xs pb-6 font-sans shrink-0">
              הקש בכל מקום לסגירה
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
