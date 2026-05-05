/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { auth, db } from "@/src/lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { motion } from "motion/react";
import { Loader2, GraduationCap } from "lucide-react";

export default function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user already exists in Firestore
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      
      if (!userSnap.exists()) {
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError("Gagal masuk dengan Google. Pastikan metode login Google sudah diaktifkan di Firebase Console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30 -ml-20 -mb-20"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Web Sumatif <span className="text-blue-600">Sukatinggal</span>
          </h1>
          <p className="text-gray-500 text-sm">
            Masuk dengan akun Google Anda untuk mulai membuat soal.
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 px-6 bg-white border border-gray-200 text-gray-700 rounded-2xl font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-sm disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Masuk dengan Google
              </>
            )}
          </button>

          {error && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 mt-4">
              <p className="text-red-600 text-xs text-center leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-50 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Developer</p>
          <p className="text-xs text-gray-600 mt-1">miftah sidik ptk SDN Sukatinggal</p>
        </div>
      </motion.div>
    </div>
  );
}
