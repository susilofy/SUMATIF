import { Question, TestResult, ExamSettings, StudentInfo } from '../types';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';
import { DEFAULT_GOOGLE_APPS_SCRIPT_URL } from './spreadsheet';

const STORAGE_KEYS = {
  QUESTIONS: 'sd3lt_sumatif_questions',
  RESULTS: 'sd3lt_sumatif_results',
  SETTINGS: 'sd3lt_sumatif_settings',
  ACTIVE_STUDENT: 'sd3lt_sumatif_active_student',
  ACTIVE_ANSWERS: 'sd3lt_sumatif_active_answers',
  SYNC_VERSION: 'sd3lt_sheet_sync_v20260910_source',
};

export const DEFAULT_SETTINGS: ExamSettings = {
  adminPassword: 'GURUADMIN',
  allowShowReviewToStudent: false, // "Jangan tampilkan kunci jawaban kepada siswa kecuali saya mengaktifkan fitur tersebut."
  kktp: 70,
  googleSheetsWebhookUrl: DEFAULT_GOOGLE_APPS_SCRIPT_URL,
  shuffleQuestions: true,
  shuffleOptions: true,
};

// Seed data matching exactly the source data from Google Spreadsheet
export const SEED_RESULTS: TestResult[] = [
  {
    id: 'sheet-row-1',
    timestamp: '10/9/2026, 23.12.38',
    formattedDate: '10/9/2026, 23.12.38',
    nama: 'Uji Coba Sinkronisasi Guru',
    kelas: 'V',
    absen: '0',
    jumlahBenar: 10,
    jumlahSalah: 0,
    nilai: 100,
    status: 'LULUS',
    kktp: 70,
    sekolah: 'SD NEGERI 3 LOLOAN TIMUR',
    mapel: 'Matematika',
    materi: 'Tes Kemampuan Akademik',
    totalSoal: 10,
    studentAnswers: {},
  },
  {
    id: 'sheet-row-2',
    timestamp: '10/09/2026 23:22:21',
    formattedDate: '10/09/2026 23:22:21',
    nama: '-',
    kelas: '-',
    absen: '-',
    jumlahBenar: 0,
    jumlahSalah: 0,
    nilai: 0,
    status: 'BELUM LULUS',
    kktp: 70,
    sekolah: 'SD NEGERI 3 LOLOAN TIMUR',
    mapel: 'Matematika',
    materi: 'Tes Kemampuan Akademik',
    totalSoal: 10,
    studentAnswers: {},
  },
  {
    id: 'sheet-row-3',
    timestamp: '10/9/2026, 15.22.56',
    formattedDate: '10/9/2026, 15.22.56',
    nama: 'Test Fetch Probe',
    kelas: 'V',
    absen: '99',
    jumlahBenar: 10,
    jumlahSalah: 0,
    nilai: 100,
    status: 'LULUS',
    kktp: 70,
    sekolah: 'SD NEGERI 3 LOLOAN TIMUR',
    mapel: 'Matematika',
    materi: 'Tes Kemampuan Akademik',
    totalSoal: 10,
    studentAnswers: {},
  },
];

export function getStoredQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading questions from localStorage:', e);
  }
  return DEFAULT_QUESTIONS;
}

export function saveQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
  } catch (e) {
    console.error('Error saving questions to localStorage:', e);
  }
}

export function syncResultsWithSpreadsheetSource(): TestResult[] {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(SEED_RESULTS));
    localStorage.setItem(STORAGE_KEYS.SYNC_VERSION, 'sd3lt_sheet_sync_v20260910_source');
  } catch (e) {
    console.error('Error syncing results with spreadsheet source:', e);
  }
  return SEED_RESULTS;
}

export function getStoredResults(): TestResult[] {
  try {
    const syncVer = localStorage.getItem(STORAGE_KEYS.SYNC_VERSION);
    if (syncVer !== 'sd3lt_sheet_sync_v20260910_source') {
      // Migrate / reset to match user's Google Spreadsheet data
      return syncResultsWithSpreadsheetSource();
    }

    const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading results from localStorage:', e);
  }
  return syncResultsWithSpreadsheetSource();
}

export function saveResult(result: TestResult): TestResult[] {
  const current = getStoredResults();
  const updated = [result, ...current];
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving result:', e);
  }
  return updated;
}

export function deleteResult(resultId: string): TestResult[] {
  const current = getStoredResults();
  const updated = current.filter((r) => r.id !== resultId);
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify(updated));
  } catch (e) {
    console.error('Error deleting result:', e);
  }
  return updated;
}

export function clearAllResults(): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RESULTS, JSON.stringify([]));
  } catch (e) {
    console.error('Error clearing results:', e);
  }
}

export function getStoredSettings(): ExamSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        googleSheetsWebhookUrl: parsed.googleSheetsWebhookUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL,
      };
    }
  } catch (e) {
    console.error('Error reading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: ExamSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

export function getActiveStudent(): StudentInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActiveStudent(student: StudentInfo | null): void {
  try {
    if (student) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT, JSON.stringify(student));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_STUDENT);
    }
  } catch (e) {
    console.error(e);
  }
}
