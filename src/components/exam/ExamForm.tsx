/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Plus, Trash2, Wand2, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getHotsRecommendation, getCurriculumData, ElementCP, ExamRequest } from "@/src/services/geminiService";

interface ExamFormProps {
  onGenerate: (data: ExamRequest) => void;
  loading: boolean;
}

export default function ExamForm({ onGenerate, loading }: ExamFormProps) {
  const [formData, setFormData] = useState<Omit<ExamRequest, 'elements'>>({
    mapel: "",
    kelas: "1",
    fase: "A",
    thnPel: "2023/2024",
    sekolah: "SDN Sukatinggal",
    guru: "",
    jenisSumatif: "SAS 1",
    hotsPercent: 20,
    lotsPercent: 80,
    totalPg: 10,
    totalEssay: 5,
  });

  const [elements, setElements] = useState<ElementCP[]>([{ elemen: "", cp: "" }]);
  const [recommending, setRecommending] = useState(false);
  const [fetchingCP, setFetchingCP] = useState(false);
  const [recommendationReason, setRecommendationReason] = useState("");

  const addElement = () => setElements([...elements, { elemen: "", cp: "" }]);
  const removeElement = (index: number) => {
    if (elements.length > 1) {
      setElements(elements.filter((_, i) => i !== index));
    }
  };

  const updateElement = (index: number, field: keyof ElementCP, value: string) => {
    const newElements = [...elements];
    newElements[index][field] = value;
    setElements(newElements);
  };

  const handleFetchCP = async () => {
    if (!formData.mapel) return alert("Pilih Mapel terlebih dahulu");
    setFetchingCP(true);
    try {
      const data = await getCurriculumData(formData.kelas, formData.fase, formData.mapel);
      if (data && data.length > 0) {
        setElements(data);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data kurikulum. Silakan coba lagi.");
    } finally {
      setFetchingCP(false);
    }
  };

  const handleRecommend = async () => {
    if (!formData.mapel) return alert("Pilih Mapel terlebih dahulu");
    setRecommending(true);
    try {
      const rec = await getHotsRecommendation(formData.kelas, formData.fase, formData.mapel);
      setFormData(prev => ({ ...prev, hotsPercent: rec.hots, lotsPercent: rec.lots }));
      setRecommendationReason(rec.reason);
    } catch (error) {
      console.error(error);
    } finally {
      setRecommending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({ ...formData, elements });
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Mata Pelajaran</label>
          <input 
            type="text" 
            required
            placeholder="Contoh: Matematika"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.mapel}
            onChange={(e) => setFormData({ ...formData, mapel: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas & Fase</label>
          <div className="flex gap-2">
            <select 
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
              value={formData.kelas}
              onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
            >
              {[1,2,3,4,5,6].map(k => <option key={k} value={k}>Kelas {k}</option>)}
            </select>
            <select 
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
              value={formData.fase}
              onChange={(e) => setFormData({ ...formData, fase: e.target.value })}
            >
              {['A', 'B', 'C'].map(f => <option key={f} value={f}>Fase {f}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Pelajaran</label>
          <select 
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
            value={formData.thnPel}
            onChange={(e) => setFormData({ ...formData, thnPel: e.target.value })}
          >
            {["2023/2024", "2024/2025", "2025/2026"].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Sekolah</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.sekolah}
            onChange={(e) => setFormData({ ...formData, sekolah: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Guru</label>
          <input 
            type="text" 
            required
            placeholder="Nama lengkap & Gelar"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.guru}
            onChange={(e) => setFormData({ ...formData, guru: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Jenis Sumatif</label>
          <select 
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
            value={formData.jenisSumatif}
            onChange={(e) => setFormData({ ...formData, jenisSumatif: e.target.value })}
          >
            <option value="SAS 1">SAS 1 (Semester Ganjil)</option>
            <option value="SAS 2">SAS 2 (Semester Genap)</option>
            <option value="SAJ">SAJ (Akhir Jenjang - Kelas 6)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-sm font-semibold text-gray-700">Elemen dan Capaian Pembelajaran</label>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={handleFetchCP}
              disabled={fetchingCP}
              className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-100 disabled:opacity-50"
            >
              {fetchingCP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Ambil CP (No 13 Thn 2025)
            </button>
            <button 
              type="button" 
              onClick={addElement}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg bg-blue-50"
            >
              <Plus className="w-4 h-4" /> Tambah Elemen
            </button>
          </div>
        </div>
        
        <AnimatePresence>
          {elements.map((el, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
            >
              <div className="md:col-span-3">
                <input 
                  placeholder="Elemen"
                  value={el.elemen}
                  onChange={(e) => updateElement(idx, 'elemen', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm"
                />
              </div>
              <div className="md:col-span-8">
                <textarea 
                  placeholder="Capaian Pembelajaran"
                  rows={2}
                  value={el.cp}
                  onChange={(e) => updateElement(idx, 'cp', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none text-sm resize-none"
                />
              </div>
              <div className="md:col-span-1 pt-2">
                <button 
                  type="button" 
                  onClick={() => removeElement(idx)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="pt-6 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-700">Distribusi Kognitif</label>
            <button 
              type="button" 
              onClick={handleRecommend}
              disabled={recommending}
              className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 px-3 py-1.5 rounded-lg bg-purple-50 disabled:opacity-50"
            >
              {recommending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Rekomendasi AI
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-red-600 uppercase">HOTS: {formData.hotsPercent}%</span>
                <span className="text-blue-600 uppercase">LOTS: {formData.lotsPercent}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                step="5"
                value={formData.hotsPercent}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, hotsPercent: val, lotsPercent: 100 - val });
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            {recommendationReason && (
              <p className="text-[11px] text-gray-500 italic bg-gray-50 p-2 rounded-lg leading-relaxed">
                {recommendationReason}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah PG</label>
            <input 
              type="number" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
              value={formData.totalPg}
              onChange={(e) => setFormData({ ...formData, totalPg: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah Essay</label>
            <input 
              type="number" 
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none"
              value={formData.totalEssay}
              onChange={(e) => setFormData({ ...formData, totalEssay: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Wand2 className="w-6 h-6" /> Generate Soal & Kisi-kisi</>}
      </button>
    </motion.form>
  );
}
