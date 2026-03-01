import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { BRANDS, PRODUCTS, type Product } from '../data/products';

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
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Badges */}
                    {product.isNew && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-[#ee2bad] text-white text-[10px] font-bold">
                        חדש
                      </div>
                    )}
                    {product.originalPrice && (
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
    </div>
  );
}
