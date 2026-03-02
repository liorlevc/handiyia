/**
 * profileService.ts
 * Persists user profile (name + compressed photo) to Firebase Firestore,
 * keyed by an anonymous Firebase Auth UID.
 *
 * Falls back gracefully to localStorage if Firebase is not configured.
 */

import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../context/AppContext';

// ── Config check ─────────────────────────────────────────────────────────────
// Relies on firebase.ts having already validated the env vars; if auth/db are
// null it means Firebase was intentionally skipped (missing / placeholder keys).
function isFirebaseConfigured(): boolean {
  return auth !== null && db !== null;
}

// ── Image compression helper ──────────────────────────────────────────────────
/**
 * Compresses a data-URL image to a max 320×320 JPEG at 70% quality.
 * Result is ~15-40 KB, safe for Firestore's 1 MB document limit.
 */
export async function compressImage(dataUrl: string, maxPx = 320, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w = Math.round(img.width  * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback: use original
    img.src = dataUrl;
  });
}

// ── Anonymous Auth ────────────────────────────────────────────────────────────
let _resolveUser: (u: User) => void;
let _rejectUser:  (e: unknown) => void;
const userReady: Promise<User> = new Promise((res, rej) => {
  _resolveUser = res;
  _rejectUser  = rej;
});

if (isFirebaseConfigured() && auth) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      _resolveUser(user);
    } else {
      signInAnonymously(auth!)
        .then((cred) => _resolveUser(cred.user))
        .catch(_rejectUser);
    }
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Load profile from Firestore (or localStorage fallback). */
export async function loadProfileRemote(): Promise<UserProfile | null> {
  if (!isFirebaseConfigured()) return null;
  try {
    const user = await Promise.race([
      userReady,
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
    ]);
    const snap = await getDoc(doc(db!, 'profiles', user.uid));
    if (!snap.exists()) return null;
    const data = snap.data() as UserProfile;
    return data.name ? data : null;
  } catch (err) {
    console.warn('[profileService] loadProfileRemote failed:', err);
    return null;
  }
}

/** Save profile to Firestore. Compresses the photo before saving. */
export async function saveProfileRemote(profile: UserProfile): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const user = await Promise.race([
      userReady,
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('timeout')), 5000)),
    ]);
    const compressedPhoto = profile.photoUrl
      ? await compressImage(profile.photoUrl)
      : '';
    await setDoc(doc(db!, 'profiles', user.uid), {
      name:     profile.name,
      photoUrl: compressedPhoto,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[profileService] saveProfileRemote failed:', err);
  }
}

/** Delete profile from Firestore. */
export async function deleteProfileRemote(): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const user = await userReady;
    await deleteDoc(doc(db!, 'profiles', user.uid));
  } catch (err) {
    console.warn('[profileService] deleteProfileRemote failed:', err);
  }
}
