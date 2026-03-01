import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';

export default function CartPage() {
  const { state, dispatch } = useApp();
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'HANDIYIA10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('קוד קופון לא תקין');
      setCouponApplied(false);
    }
  };

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      setOrderPlaced(true);
    }, 2000);
  };

  if (orderPlaced) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh bg-[#22101c] px-6 text-center" dir="rtl">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center mx-auto mb-6"
        >
          <span className="material-symbols-outlined text-green-400" style={{ fontSize: 48 }}>
            check_circle
          </span>
        </motion.div>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>ההזמנה אושרה!</h2>
        <p className="text-slate-400 mt-2 text-sm leading-relaxed">
          תודה על הקנייה. תקבלו אישור במייל בקרוב.
        </p>
        <button
          onClick={() => {
            dispatch({ type: 'NAVIGATE', page: 'catalog' });
            // Clear cart
            state.cart.forEach((i) => dispatch({ type: 'REMOVE_FROM_CART', productId: i.product.id }));
            setOrderPlaced(false);
          }}
          className="mt-8 px-8 py-3 bg-[#ee2bad] text-white rounded-full font-bold text-sm"
        >
          המשיכו לקנות
        </button>
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
        <h1 className="text-base font-bold text-white">עגלת קניות</h1>
        {state.cart.length > 0 && (
          <button
            onClick={() => state.cart.forEach((i) => dispatch({ type: 'REMOVE_FROM_CART', productId: i.product.id }))}
            className="p-2 hover:bg-[#ee2bad]/10 rounded-full"
          >
            <span className="material-symbols-outlined text-slate-400" style={{ fontSize: 20 }}>
              delete_sweep
            </span>
          </button>
        )}
        {state.cart.length === 0 && <div className="w-9" />}
      </header>

      {state.cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="material-symbols-outlined text-slate-600" style={{ fontSize: 72 }}>
            shopping_bag
          </span>
          <p className="text-slate-400 font-medium">העגלה ריקה</p>
          <button
            onClick={() => dispatch({ type: 'NAVIGATE', page: 'catalog' })}
            className="px-8 py-3 bg-[#ee2bad] text-white rounded-full font-bold text-sm"
          >
            גלו את הקטלוג
          </button>
        </div>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
            {/* Cart Items */}
            <AnimatePresence>
              {state.cart.map((item) => (
                <motion.div
                  key={`${item.product.id}-${item.size}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex gap-4 items-center"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[#2d1525] shrink-0 border border-[#ee2bad]/15">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between h-24 py-1">
                    <div>
                      <span className="text-[10px] text-[#ee2bad] font-bold">{item.product.brand}</span>
                      <h3 className="font-semibold text-sm text-white line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        מידה: {item.size} | צבע: {item.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#ee2bad] font-bold text-base">
                        ₪{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                      <div className="flex items-center gap-2 bg-[#ee2bad]/10 rounded-full px-2 py-1 border border-[#ee2bad]/20">
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_QUANTITY',
                              productId: item.product.id,
                              quantity: item.quantity - 1,
                            })
                          }
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#ee2bad]/20 text-[#ee2bad]"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>remove</span>
                        </button>
                        <span className="text-sm font-bold text-white w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            dispatch({
                              type: 'UPDATE_QUANTITY',
                              productId: item.product.id,
                              quantity: item.quantity + 1,
                            })
                          }
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#ee2bad]/20 text-[#ee2bad]"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Coupon */}
            <div className="pt-2">
              <div className="relative">
                <input
                  value={coupon}
                  onChange={(e) => { setCoupon(e.target.value); setCouponError(''); }}
                  placeholder="קוד קופון (נסו: HANDIYIA10)"
                  className="w-full bg-[#2d1525] border border-[#ee2bad]/20 rounded-full py-3 px-5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#ee2bad]/50"
                />
                <button
                  onClick={applyCoupon}
                  className="absolute left-2 top-1.5 bottom-1.5 px-4 bg-[#ee2bad] text-white rounded-full text-sm font-bold"
                >
                  החלה
                </button>
              </div>
              {couponError && <p className="text-red-400 text-xs mt-1 pr-2">{couponError}</p>}
              {couponApplied && (
                <p className="text-green-400 text-xs mt-1 pr-2 flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>check_circle</span>
                  קוד הקופון הוחל — 10% הנחה!
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="rounded-2xl bg-[#2d1525] border border-[#ee2bad]/15 p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">סכום ביניים</span>
                <span className="text-white font-medium">₪{subtotal.toLocaleString()}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">הנחה (10%)</span>
                  <span className="text-green-400 font-medium">-₪{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">משלוח</span>
                <span className="text-green-400 font-medium">חינם</span>
              </div>
              <div className="border-t border-[#ee2bad]/15 pt-3 flex justify-between">
                <span className="font-bold text-white">סה"כ לתשלום</span>
                <span className="text-2xl font-black text-[#ee2bad]">₪{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="h-4" />
          </main>

          {/* Checkout */}
          <div className="sticky bottom-0 bg-[#22101c] border-t border-[#ee2bad]/10 px-4 pt-4 pb-10">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full h-14 bg-[#ee2bad] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#ee2bad]/20 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {checkingOut ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="material-symbols-outlined"
                    style={{ fontSize: 22 }}
                  >
                    progress_activity
                  </motion.span>
                  מעבד הזמנה...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    payment
                  </span>
                  המשך לתשלום
                </>
              )}
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
}
