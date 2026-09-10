export interface QuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface Question {
  id: string;
  number: number;
  text: string;
  options: QuestionOption[];
  correctAnswerId: string; // 'A' | 'B' | 'C' | 'D'
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  explanation: string;
  topic: string;
}

export interface StudentInfo {
  nama: string;
  absen: string;
  kelas: string;
  sekolah: string;
  mapel: string;
  materi: string;
}

export interface TestResult {
  id: string;
  timestamp: string;
  formattedDate: string;
  nama: string;
  absen: string;
  kelas: string;
  sekolah: string;
  mapel: string;
  materi: string;
  totalSoal: number;
  jumlahBenar: number;
  jumlahSalah: number;
  nilai: number; // 0 - 100
  status: 'LULUS' | 'BELUM LULUS';
  kktp: number; // default 70
  studentAnswers: Record<string, string>; // questionId -> selectedOptionId
}

export interface ExamSettings {
  adminPassword: string;
  allowShowReviewToStudent: boolean;
  kktp: number;
  googleSheetsWebhookUrl: string;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
}

export interface ShuffledQuestion {
  originalId: string;
  displayNumber: number;
  text: string;
  options: {
    id: string; // original option ID ('A', 'B', etc)
    label: string; // current display label ('A', 'B', 'C', 'D')
    text: string;
  }[];
  correctAnswerId: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sulit';
  explanation: string;
  topic: string;
}
