import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export interface ElementCP {
  elemen: string;
  cp: string;
}

export interface ExamRequest {
  mapel: string;
  kelas: string;
  fase: string;
  thnPel: string;
  sekolah: string;
  guru: string;
  jenisSumatif: string;
  elements: ElementCP[];
  hotsPercent: number;
  lotsPercent: number;
  totalPg: number;
  totalEssay: number;
}

export interface Question {
  id: number;
  type: 'pg' | 'essay';
  text: string;
  options?: string[];
  answer: string;
  cognitiveLevel: 'HOTS' | 'LOTS';
  imageUrl?: string;
}

export interface ExamResponse {
  specTable: any[];
  questions: Question[];
  answerKey: string[];
}

export const getHotsRecommendation = async (kelas: string, fase: string, mapel: string) => {
  const prompt = `Berikan rekomendasi persentase HOTS dan LOTS yang paling relevan dan kontekstual untuk siswa SD Kelas ${kelas}, Fase ${fase}, Mata Pelajaran ${mapel}. Berikan pula alasan singkatnya. Kembalikan dalam format JSON dengan key: hots, lots, reason.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hots: { type: Type.NUMBER },
          lots: { type: Type.NUMBER },
          reason: { type: Type.STRING }
        },
        required: ["hots", "lots", "reason"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getCurriculumData = async (kelas: string, fase: string, mapel: string): Promise<ElementCP[]> => {
  const prompt = `
    Bertindaklah sebagai pakar kurikulum nasional Indonesia. 
    Berikan daftar lengkap Elemen dan Capaian Pembelajaran (CP) untuk:
    Mata Pelajaran: ${mapel}
    Kelas: ${kelas}
    Fase: ${fase}
    
    WAJIB BERDASARKAN: Permendikdasmen Nomor 13 Tahun 2025.
    
    KETENTUAN:
    1. Teks CP harus SAMA PERSIS dengan yang tertuang dalam lampiran Permendikdasmen No. 13 Tahun 2025.
    2. JANGAN MEMANGKAS atau meringkas kalimat sedikitpun.
    3. Jika ada beberapa elemen, berikan semuanya dalam array.

    Kembalikan dalam format JSON array of objects dengan key: elemen, cp.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            elemen: { type: Type.STRING },
            cp: { type: Type.STRING }
          },
          required: ["elemen", "cp"]
        }
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateExamContent = async (request: ExamRequest): Promise<ExamResponse> => {
  const elementsStr = request.elements.map(e => `- ${e.elemen}: ${e.cp}`).join('\n');
  const prompt = `
    Anda adalah pakar pembuat soal sekolah dasar. 
    Buatlah kisi-kisi dan naskah soal sumatif berdasarkan data berikut:
    Mapel: ${request.mapel}
    Kelas: ${request.kelas}
    Fase: ${request.fase}
    Jenis Sumatif: ${request.jenisSumatif}
    Elemen dan CP:
    ${elementsStr}
    
    Target Distribusi: ${request.hotsPercent}% HOTS, ${request.lotsPercent}% LOTS.
    Jumlah Soal: ${request.totalPg} Pilihan Ganda (PG), ${request.totalEssay} Essay.

    Tugas:
    1. Buat tabel kisi-kisi (array objects) yang mencakup elemen, CP, Indikator Soal, No Soal, Bentuk Soal, dan Level Kognitif.
    2. Buat naskah soal lengkap. Untuk soal PG sediakan 4 opsi (A, B, C, D).
    3. Jika soal memerlukan visualisasi (seperti gambar grafik, hewan, dll), tambahkan deskripsi gambar di field imageUrl sebagai placeholder (contoh: "IMAGE: diagram siklus air").
    4. Buat kunci jawaban.

    Kembalikan dalam format JSON yang ketat dengan struktur:
    {
      "specTable": [...],
      "questions": [{"id": 1, "type": "pg", "text": "...", "options": ["A", "B", "C", "D"], "answer": "A", "cognitiveLevel": "HOTS", "imageUrl": "..."}],
      "answerKey": ["1. A", "2. B", ...]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          specTable: { type: Type.ARRAY, items: { type: Type.OBJECT } },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.NUMBER },
                type: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                answer: { type: Type.STRING },
                cognitiveLevel: { type: Type.STRING },
                imageUrl: { type: Type.STRING }
              },
              required: ["id", "type", "text", "answer", "cognitiveLevel"]
            }
          },
          answerKey: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["specTable", "questions", "answerKey"]
      }
    }
  });

  return JSON.parse(response.text);
};
