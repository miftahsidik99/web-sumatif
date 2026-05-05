/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Navbar from "./components/layout/Navbar";
import AuthForm from "./components/auth/AuthForm";
import ExamForm from "./components/exam/ExamForm";
import ExamPreview from "./components/exam/ExamPreview";
import { generateExamContent, ExamRequest, ExamResponse } from "./services/geminiService";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, ArrowLeft } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [examResult, setExamResult] = useState<ExamResponse | null>(null);
  const [currentRequest, setCurrentRequest] = useState<ExamRequest | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = async (request: ExamRequest) => {
    setGenerating(true);
    try {
      const result = await generateExamContent(request);
      setExamResult(result);
      setCurrentRequest(request);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membuat soal. Silakan coba lagi.");
    } finally {
      setGenerating(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar user={user} />
      
      <main className="max-w-6xl mx-auto px-4 pt-28 pb-20">
        <AnimatePresence mode="wait">
          {!examResult ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                  Pembuat Soal <span className="text-blue-600">Otomatis</span>
                </h1>
                <p className="text-gray-500">Isi data di bawah ini untuk menghasilkan kisi-kisi dan naskah soal.</p>
              </div>
              
              <ExamForm onGenerate={handleGenerate} loading={generating} />
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button 
                onClick={() => setExamResult(null)}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-6 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Form
              </button>
              
              {currentRequest && (
                <ExamPreview data={examResult} request={currentRequest} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer sticky bottom */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 bg-white/60 backdrop-blur-sm border-t border-gray-100 flex justify-center text-[10px] text-gray-400 uppercase tracking-widest font-semibold z-40">
        Developed by: miftah sidik ptk SDN Sukatinggal
      </footer>
    </div>
  );
}
