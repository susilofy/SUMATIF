import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  Award, 
  FileDown, 
  RotateCcw, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  BookOpen, 
  User, 
  Hash, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { TestResult, Question } from '../types';
import { generateStudentResultPdf } from '../utils/pdfGenerator';

interface Stage3ResultProps {
  result: TestResult;
  questions: Question[];
  allowShowReview: boolean;
  onRestart: () => void;
  onOpenTeacherPanel: () => void;
}

export const Stage3Result: React.FC<Stage3ResultProps> = ({
  result,
  questions,
  allowShowReview,
  onRestart,
  onOpenTeacherPanel,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const isLulus = result.status === 'LULUS';

  useEffect(() => {
    if (isLulus) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899'],
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [isLulus]);

  const handleDownloadPdf = () => {
    generateStudentResultPdf(result);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Kartu Utama Hasil Tes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Header Hasil Banner */}
        <div
          className={`p-6 sm:p-8 text-center text-white ${
            isLulus
              ? 'bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700'
          }`}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20">
            <Award className="w-4 h-4 text-amber-300" />
            <span>Asesmen Sumatif Matematika — SD Negeri 3 Loloan Timur</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isLulus ? 'Selamat! Anda Dinyatakan Lulus' : 'Hasil Asesmen: Belum Lulus'}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            {isLulus
              ? 'Pencapaian Anda telah memenuhi Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).'
              : 'Nilai Anda belum memenuhi batas KKTP 70. Tetap semangat dan pelajari materi kembali.'}
          </p>

          {/* Skor Lingkaran Besar */}
          <div className="mt-6 inline-flex flex-col items-center justify-center p-6 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 shadow-inner">
            <span className="text-xs uppercase font-bold tracking-widest text-white/75">
              Nilai Akhir
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
                {result.nilai}
              </span>
              <span className="text-lg font-medium text-white/70">/ 100</span>
            </div>
            <div className="mt-2 text-xs font-semibold px-3 py-0.5 rounded-full bg-white text-slate-800 shadow-2xs">
              KKTP: {result.kktp}
            </div>
          </div>
        </div>

        {/* Konten Detail Siswa & Perolehan Soal */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Identitas Siswa */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 sm:p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Identitas Peserta Ujian
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <span className="block text-slate-400 text-[11px] mb-0.5">Nama Lengkap</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  {result.nama}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 text-[11px] mb-0.5">Nomor Absen</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-blue-600" />
                  Absen {result.absen}
                </span>
              </div>
              <div>
                <span className="block text-slate-400 text-[11px] mb-0.5">Kelas & Sekolah</span>
                <span className="font-semibold text-slate-700">
                  Kelas {result.kelas} • SD N 3 Loloan Timur
                </span>
              </div>
              <div>
                <span className="block text-slate-400 text-[11px] mb-0.5">Waktu Selesai</span>
                <span className="font-medium text-slate-600 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {result.formattedDate}
                </span>
              </div>
            </div>
          </div>

          {/* Rincian Skor & Metrik */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-2xs">
              <span className="block text-[11px] text-slate-400 font-medium">Total Soal</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block">
                {result.totalSoal}
              </span>
              <span className="text-[10px] text-slate-400">Pilihan Ganda</span>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-center shadow-2xs">
              <span className="block text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Jawaban Benar
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
                {result.jumlahBenar}
              </span>
              <span className="text-[10px] text-emerald-600">+{result.jumlahBenar * 10} Poin</span>
            </div>

            <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-4 text-center shadow-2xs">
              <span className="block text-[11px] text-rose-600 font-semibold flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> Jawaban Salah
              </span>
              <span className="text-xl sm:text-2xl font-black text-rose-700 mt-1 block">
                {result.jumlahSalah}
              </span>
              <span className="text-[10px] text-rose-500">0 Poin</span>
            </div>

            <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-center shadow-2xs">
              <span className="block text-[11px] text-blue-600 font-semibold">Status KKTP</span>
              <span
                className={`text-sm sm:text-base font-black mt-2 inline-block px-2.5 py-0.5 rounded-full ${
                  isLulus
                    ? 'bg-emerald-600 text-white'
                    : 'bg-rose-600 text-white'
                }`}
              >
                {result.status}
              </span>
              <span className="text-[10px] text-blue-500 block mt-1">KKTP: 70</span>
            </div>
          </div>

          {/* Pengaturan Kunci Jawaban */}
          {allowShowReview ? (
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-indigo-900 text-xs sm:text-sm">
                <Eye className="w-5 h-5 text-indigo-600 shrink-0" />
                <span>
                  <strong>Fitur Pembahasan Aktif:</strong> Guru mengizinkan Anda meninjau kunci jawaban dan pembahasan lengkap setiap soal.
                </span>
              </div>
              <button
                id="btn-lihat-pembahasan"
                type="button"
                onClick={() => setShowReviewModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lihat Pembahasan Soal</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-3 text-slate-500 text-xs">
              <EyeOff className="w-5 h-5 text-slate-400 shrink-0" />
              <span>
                <strong>Kunci Jawaban Ditutup:</strong> Demi kerahasiaan dan integritas asesmen, pembahasan dan kunci jawaban saat ini dinonaktifkan oleh guru pengampu.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              id="btn-unduh-pdf-hasil"
              type="button"
              onClick={handleDownloadPdf}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Unduh Lembar Hasil (PDF)</span>
            </button>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                id="btn-ulang-tes"
                type="button"
                onClick={onRestart}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ujian Siswa Baru</span>
              </button>

              <button
                id="btn-masuk-panel-guru-from-result"
                type="button"
                onClick={onOpenTeacherPanel}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Panel Guru</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* MODAL PEMBAHASAN JAWABAN (JIKA DIAKTIFKAN GURU) */}
      <AnimatePresence>
        {showReviewModal && allowShowReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                      Pembahasan Soal Matematika
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluasi jawaban Anda dan pelajari pembahasan terperinci setiap nomor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Questions list */}
              <div className="overflow-y-auto space-y-6 pr-1 divide-y divide-slate-100">
                {questions.map((q, idx) => {
                  const studentAns = result.studentAnswers[q.id];
                  const isCorrect = studentAns === q.correctAnswerId;
                  const correctOpt = q.options.find((o) => o.id === q.correctAnswerId);
                  const studentOpt = q.options.find((o) => o.id === studentAns);

                  return (
                    <div key={q.id} className="pt-5 first:pt-0 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {q.topic}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Benar (+10)
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Salah (0)
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-slate-800 text-xs sm:text-sm font-medium leading-relaxed">
                        {q.text}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div
                          className={`p-2.5 rounded-xl border ${
                            isCorrect
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : 'bg-rose-50 border-rose-200 text-rose-800'
                          }`}
                        >
                          <span className="font-semibold block text-[11px] mb-0.5">
                            Jawaban Anda:
                          </span>
                          <span>
                            {studentOpt ? `${studentOpt.id}. ${studentOpt.text}` : 'Tidak dijawab'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl border bg-emerald-50/50 border-emerald-200 text-emerald-900">
                          <span className="font-semibold block text-[11px] mb-0.5 text-emerald-700">
                            Kunci Jawaban Benar:
                          </span>
                          <span>
                            {correctOpt ? `${correctOpt.id}. ${correctOpt.text}` : '-'}
                          </span>
                        </div>
                      </div>

                      {/* Explanation box */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                        <span className="font-bold text-slate-800 block mb-1">
                          💡 Pembahasan:
                        </span>
                        <p className="leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors"
                >
                  Tutup Pembahasan
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
