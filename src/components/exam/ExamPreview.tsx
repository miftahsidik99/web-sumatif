/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, ExamRequest } from "@/src/services/geminiService";
import { Download, FileText, CheckCircle2, Table as TableIcon, Image as ImageIcon } from "lucide-react";
import { saveAs } from "file-saver";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  AlignmentType,
  PageBreak
} from "docx";

interface ExamPreviewProps {
  data: {
    specTable: any[];
    questions: Question[];
    answerKey: string[];
  };
  request: ExamRequest;
}

export default function ExamPreview({ data, request }: ExamPreviewProps) {
  
  const exportToWord = async () => {
    // Definisi gaya format no border
    const noBorder = {
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    };

    const headerBorder = {
      bottom: { style: BorderStyle.DOUBLE, size: 12, color: "000000" },
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
    };

    // Pisah tipe soal
    const pgQuestions = data.questions.filter(q => q.type === 'pg');
    const essayQuestions = data.questions.filter(q => q.type !== 'pg');

    const doc = new Document({
      sections: [{
        properties: {
            page: { margin: { top: 1134, right: 1134, bottom: 1134, left: 1440 } } // 2cm and 2.54cm
        },
        children: [
          // ==================== HALAMAN 1: NASKAH SOAL ====================
          // Kop Surat
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 50 },
            children: [
              new TextRun({ text: request.sekolah.toUpperCase(), bold: true, size: 28 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            border: headerBorder,
            children: [
              new TextRun({ text: `PENILAIAN SUMATIF ${request.thnPel}`, size: 22 }),
            ],
          }),

          // Identitas
          new Paragraph({ text: "", spacing: { after: 100 } }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: noBorder,
            rows: [
              new TableRow({
                children: [
                  new TableCell({ borders: noBorder, width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Mata Pelajaran", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, width: { size: 2, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: request.mapel, size: 22, bold: true })] })] }),
                  new TableCell({ borders: noBorder, width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Nama", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, width: { size: 2, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, width: { size: 33, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "_______________________", size: 22 })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: "Kelas/Fase", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: `${request.kelas} / ${request.fase}`, size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: "No Absen", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: "_______________________", size: 22 })] })] }),
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: "Waktu", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: "90 Menit", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: "Nilai", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: ":", size: 22 })] })] }),
                  new TableCell({ borders: noBorder, children: [new Paragraph({ children: [new TextRun({ text: "", size: 22 })] })] }),
                ]
              }),
            ]
          }),

          // Bagian PG
          ...(pgQuestions.length > 0 ? [
            new Paragraph({ text: "", spacing: { before: 200 } }),
            new Paragraph({
              children: [new TextRun({ text: "I. Berilah tanda silang (x) pada huruf A, B, C, atau D di depan jawaban yang paling benar!", bold: true, size: 22 })],
              spacing: { before: 200, after: 150 }
            }),
            ...pgQuestions.flatMap((q, index) => [
              new Paragraph({
                spacing: { before: 100, after: 60 },
                children: [
                  new TextRun({ text: `${index + 1}. `, bold: true, size: 22 }),
                  new TextRun({ text: q.text, size: 22 }),
                ]
              }),
              // Opsi jawaban
              ...(q.options ? q.options.map((opt, i) => new Paragraph({
                indent: { left: 400 },
                spacing: { before: 40, after: 40 },
                children: [new TextRun({ text: `${String.fromCharCode(65 + i)}. ${opt}`, size: 22 })]
              })) : [])
            ])
          ] : []),

          // Bagian Essay
          ...(essayQuestions.length > 0 ? [
            new Paragraph({ text: "", spacing: { before: 300 } }),
            new Paragraph({
              children: [new TextRun({ text: "II. Jawablah pertanyaan-pertanyaan di bawah ini dengan benar!", bold: true, size: 22 })],
              spacing: { before: 300, after: 150 }
            }),
            ...essayQuestions.flatMap((q, index) => [
              new Paragraph({
                spacing: { before: 100, after: 60 },
                children: [
                  new TextRun({ text: `${pgQuestions.length + index + 1}. `, bold: true, size: 22 }),
                  new TextRun({ text: q.text, size: 22 }),
                ]
              }),
              new Paragraph({ text: "\n", spacing: { after: 700 } }), // Ruang untuk menjawab essay
            ])
          ] : []),

          // ==================== HALAMAN 2: KISI-KISI ====================
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new TextRun({ text: "KISI-KISI SOAL SUMATIF", bold: true, size: 24 })],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No", bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Elemen / CP", bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Indikator Soal", bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Level", bold: true, size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "No Soal", bold: true, size: 20 })] })] }),
                ]
              }),
              ...data.specTable.map((row, idx) => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.No || row.id || idx + 1), size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(row.Elemen || row.CP || ''), size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(row.Indikator || row.Indicator || ''), size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.Level || ''), size: 20 })] })] }),
                  new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(row.Bentuk || ''), size: 20 })] })] }),
                ]
              }))
            ]
          }),

          // ==================== HALAMAN 3: KUNCI JAWABAN ====================
          new Paragraph({ children: [new PageBreak()] }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [new TextRun({ text: "KUNCI JAWABAN", bold: true, size: 24 })],
          }),
          ...data.answerKey.map(val => new Paragraph({ 
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text: val, size: 22 })] 
          }))
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Soal_${request.mapel}_Kelas${request.kelas}.docx`);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 bg-[#F8FAFC]/80 backdrop-blur-sm py-4 z-40 px-4 -mx-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Hasil Generasi Soal</h2>
          <p className="text-sm text-gray-500">Tinjau kisi-kisi, naskah, dan lembar jawaban</p>
        </div>
        <button 
          onClick={exportToWord}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg shadow-green-100"
        >
          <Download className="w-5 h-5" /> Export ke Word
        </button>
      </div>

      {/* Kisi-kisi Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <TableIcon className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Kisi-kisi Soal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Elemen / CP</th>
                <th className="px-6 py-4">Indikator</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Bentuk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.specTable.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.No || row.id || idx + 1}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs">{row.Elemen || row.CP || ""}</td>
                  <td className="px-6 py-4 text-gray-600 max-w-sm">{row.Indikator || row.Indicator || ""}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${row.Level === 'HOTS' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {row.Level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic">{row.Bentuk || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Naskah Soal Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-100">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900">Naskah Soal</h3>
        </div>

        <div className="space-y-10">
          {data.questions.map((q) => (
            <div key={q.id} className="relative group">
              <span className="absolute -left-6 top-0 text-gray-300 font-bold text-lg select-none">{q.id}.</span>
              <div className="space-y-4">
                <p className="text-gray-900 font-medium leading-relaxed">{q.text}</p>
                
                {q.imageUrl && q.imageUrl.startsWith("IMAGE:") && (
                  <div className="my-4 p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 gap-2">
                    <ImageIcon className="w-8 h-8" />
                    <p className="text-xs italic">{q.imageUrl.replace("IMAGE:", "")}</p>
                  </div>
                )}

                {q.type === 'pg' && q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-xl border border-gray-50 bg-gray-50/50 group-hover:border-blue-100 transition-colors">
                        <span className="font-bold text-blue-600">{String.fromCharCode(65 + i)}.</span>
                        <span className="text-gray-700 text-sm">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'essay' && (
                  <div className="h-24 w-full border-b border-gray-200 mt-4"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Answer Key Section */}
      <section className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-gray-900">Lembar Jawaban & Kunci</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.answerKey.map((key, i) => (
            <div key={i} className="p-3 bg-green-50/30 rounded-xl border border-green-50 text-sm text-green-800 font-medium text-center">
              {key}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
