import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  FileDown, 
  User, 
  Hash, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { StudentInfo, ShuffledQuestion } from '../types';

interface Stage2ExamProps {
  student: StudentInfo;
  questions: ShuffledQuestion[];
  answers: Record<string, string>;
  onSelectAnswer: (questionId: string, optionId: string) => void;
  onSubmitExam: () => void;
  onDownloadPdf: () => void;
}

export const Stage2Exam: React.FC<Stage2ExamProps> = ({
  student,
  questions,
  answers,
  onSelectAnswer,
  onSubmitExam,
  onDownloadPdf,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Count answered
  const answeredCount = questions.filter((q) => !!answers[q.originalId]).length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);
  const isAllAnswered = answeredCount === totalQuestions;
  const unansweredCount = totalQuestions - answeredCount;

  const currentSelectedOptionId = answers[currentQuestion.originalId];

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleOpenConfirm = () => {
    if (!isAllAnswered) return;
    setShowConfirmModal(true);
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Mudah':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sedang':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Sulit':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header Card: Siswa & Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Student details */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold text-sm">
              {student.absen}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Peserta Ujian:</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  Kelas {student.kelas}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-tight">
                {student.nama}
              </h3>
            </div>
          </div>

          {/* Download PDF & Actions */}
          <div className="flex items-center gap-2 justify-between md:justify-end">
            <button
              id="btn-download-pdf-exam"
              type="button"
              onClick={onDownloadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              title="Unduh Naskah Soal PDF"
            >
              <FileDown className="w-4 h-4 text-blue-600" />
              <span>Unduh Soal PDF</span>
            </button>

            <div className="text-right pl-2 border-l border-slate-200">
              <span className="text-[11px] text-slate-400 font-medium block">Status Terjawab</span>
              <span className="text-xs sm:text-sm font-black text-slate-800">
                {answeredCount} / {totalQuestions} Soal ({progressPercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isAllAnswered ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Exam Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Soal Aktif & Opsi Jawaban */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-xs">
            {/* Header Soal */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-2xs">
                  Soal Nomor {currentIndex + 1}
                </span>
                <span className="text-xs text-slate-400">
                  dari {totalQuestions} soal
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getDifficultyBadge(
                    currentQuestion.difficulty
                  )}`}
                >
                  {currentQuestion.difficulty}
                </span>
                <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                  • {currentQuestion.topic}
                </span>
              </div>
            </div>

            {/* Teks Soal */}
            <div className="mb-6">
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium">
                {currentQuestion.text}
              </p>
            </div>

            {/* Pilihan Jawaban (A, B, C, D) */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Pilih Jawaban Anda:
              </p>

              {currentQuestion.options.map((option) => {
                const isSelected = currentSelectedOptionId === option.id;

                return (
                  <button
                    key={option.id}
                    id={`opt-${currentQuestion.originalId}-${option.id}`}
                    type="button"
                    onClick={() => onSelectAnswer(currentQuestion.originalId, option.id)}
                    className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-start gap-3.5 cursor-pointer select-none ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {/* Option circle letter */}
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {option.label}
                    </div>

                    {/* Option Text */}
                    <span
                      className={`text-xs sm:text-sm pt-0.5 leading-snug ${
                        isSelected ? 'font-semibold text-blue-950' : 'text-slate-800'
                      }`}
                    >
                      {option.text}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigasi Bawah: Sebelumnya & Berikutnya / Kirim */}
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                id="btn-soal-sebelumnya"
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < totalQuestions - 1 ? (
                  <button
                    id="btn-soal-berikutnya"
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    id="btn-soal-selesai"
                    type="button"
                    onClick={handleOpenConfirm}
                    disabled={!isAllAnswered}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all ${
                      isAllAnswered
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    <span>Selesai / Kirim Jawaban</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Palet Nomor Soal & Quick Action */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h4 className="font-bold text-slate-800 text-sm mb-1 flex items-center justify-between">
              <span>Navigasi Nomor Soal</span>
              <span className="text-[11px] font-normal text-slate-500">
                Klik nomor untuk lompat
              </span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Nomor hijau menandakan soal sudah Anda jawab.
            </p>

            {/* Grid 10 Soal */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.originalId];
                const isActive = idx === currentIndex;

                return (
                  <button
                    key={q.originalId}
                    id={`palette-btn-${idx + 1}`}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-11 rounded-xl text-xs sm:text-sm font-bold flex flex-col items-center justify-center transition-all relative ${
                      isActive
                        ? 'ring-2 ring-blue-600 ring-offset-2 z-10'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isAnswered && (
                      <span className="text-[9px] leading-none opacity-90">✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Terjawab ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300" />
                <span>Belum ({unansweredCount})</span>
              </div>
            </div>

            {/* Submit banner if not all answered */}
            {!isAllAnswered ? (
              <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Anda harus menjawab seluruh <strong>10 soal</strong> sebelum dapat mengirimkan ujian. ({unansweredCount} soal tersisa)
                </span>
              </div>
            ) : (
              <div className="mt-4">
                <button
                  id="btn-kirim-sekarang-sidebar"
                  type="button"
                  onClick={handleOpenConfirm}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Jawaban Sekarang</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI PENGIRIMAN JAWABAN */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
                Konfirmasi Pengiriman Ujian
              </h3>

              <p className="text-center text-slate-600 text-xs sm:text-sm mb-5 leading-relaxed">
                Apakah Anda yakin ingin mengirim jawaban? Setelah dikirim, jawaban tidak dapat diubah kembali dan hasil nilai akan langsung dihitung.
              </p>

              {/* Rekap ringkas */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 mb-6 text-xs text-slate-700 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Siswa:</span>
                  <span className="font-semibold text-slate-800">{student.nama}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nomor Absen:</span>
                  <span className="font-semibold text-slate-800">{student.absen}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Pengisian:</span>
                  <span className="font-bold text-emerald-600">
                    10 dari 10 Soal Telah Dijawab (100%)
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="btn-batal-kirim"
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
                >
                  Periksa Kembali
                </button>
                <button
                  id="btn-konfirmasi-kirim"
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    onSubmitExam();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
                >
                  Ya, Kirim Jawaban
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
