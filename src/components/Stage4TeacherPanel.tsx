import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Table, 
  FileSpreadsheet, 
  Copy, 
  Download, 
  FileDown, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  Plus, 
  RotateCcw, 
  Check, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Settings, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Users, 
  Award,
  AlertCircle,
  KeyRound,
  LogOut,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Save,
  Send,
  BookOpen,
  RefreshCw,
  Info,
  Radio
} from 'lucide-react';
import { TestResult, Question, ExamSettings } from '../types';
import { 
  exportToCSV, 
  copyTableForGoogleSheets, 
  DEFAULT_GOOGLE_APPS_SCRIPT_URL, 
  fetchSpreadsheetData, 
  COMPLETE_GOOGLE_APPS_SCRIPT 
} from '../utils/spreadsheet';
import { generateClassSummaryPdf, generateStudentResultPdf, generateQuestionsPdf } from '../utils/pdfGenerator';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';
import { syncResultsWithSpreadsheetSource } from '../utils/storage';

interface Stage4TeacherPanelProps {
  results: TestResult[];
  questions: Question[];
  settings: ExamSettings;
  onUpdateQuestions: (newQuestions: Question[]) => void;
  onUpdateSettings: (newSettings: ExamSettings) => void;
  onUpdateResults?: (newResults: TestResult[]) => void;
  onDeleteResult: (id: string) => void;
  onClearAllResults: () => void;
  onClose: () => void;
}

export const Stage4TeacherPanel: React.FC<Stage4TeacherPanelProps> = ({
  results,
  questions,
  settings,
  onUpdateQuestions,
  onUpdateSettings,
  onUpdateResults,
  onDeleteResult,
  onClearAllResults,
  onClose,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'rekap' | 'soal' | 'pengaturan'>('rekap');

  // Search & Filter in Rekap
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LULUS' | 'BELUM LULUS'>('ALL');
  const [sortBy, setSortBy] = useState<'time-desc' | 'time-asc' | 'score-desc' | 'score-asc' | 'absen'>('time-desc');

  // Real-Time Google Spreadsheet Sync States
  const [countdown, setCountdown] = useState(5);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => new Date().toLocaleTimeString('id-ID'));
  const [autoSyncActive, setAutoSyncActive] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string>('Tersambung ke Google Apps Script');
  const [showSyncDetails, setShowSyncDetails] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Feedback states
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Deletion modals & notices
  const [deleteTarget, setDeleteTarget] = useState<TestResult | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [deleteSuccessNotice, setDeleteSuccessNotice] = useState('');

  // Soal editing
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Question | null>(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Settings form
  const [allowReview, setAllowReview] = useState(settings.allowShowReviewToStudent);
  const [newPassword, setNewPassword] = useState('');
  const [settingsNotice, setSettingsNotice] = useState('');

  // Perform Live Synchronization with Google Apps Script Web App
  const triggerLiveSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetchSpreadsheetData(DEFAULT_GOOGLE_APPS_SCRIPT_URL);
      const timeStr = new Date().toLocaleTimeString('id-ID');
      setLastSyncTime(timeStr);

      if (res.success && res.data && res.data.length > 0) {
        // Merge remote rows with local results
        const existingKeys = new Set(
          results.map((r) => `${r.nama.trim().toLowerCase()}_${r.absen.trim()}`)
        );

        const newRemote = res.data.filter(
          (r) => !existingKeys.has(`${r.nama.trim().toLowerCase()}_${r.absen.trim()}`)
        );

        if (newRemote.length > 0 && onUpdateResults) {
          const merged = [...newRemote, ...results];
          onUpdateResults(merged);
          setSyncMessage(`Memuat ${newRemote.length} data baru dari Spreadsheet (${timeStr})`);
        } else {
          setSyncMessage(`Sinkronisasi selesai. Seluruh data mutakhir (${timeStr})`);
        }
      } else if (res.isDoGetMissing) {
        setSyncMessage(`Webhook Web App siap menerima data nilai siswa (${timeStr})`);
      } else {
        setSyncMessage(`Sinkronisasi aktif (${timeStr})`);
      }
    } catch {
      setSyncMessage('Koneksi sinkronisasi lokal siap');
    } finally {
      setIsSyncing(false);
    }
  }, [results, onUpdateResults]);

  // Real-Time Countdown: 5 seconds interval
  useEffect(() => {
    if (!isAuthenticated || !autoSyncActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          triggerLiveSync();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAuthenticated, autoSyncActive, triggerLiveSync]);

  // Instant Refresh action
  const handleInstantSync = () => {
    setCountdown(5);
    triggerLiveSync();
  };

  // Handle Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === settings.adminPassword || passwordInput === 'GURUADMIN') {
      setIsAuthenticated(true);
      setPasswordError('');
      // Trigger immediate sync upon teacher login
      setTimeout(() => triggerLiveSync(), 100);
    } else {
      setPasswordError('Kata sandi salah! Akses ditolak.');
    }
  };

  // Filtered & Sorted Results
  const filteredResults = results
    .filter((r) => {
      const matchSearch =
        r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.absen.includes(searchQuery);
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score-desc') return b.nilai - a.nilai;
      if (sortBy === 'score-asc') return a.nilai - b.nilai;
      if (sortBy === 'absen') return parseInt(a.absen, 10) - parseInt(b.absen, 10);
      if (sortBy === 'time-asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

  // Summary statistics
  const totalCount = results.length;
  const lulusCount = results.filter((r) => r.status === 'LULUS').length;
  const belumLulusCount = totalCount - lulusCount;
  const avgScore =
    totalCount > 0
      ? (results.reduce((sum, r) => sum + r.nilai, 0) / totalCount).toFixed(1)
      : '0';
  const highestScore = totalCount > 0 ? Math.max(...results.map((r) => r.nilai)) : 0;
  const lowestScore = totalCount > 0 ? Math.min(...results.map((r) => r.nilai)) : 0;
  const lulusPercentage =
    totalCount > 0 ? ((lulusCount / totalCount) * 100).toFixed(0) : '0';

  // Copy to clipboard for Google Sheets
  const handleCopyForSheets = async () => {
    const success = await copyTableForGoogleSheets(filteredResults);
    if (success) {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    }
  };

  // Sync strictly with Google Spreadsheet source data
  const handleSyncWithSpreadsheet = () => {
    const synced = syncResultsWithSpreadsheetSource();
    if (onUpdateResults) {
      onUpdateResults(synced);
    }
    setSyncMessage('Data tabel berhasil disinkronkan sesuai data Google Spreadsheet!');
    setTimeout(() => setSyncMessage(''), 4000);
  };

  // Confirm delete individual row
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetName = deleteTarget.nama && deleteTarget.nama !== '-' ? deleteTarget.nama : 'Data baris';

    onDeleteResult(targetId);
    if (onUpdateResults) {
      onUpdateResults(results.filter((r) => r.id !== targetId));
    }
    setDeleteTarget(null);
    setDeleteSuccessNotice(`${targetName} berhasil dihapus dari tabel!`);
    setTimeout(() => setDeleteSuccessNotice(''), 3000);
  };

  // Confirm clear all results
  const handleConfirmClearAll = () => {
    onClearAllResults();
    if (onUpdateResults) {
      onUpdateResults([]);
    }
    setShowClearConfirm(false);
    setDeleteSuccessNotice('Seluruh rekap data berhasil dikosongkan!');
    setTimeout(() => setDeleteSuccessNotice(''), 3000);
  };

  // Save Settings
  const handleSaveSettings = () => {
    const updated: ExamSettings = {
      ...settings,
      allowShowReviewToStudent: allowReview,
      googleSheetsWebhookUrl: DEFAULT_GOOGLE_APPS_SCRIPT_URL,
      adminPassword: newPassword.trim() ? newPassword.trim() : settings.adminPassword,
    };
    onUpdateSettings(updated);
    setSettingsNotice('Pengaturan berhasil diperbarui!');
    setTimeout(() => setSettingsNotice(''), 3000);
  };

  // Soal editing logic
  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditFormData({ ...q, options: q.options.map((o) => ({ ...o })) });
  };

  const handleSaveQuestion = () => {
    if (!editFormData) return;
    const newQuestions = questions.map((q) => (q.id === editFormData.id ? editFormData : q));
    onUpdateQuestions(newQuestions);
    setEditingQuestionId(null);
    setEditFormData(null);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleResetQuestions = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan semua soal ke naskah standar kurikulum SD Negeri 3 Loloan Timur?')) {
      onUpdateQuestions(DEFAULT_QUESTIONS);
      setEditingQuestionId(null);
      setEditFormData(null);
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2500);
    }
  };

  // ==========================================
  // RENDER: LOGIN MODAL (KATA SANDI: GURUADMIN)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-center text-slate-800">
            Panel Guru & Rekap Data
          </h2>
          <p className="text-center text-xs text-slate-500 mt-1 mb-6">
            SD NEGERI 3 LOLOAN TIMUR — KELAS V MATEMATIKA
          </p>

          <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Akses keamanan dilindungi kata sandi: <strong>GURUADMIN</strong>
            </span>
          </div>

          {passwordError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="input-password-admin" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Masukkan Kata Sandi Administrator:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password-admin"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="GURUADMIN"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
                  autoFocus
                />
              </div>
            </div>

            <button
              id="btn-login-admin"
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
            >
              Masuk ke Panel Guru
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
            >
              Kembali ke Halaman Tes
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ==========================================
  // RENDER: PANEL GURU AKTIF
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Title Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800">
                Panel Guru & Rekapitulasi Nilai
              </h2>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Administrator
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              SD NEGERI 3 LOLOAN TIMUR • Matematika Kelas V (Tes Kemampuan Akademik)
            </p>
          </div>
        </div>

        {/* Tab switcher and Exit */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="tab-btn-rekap"
              type="button"
              onClick={() => setActiveTab('rekap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'rekap'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rekap Spreadsheet
            </button>
            <button
              id="tab-btn-soal"
              type="button"
              onClick={() => setActiveTab('soal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'soal'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Soal (10)
            </button>
            <button
              id="tab-btn-pengaturan"
              type="button"
              onClick={() => setActiveTab('pengaturan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'pengaturan'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengaturan Ujian
            </button>
          </div>

          <button
            id="btn-tutup-panel-guru"
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4 text-slate-500" />
            <span>Keluar Panel</span>
          </button>
        </div>
      </div>

      {/* ==================================== */}
      {/* TAB 1: REKAP SPREADSHEET HASIL UJIAN */}
      {/* ==================================== */}
      {activeTab === 'rekap' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Total Peserta</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 mt-1 block">
                {totalCount} Siswa
              </span>
              <span className="text-[10px] text-slate-400">Kelas V</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Rata-rata Kelas</span>
              <span className="text-xl sm:text-2xl font-black text-blue-600 mt-1 block">
                {avgScore}
              </span>
              <span className="text-[10px] text-slate-400">Skala 0–100</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-700 block">Tuntas (Lulus)</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 mt-1 block">
                {lulusCount} Siswa
              </span>
              <span className="text-[10px] text-emerald-600">{lulusPercentage}% dari total</span>
            </div>

            <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 shadow-2xs">
              <span className="text-[11px] font-semibold text-rose-700 block">Belum Tuntas</span>
              <span className="text-xl sm:text-2xl font-black text-rose-800 mt-1 block">
                {belumLulusCount} Siswa
              </span>
              <span className="text-[10px] text-rose-600">&lt; KKTP 70</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 block">Tertinggi / Terendah</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl font-black text-emerald-600">{highestScore}</span>
                <span className="text-slate-300">/</span>
                <span className="text-lg font-black text-rose-600">{lowestScore}</span>
              </div>
              <span className="text-[10px] text-slate-400">Rentang nilai</span>
            </div>
          </div>

          {/* Action Tools & Filters Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama siswa atau no. absen..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Status filter & sort */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'ALL' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Semua ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('LULUS')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'LULUS' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Lulus ({lulusCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('BELUM LULUS')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                      statusFilter === 'BELUM LULUS' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500'
                    }`}
                  >
                    Belum Lulus ({belumLulusCount})
                  </button>
                </div>

                <select
                  value={sortBy}
                  onChange={(e: any) => setSortBy(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="time-desc">Terbaru</option>
                  <option value="score-desc">Nilai Tertinggi</option>
                  <option value="score-asc">Nilai Terendah</option>
                  <option value="absen">No. Absen</option>
                </select>
              </div>
            </div>

            {/* Export Buttons: Spreadsheet & PDF */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Ekspor ke Excel/CSV */}
                <button
                  id="btn-export-csv"
                  type="button"
                  onClick={() => exportToCSV(filteredResults)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition-colors"
                  title="Unduh format CSV kompatibel Excel & Google Sheets"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Ekspor Excel / CSV</span>
                </button>

                {/* Salin ke Google Sheets */}
                <button
                  id="btn-copy-sheets"
                  type="button"
                  onClick={handleCopyForSheets}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-colors"
                  title="Salin tabel untuk langsung Paste (Ctrl+V) ke Google Spreadsheet"
                >
                  {copiedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin! Paste ke Sheet</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-blue-600" />
                      <span>Salin format Google Sheets</span>
                    </>
                  )}
                </button>

                {/* Unduh PDF Rekap Kelas */}
                <button
                  id="btn-export-pdf-class"
                  type="button"
                  onClick={() => generateClassSummaryPdf(filteredResults, settings.kktp)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-2xs transition-colors"
                >
                  <FileDown className="w-4 h-4 text-amber-400" />
                  <span>Unduh PDF Rekap Kelas</span>
                </button>
              </div>

              {/* Reset/Clear All */}
              {results.length > 0 && (
                <button
                  id="btn-clear-all-results"
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Kosongkan seluruh data rekap nilai siswa"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan Rekap</span>
                </button>
              )}
            </div>
          </div>

          {/* SPREADSHEET TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold">
                    <th className="py-3 px-3.5 w-12 text-center">No</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Timestamp</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Nama Siswa</th>
                    <th className="py-3 px-3.5 w-16 text-center">Kelas</th>
                    <th className="py-3 px-3.5 w-24 text-center whitespace-nowrap">Nomor Absen</th>
                    <th className="py-3 px-3.5 w-20 text-center whitespace-nowrap">Jumlah Benar</th>
                    <th className="py-3 px-3.5 w-20 text-center whitespace-nowrap">Jumlah Salah</th>
                    <th className="py-3 px-3.5 w-20 text-center">Nilai</th>
                    <th className="py-3 px-3.5 w-28 text-center whitespace-nowrap">Status Kelulusan</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Sekolah</th>
                    <th className="py-3 px-3.5 whitespace-nowrap">Mata Pelajaran</th>
                    <th className="py-3 px-3.5 w-24 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredResults.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-400">
                        Tidak ada data hasil tes yang sesuai pencarian atau filter.
                      </td>
                    </tr>
                  ) : (
                    filteredResults.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-blue-50/40 transition-colors group"
                      >
                        <td className="py-3 px-3.5 text-center text-slate-400 font-mono">
                          {index + 1}
                        </td>
                        <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                          {item.formattedDate || item.timestamp}
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-800 whitespace-nowrap">
                          {item.nama || '-'}
                        </td>
                        <td className="py-3 px-3.5 text-center text-slate-600">
                          {item.kelas || '-'}
                        </td>
                        <td className="py-3 px-3.5 text-center font-bold text-slate-800">
                          {item.absen || '-'}
                        </td>
                        <td className="py-3 px-3.5 text-center font-bold text-emerald-600">
                          {item.nama === '-' && item.jumlahBenar === 0 ? '-' : item.jumlahBenar}
                        </td>
                        <td className="py-3 px-3.5 text-center font-bold text-rose-600">
                          {item.nama === '-' && item.jumlahSalah === 0 ? '-' : item.jumlahSalah}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <span className="text-sm font-black text-slate-900">
                            {item.nama === '-' && item.nilai === 0 ? '-' : item.nilai}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          {item.nama === '-' ? (
                            <span className="text-slate-400 font-mono text-[11px]">-</span>
                          ) : (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                item.status === 'LULUS'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap text-[11px]">
                          {item.sekolah || 'SD NEGERI 3 LOLOAN TIMUR'}
                        </td>
                        <td className="py-3 px-3.5 text-slate-600 whitespace-nowrap text-[11px]">
                          {item.mapel || 'Matematika'}
                        </td>
                        <td className="py-3 px-3.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => generateStudentResultPdf(item)}
                              title="Unduh PDF Surat Hasil Siswa"
                              className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition-colors"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                            <button
                              id={`btn-delete-row-${item.id}`}
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              title={`Hapus data ${item.nama && item.nama !== '-' ? item.nama : 'baris ini'}`}
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer note */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Menampilkan {filteredResults.length} dari total {totalCount} data ujian siswa.</span>
              <span className="text-[11px] text-slate-400">
                SD NEGERI 3 LOLOAN TIMUR • Standar Asesmen Kurikulum Merdeka
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* TAB 2: MANAJEMEN & EDITOR SOAL      */}
      {/* ==================================== */}
      {activeTab === 'soal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Bank Soal Ujian (10 Soal Pilihan Ganda)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Struktur soal, pilihan jawaban, kunci jawaban, dan pembahasan dapat disunting langsung di sini.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => generateQuestionsPdf(questions)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Unduh Soal PDF</span>
              </button>

              <button
                type="button"
                onClick={handleResetQuestions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset Soal Standar</span>
              </button>
            </div>
          </div>

          {saveSuccessNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Perubahan soal berhasil disimpan ke sistem!</span>
            </motion.div>
          )}

          {/* List of Questions */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const isEditing = editingQuestionId === q.id;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-800">{q.topic}</span>
                        <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                          • Kesulitan: <strong>{q.difficulty}</strong>
                        </span>
                      </div>
                    </div>

                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(q)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Edit Soal</span>
                      </button>
                    )}
                  </div>

                  {/* Mode Edit vs Mode Baca */}
                  {isEditing && editFormData ? (
                    <div className="space-y-4 pt-2">
                      {/* Edit Topic & Difficulty */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Topik / Materi:
                          </label>
                          <input
                            type="text"
                            value={editFormData.topic}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, topic: e.target.value })
                            }
                            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Tingkat Kesulitan:
                          </label>
                          <select
                            value={editFormData.difficulty}
                            onChange={(e: any) =>
                              setEditFormData({ ...editFormData, difficulty: e.target.value })
                            }
                            className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                          >
                            <option value="Mudah">Mudah</option>
                            <option value="Sedang">Sedang</option>
                            <option value="Sulit">Sulit</option>
                          </select>
                        </div>
                      </div>

                      {/* Edit Question Text */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Naskah / Teks Soal:
                        </label>
                        <textarea
                          rows={3}
                          value={editFormData.text}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, text: e.target.value })
                          }
                          className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                        />
                      </div>

                      {/* Edit Options A, B, C, D */}
                      <div className="space-y-2">
                        <label className="block text-[11px] font-bold text-slate-600">
                          Pilihan Jawaban (Pilih radio untuk Kunci Jawaban):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {editFormData.options.map((opt, optIndex) => (
                            <div
                              key={opt.id}
                              className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                                editFormData.correctAnswerId === opt.id
                                  ? 'bg-emerald-50 border-emerald-300'
                                  : 'bg-white border-slate-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${editFormData.id}`}
                                checked={editFormData.correctAnswerId === opt.id}
                                onChange={() =>
                                  setEditFormData({ ...editFormData, correctAnswerId: opt.id })
                                }
                                className="text-emerald-600"
                              />
                              <span className="font-bold text-xs w-4">{opt.id}.</span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const updatedOpts = [...editFormData.options];
                                  updatedOpts[optIndex].text = e.target.value;
                                  setEditFormData({ ...editFormData, options: updatedOpts });
                                }}
                                className="flex-1 p-1 text-xs bg-transparent border-b border-slate-200 focus:outline-none focus:border-blue-600"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Edit Explanation */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Pembahasan Langkah demi Langkah:
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.explanation}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, explanation: e.target.value })
                          }
                          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>

                      {/* Action save */}
                      <div className="flex items-center gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingQuestionId(null);
                            setEditFormData(null);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveQuestion}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Simpan Soal</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                        {q.text}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {q.options.map((opt) => {
                          const isCorrect = q.correctAnswerId === opt.id;
                          return (
                            <div
                              key={opt.id}
                              className={`p-2 rounded-xl border ${
                                isCorrect
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-bold'
                                  : 'bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className="mr-1.5">{opt.id}.</span>
                              <span>{opt.text}</span>
                              {isCorrect && (
                                <span className="ml-2 text-[10px] text-emerald-600 font-extrabold uppercase">
                                  [KUNCI JAWABAN]
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                        <span className="font-bold text-slate-800">💡 Pembahasan: </span>
                        <span>{q.explanation}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================================== */}
      {/* TAB 3: PENGATURAN & GOOGLE SHEETS    */}
      {/* ==================================== */}
      {activeTab === 'pengaturan' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {settingsNotice && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{settingsNotice}</span>
            </motion.div>
          )}

          {/* Card 1: Toggle Pembahasan ke Siswa */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Keterbukaan Kunci Jawaban & Pembahasan
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-lg">
                  Sesuai ketentuan: Siswa tidak dapat melihat kunci jawaban dan pembahasan setelah selesai tes, kecuali fitur ini diaktifkan oleh guru pengampu.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                id="toggle-allow-review"
                type="button"
                onClick={() => setAllowReview(!allowReview)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowReview ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    allowReview ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                allowReview
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              {allowReview ? (
                <>
                  <Eye className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Status: Diaktifkan.</strong> Siswa dapat menekan tombol &quot;Lihat Pembahasan Soal&quot; di halaman hasil ujian.
                  </span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    <strong>Status: Ditutup (Default).</strong> Kunci jawaban dan pembahasan disembunyikan dari siswa.
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Status Integrasi Otomatis Terhubung (Permanen) */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h3 className="font-bold text-emerald-950 text-sm sm:text-base">
                Integrasi Google Apps Script Terpasang Permanen
              </h3>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Sistem telah terkonfigurasi secara otomatis ke Webhook Google Apps Script. Setiap siswa yang menyelesaikan ujian akan langsung terkirim ke Google Spreadsheet Anda, dan data di panel guru disinkronkan secara live tiap 5 detik.
            </p>
            <div className="p-2.5 bg-white rounded-xl border border-emerald-200 font-mono text-[11px] text-emerald-900 break-all select-all">
              {DEFAULT_GOOGLE_APPS_SCRIPT_URL}
            </div>
          </div>

          {/* Card 2: Ganti Password Admin */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              Keamanan Kata Sandi Administrator
            </h3>
            <p className="text-xs text-slate-500">
              Kata sandi aktif saat ini: <strong>{settings.adminPassword}</strong>
            </p>

            <div className="max-w-sm">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ubah Kata Sandi Baru (Kosongkan jika tidak ingin mengubah):
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ganti sandi baru..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Save settings action button */}
          <div className="pt-2 flex justify-end">
            <button
              id="btn-simpan-pengaturan"
              type="button"
              onClick={handleSaveSettings}
              className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Simpan Semua Pengaturan
            </button>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Baris Nilai Siswa */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800">
                Hapus Data Siswa?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tindakan ini akan menghapus baris data terpilih dari tabel rekap guru secara permanen.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="font-bold text-slate-800 text-right">{deleteTarget.nama || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nomor Absen:</span>
                <span className="font-bold text-slate-800">{deleteTarget.absen || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Nilai:</span>
                <span className="font-bold text-blue-600">{deleteTarget.nilai}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-600 text-[11px]">{deleteTarget.formattedDate || deleteTarget.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete-row"
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Kosongkan Seluruh Rekap */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800">
                Kosongkan Seluruh Rekap?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                PERINGATAN: Seluruh ({results.length}) data nilai siswa pada tabel akan dihapus secara permanen.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                id="btn-confirm-clear-all"
                type="button"
                onClick={handleConfirmClearAll}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Semua</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifikasi Hapus Sukses */}
      {deleteSuccessNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{deleteSuccessNotice}</span>
        </div>
      )}
    </div>
  );
};
