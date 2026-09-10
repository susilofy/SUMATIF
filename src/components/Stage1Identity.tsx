import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Hash, 
  Play, 
  FileDown, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Award,
  Sparkles
} from 'lucide-react';
import { StudentInfo, Question } from '../types';
import { generateQuestionsPdf } from '../utils/pdfGenerator';

interface Stage1IdentityProps {
  onStartExam: (student: StudentInfo) => void;
  questions: Question[];
  kktp: number;
}

export const Stage1Identity: React.FC<Stage1IdentityProps> = ({
  onStartExam,
  questions,
  kktp,
}) => {
  const [nama, setNama] = useState('');
  const [absen, setAbsen] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = nama.trim();
    const cleanAbsen = absen.trim();

    if (!cleanNama) {
      setErrorMsg('Nama lengkap siswa wajib diisi!');
      return;
    }
    if (!cleanAbsen) {
      setErrorMsg('Nomor absen siswa wajib diisi!');
      return;
    }
    const absenNum = parseInt(cleanAbsen, 10);
    if (isNaN(absenNum) || absenNum < 1 || absenNum > 60) {
      setErrorMsg('Nomor absen harus berupa angka yang valid (1 - 60)!');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    const studentInfo: StudentInfo = {
      nama: cleanNama,
      absen: String(absenNum).padStart(2, '0'),
      kelas: 'V',
      sekolah: 'SD NEGERI 3 LOLOAN TIMUR',
      mapel: 'Matematika',
      materi: 'Tes Kemampuan Akademik',
    };

    setTimeout(() => {
      onStartExam(studentInfo);
    }, 200);
  };

  const handleDownloadPdf = () => {
    generateQuestionsPdf(questions);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Banner Identitas Ujian */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden mb-8"
      >
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 border border-blue-400/40 text-blue-100 text-xs font-semibold backdrop-blur-xs">
              <GraduationCap className="w-3.5 h-3.5" />
              Asesmen Sumatif Semester • Tahun Ajaran 2026/2027
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Tes Kemampuan Akademik Matematika
            </h2>
            <p className="text-blue-100 text-sm sm:text-base font-medium max-w-xl">
              SD NEGERI 3 LOLOAN TIMUR — KELAS V (LIMA)
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/15 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-blue-200">
              <Award className="w-4 h-4 text-amber-300" />
              <span>Standar KKTP</span>
            </div>
            <span className="text-2xl font-black text-amber-300 tracking-tight">
              {kktp} Poin
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid: Form Identitas & Kartu Petunjuk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Kolom Kiri: Form Identitas Siswa */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs"
        >
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Tahap 1 — Identitas Siswa
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Silakan lengkapi nama dan nomor absen Anda sebelum memulai pengerjaan soal.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Input Nama Lengkap */}
            <div>
              <label htmlFor="input-nama-lengkap" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Nama Lengkap Siswa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-nama-lengkap"
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: I Putu Arya Pratama"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gunakan nama lengkap sesuai daftar hadir kelas.
              </p>
            </div>

            {/* Input Nomor Absen */}
            <div>
              <label htmlFor="input-nomor-absen" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                Nomor Absen <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  id="input-nomor-absen"
                  type="number"
                  min="1"
                  max="60"
                  value={absen}
                  onChange={(e) => setAbsen(e.target.value)}
                  placeholder="Contoh: 01 atau 14"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Masukkan angka 1 sampai 60.
              </p>
            </div>

            {/* Read-only info badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="block text-[11px] text-slate-400 font-medium">Kelas</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">Kelas V (Lima)</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="block text-[11px] text-slate-400 font-medium">Mata Pelajaran</span>
                <span className="text-xs sm:text-sm font-bold text-slate-700">Matematika</span>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                id="btn-mulai-tes"
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-70"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{isSubmitting ? 'Menyiapkan Soal...' : 'Mulai Tes Sekarang'}</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Kolom Kanan: Petunjuk & Info Ujian */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-5 space-y-4"
        >
          {/* Card Aturan & Petunjuk */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Petunjuk Pelaksanaan Ujian
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>10 Soal Pilihan Ganda:</strong> Soal dan opsi pilihan jawaban akan <strong>diacak</strong> secara otomatis.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Wajib Dijawab Seluruhnya:</strong> Anda tidak dapat mengirim tes sebelum ke-10 soal selesai dijawab.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>KKTP 70 Poin:</strong> Kriteria Ketercapaian Tujuan Pembelajaran adalah minimal 70.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Rekap Otomatis:</strong> Hasil tes akan langsung tercatat di sistem rekapitulasi data guru.
                </span>
              </li>
            </ul>
          </div>

          {/* Card Unduh File Soal PDF */}
          <div className="bg-blue-50/70 rounded-2xl border border-blue-200/80 p-5 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
                <FileDown className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-800 text-sm">
                  Unduh Naskah Soal (PDF)
                </h5>
                <p className="text-xs text-slate-600">
                  Guru atau siswa dapat mengunduh lembar soal resmi ber-kop SD Negeri 3 Loloan Timur untuk arsip atau cetak offline.
                </p>
                <div className="pt-2">
                  <button
                    id="btn-download-pdf-stage1"
                    type="button"
                    onClick={handleDownloadPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 shadow-2xs transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    Unduh Soal PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
