import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { Product } from '../data/products';

export type Page = 'catalog' | 'camera' | 'results' | 'cart' | 'profile';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface UserProfile {
  name: string;
  photoUrl: string; // data URL from camera/upload
}

// ── localStorage helpers ──────────────────────────────────────────────────────
const PROFILE_KEY = 'handiyia_profile';

function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : null;
  } catch {
    return null;
  }
}

function saveProfile(profile: UserProfile | null) {
  try {
    if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    else localStorage.removeItem(PROFILE_KEY);
  } catch { /* storage full or unavailable */ }
}

interface AppState {
  currentPage: Page;
  profile: UserProfile | null;
  cart: CartItem[];
  selectedProduct: Product | null;
  capturedPhoto: string | null;
  generatedLooks: GeneratedLookState[];
  selectedLookIndex: number;
  isGenerating: boolean;
}

export interface GeneratedLookState {
  sceneLabel: string;
  imageDataUrl: string;
  isLoading: boolean;
  error?: string;
}

type Action =
  | { type: 'NAVIGATE'; page: Page }
  | { type: 'SET_PROFILE'; profile: UserProfile }
  | { type: 'SELECT_PRODUCT'; product: Product }
  | { type: 'SET_CAPTURED_PHOTO'; photo: string }
  | { type: 'SET_GENERATED_LOOKS'; looks: GeneratedLookState[] }
  | { type: 'UPDATE_LOOK'; index: number; look: GeneratedLookState }
  | { type: 'SET_SELECTED_LOOK'; index: number }
  | { type: 'SET_GENERATING'; isGenerating: boolean }
  | { type: 'ADD_TO_CART'; item: CartItem }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'REMOVE_FROM_CART'; productId: string }
  | { type: 'CLEAR_RESULTS' };

function makeInitialState(): AppState {
  const savedProfile = loadProfile();
  return {
    currentPage: 'catalog',
    profile: savedProfile,       // ← restored from localStorage
    cart: [],
    selectedProduct: null,
    capturedPhoto: null,
    generatedLooks: [],
    selectedLookIndex: 0,
    isGenerating: false,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return { ...state, currentPage: action.page };

    case 'SET_PROFILE':
      return { ...state, profile: action.profile, currentPage: 'catalog' };

    case 'SELECT_PRODUCT':
      return { ...state, selectedProduct: action.product };

    case 'SET_CAPTURED_PHOTO':
      return { ...state, capturedPhoto: action.photo };

    case 'SET_GENERATED_LOOKS':
      return { ...state, generatedLooks: action.looks };

    case 'UPDATE_LOOK': {
      const looks = [...state.generatedLooks];
      looks[action.index] = action.look;
      return { ...state, generatedLooks: looks };
    }

    case 'SET_SELECTED_LOOK':
      return { ...state, selectedLookIndex: action.index };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.isGenerating };

    case 'ADD_TO_CART': {
      const existing = state.cart.findIndex(
        (i) => i.product.id === action.item.product.id && i.size === action.item.size
      );
      if (existing >= 0) {
        const cart = [...state.cart];
        cart[existing] = { ...cart[existing], quantity: cart[existing].quantity + 1 };
        return { ...state, cart };
      }
      return { ...state, cart: [...state.cart, action.item] };
    }

    case 'UPDATE_QUANTITY': {
      const cart = state.cart
        .map((i) =>
          i.product.id === action.productId ? { ...i, quantity: action.quantity } : i
        )
        .filter((i) => i.quantity > 0);
      return { ...state, cart };
    }

    case 'REMOVE_FROM_CART':
      return { ...state, cart: state.cart.filter((i) => i.product.id !== action.productId) };

    case 'CLEAR_RESULTS':
      return {
        ...state,
        capturedPhoto: null,
        generatedLooks: [],
        selectedLookIndex: 0,
        isGenerating: false,
      };

    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, makeInitialState);

  // Persist profile to localStorage whenever it changes
  useEffect(() => {
    saveProfile(state.profile);
  }, [state.profile]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
