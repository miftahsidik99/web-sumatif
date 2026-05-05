/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question, ExamRequest } from "@/src/services/geminiService";
import { Download, FileText, CheckCircle2, Table as TableIcon, Image as ImageIcon } from "lucide-react";
import { motion } from "motion/react";
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
  HeadingLevel
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
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: request.sekolah.toUpperCase(), bold: true, size: 28 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `${request.jenisSumatif} - TAHUN PELAJARAN ${request.thnPel}`, bold: true }),
            ],
          }),

          // Info Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Mata Pelajaran: ${request.mapel}`)] }),
                  new TableCell({ children: [new Paragraph(`Guru: ${request.guru}`)] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(`Kelas/Fase: ${request.kelas}/${request.fase}`)] }),
                  new TableCell({ children: [new Paragraph(`Waktu: 90 Menit`)] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Kisi-kisi Section
          new Paragraph({ text: "KISI-KISI SOAL", heading: HeadingLevel.HEADING_1 }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "No", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Elemen", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Indikator", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Level", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Bentuk", bold: true })] })] }),
                ]
              }),
              ...data.specTable.map(row => new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(String(row.No || row.id || ''))] }),
                  new TableCell({ children: [new Paragraph(String(row.Elemen || ''))] }),
                  new TableCell({ children: [new Paragraph(String(row.Indikator ||row.Indicator || ''))] }),
                  new TableCell({ children: [new Paragraph(String(row.Level || ''))] }),
                  new TableCell({ children: [new Paragraph(String(row.Bentuk || ''))] }),
                ]
              }))
            ]
          }),

          new Paragraph({ text: "", spacing: { before: 400 } }),

          // Questions Section
          new Paragraph({ text: "NASKAH SOAL", heading: HeadingLevel.HEADING_1 }),
          ...data.questions.map(q => [
            new Paragraph({
              spacing: { before: 200 },
              children: [
                new TextRun({ text: `${q.id}. `, bold: true }),
                new TextRun({ text: q.text }),
              ]
            }),
            ...(q.type === 'pg' && q.options ? q.options.map((opt, i) => new Paragraph({
              indent: { left: 720 },
              children: [new TextRun(`${String.fromCharCode(65 + i)}. ${opt}`)]
            })) : [])
          ]).flat(),

          new Paragraph({ text: "", spacing: { before: 400 } }),

          // Answer Key
          new Paragraph({ text: "LEMBAR JAWABAN & KUNCI", heading: HeadingLevel.HEADING_1 }),
          ...data.answerKey.map(val => new Paragraph({ text: val }))
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
