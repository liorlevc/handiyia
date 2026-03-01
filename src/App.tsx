/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AppProvider, useApp, type Page } from './context/AppContext';
import ProfilePage from './pages/ProfilePage';
import CatalogPage from './pages/CatalogPage';
import CameraPage from './pages/CameraPage';
import ResultsPage from './pages/ResultsPage';
import CartPage from './pages/CartPage';

// ── Bottom Navigation ────────────────────────────────────────────────────────

const NAV_ITEMS: { page: Page; icon: string; label: string }[] = [
  { page: 'catalog', icon: 'home', label: 'בית' },
  { page: 'catalog', icon: 'grid_view', label: 'קטלוג' },
  { page: 'results', icon: 'checkroom', label: 'מדידה' },
  { page: 'cart', icon: 'shopping_bag', label: 'עגלה' },
  { page: 'profile', icon: 'person', label: 'פרופיל' },
];

function BottomNav() {
  const { state, dispatch } = useApp();
  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);

  // Don't show nav on camera or profile setup pages
  if (state.currentPage === 'camera') return null;
  if (state.currentPage === 'profile' && !state.profile) return null;

  const isActive = (page: Page) => state.currentPage === page;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#ee2bad]/10"
      style={{ background: 'rgba(34,16,28,0.97)', backdropFilter: 'blur(20px)' }}
      dir="rtl"
    >
      <div className="flex justify-between items-center px-4 pt-2 pb-6 max-w-md mx-auto">
        {/* Home */}
        <NavBtn
          icon="home"
          label="בית"
          active={state.currentPage === 'catalog'}
          onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
        />
        {/* Catalog */}
        <NavBtn
          icon="grid_view"
          label="קטלוג"
          active={false}
          onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
        />

        {/* Center Camera FAB */}
        <div className="relative -top-6">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'camera' })}
            className="w-14 h-14 rounded-full bg-[#ee2bad] flex items-center justify-center shadow-lg shadow-[#ee2bad]/40 border-4 border-[#22101c]"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>
              photo_camera
            </span>
          </motion.button>
        </div>

        {/* Try-on (results) */}
        <NavBtn
          icon="checkroom"
          label="מדידה"
          active={state.currentPage === 'results'}
          onClick={() => dispatch({ type: 'NAVIGATE', page: 'results' })}
        />

        {/* Cart */}
        <div className="flex flex-col items-center gap-1 relative">
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'cart' })}
            className={`p-2 rounded-full transition-colors ${state.currentPage === 'cart' ? 'text-[#ee2bad]' : 'text-slate-400'}`}
          >
            <span
              className={`material-symbols-outlined ${state.currentPage === 'cart' ? 'fill-icon' : ''}`}
              style={{ fontSize: 24 }}
            >
              shopping_bag
            </span>
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#ee2bad] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <span
            className={`text-[9px] font-semibold ${state.currentPage === 'cart' ? 'text-[#ee2bad]' : 'text-slate-500'}`}
          >
            עגלה
          </span>
        </div>
      </div>
    </nav>
  );
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div className={`p-2 rounded-full transition-colors ${active ? 'text-[#ee2bad]' : 'text-slate-400'}`}>
        <span
          className={`material-symbols-outlined ${active ? 'fill-icon' : ''}`}
          style={{ fontSize: 24 }}
        >
          {icon}
        </span>
      </div>
      <span className={`text-[9px] font-semibold ${active ? 'text-[#ee2bad]' : 'text-slate-500'}`}>
        {label}
      </span>
    </button>
  );
}

// ── Page Router ───────────────────────────────────────────────────────────────

function PageRouter() {
  const { state } = useApp();

  // First-time: show profile setup
  if (!state.profile) {
    return <ProfilePage />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state.currentPage}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.18 }}
        className="w-full"
      >
        {state.currentPage === 'catalog' && <CatalogPage />}
        {state.currentPage === 'camera' && <CameraPage />}
        {state.currentPage === 'results' && <ResultsPage />}
        {state.currentPage === 'cart' && <CartPage />}
        {state.currentPage === 'profile' && <ProfilePage />}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <div className="relative w-full min-h-dvh bg-[#22101c]" dir="rtl">
        <PageRouter />
        <BottomNav />
      </div>
    </AppProvider>
  );
}
