import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Stage1Identity } from './components/Stage1Identity';
import { Stage2Exam } from './components/Stage2Exam';
import { Stage3Result } from './components/Stage3Result';
import { Stage4TeacherPanel } from './components/Stage4TeacherPanel';
import { 
  StudentInfo, 
  TestResult, 
  Question, 
  ExamSettings, 
  ShuffledQuestion 
} from './types';
import { 
  getStoredQuestions, 
  saveQuestions, 
  getStoredResults, 
  saveResult, 
  deleteResult, 
  clearAllResults, 
  getStoredSettings, 
  saveSettings 
} from './utils/storage';
import { prepareShuffledExam } from './utils/shuffle';
import { generateQuestionsPdf } from './utils/pdfGenerator';
import { sendResultToGoogleSheet, DEFAULT_GOOGLE_APPS_SCRIPT_URL } from './utils/spreadsheet';

export default function App() {
  // App navigation stage: 1, 2, 3, or 4
  const [currentStage, setCurrentStage] = useState<'stage1' | 'stage2' | 'stage3' | 'stage4'>('stage1');
  const [previousStage, setPreviousStage] = useState<'stage1' | 'stage2' | 'stage3'>('stage1');

  // Core Data
  const [questions, setQuestions] = useState<Question[]>(getStoredQuestions);
  const [results, setResults] = useState<TestResult[]>(getStoredResults);
  const [settings, setSettings] = useState<ExamSettings>(getStoredSettings);

  // Active exam session
  const [activeStudent, setActiveStudent] = useState<StudentInfo | null>(null);
  const [shuffledExam, setShuffledExam] = useState<ShuffledQuestion[]>([]);
  const [studentAnswers, setStudentAnswers] = useState<Record<string, string>>({});
  const [latestResult, setLatestResult] = useState<TestResult | null>(null);

  // Synchronize questions when updated in Teacher Panel
  const handleUpdateQuestions = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    saveQuestions(newQuestions);
  };

  // Synchronize settings
  const handleUpdateSettings = (newSettings: ExamSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Delete individual result
  const handleDeleteResult = (id: string) => {
    const updated = deleteResult(id);
    setResults(updated);
  };

  // Clear all results
  const handleClearAllResults = () => {
    clearAllResults();
    setResults([]);
  };

  // Stage 1 -> Start Exam
  const handleStartExam = (student: StudentInfo) => {
    setActiveStudent(student);
    const prepared = prepareShuffledExam(questions);
    setShuffledExam(prepared);
    setStudentAnswers({});
    setCurrentStage('stage2');
  };

  // Stage 2 -> Answer Question
  const handleSelectAnswer = (questionId: string, optionId: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  // Stage 2 -> Submit Exam
  const handleSubmitExam = () => {
    if (!activeStudent || shuffledExam.length === 0) return;

    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      const studentChosen = studentAnswers[q.id];
      if (studentChosen && studentChosen === q.correctAnswerId) {
        correctCount++;
      }
    });

    const total = questions.length;
    const wrongCount = total - correctCount;
    const finalScore = Math.round((correctCount / total) * 100);
    const isPassed = finalScore >= settings.kktp;

    const now = new Date();
    const formattedDate = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const newResult: TestResult = {
      id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: now.toISOString(),
      formattedDate: formattedDate,
      nama: activeStudent.nama,
      absen: activeStudent.absen,
      kelas: activeStudent.kelas,
      sekolah: activeStudent.sekolah,
      mapel: activeStudent.mapel,
      materi: activeStudent.materi,
      totalSoal: total,
      jumlahBenar: correctCount,
      jumlahSalah: wrongCount,
      nilai: finalScore,
      status: isPassed ? 'LULUS' : 'BELUM LULUS',
      kktp: settings.kktp,
      studentAnswers: { ...studentAnswers },
    };

    // Save to local storage and state
    const updatedResults = saveResult(newResult);
    setResults(updatedResults);
    setLatestResult(newResult);

    // Auto-send to Google Sheets Webhook
    sendResultToGoogleSheet(
      newResult,
      settings.googleSheetsWebhookUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL
    ).catch((err) => console.error('Auto webhook send failed:', err));

    setCurrentStage('stage3');
  };

  // Stage 3 -> Restart new exam
  const handleRestart = () => {
    setActiveStudent(null);
    setStudentAnswers({});
    setLatestResult(null);
    setCurrentStage('stage1');
  };

  // Open Teacher Panel
  const handleOpenTeacherPanel = () => {
    if (currentStage !== 'stage4') {
      setPreviousStage(currentStage);
      setCurrentStage('stage4');
    }
  };

  // Close Teacher Panel
  const handleCloseTeacherPanel = () => {
    setCurrentStage(previousStage || 'stage1');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Universal School Header */}
      <Header
        onOpenAdmin={handleOpenTeacherPanel}
        isAdminLoggedIn={currentStage === 'stage4'}
      />

      {/* Main Multi-Stage Router */}
      <main className="flex-1">
        {/* TAHAP 1 — IDENTITAS SISWA */}
        {currentStage === 'stage1' && (
          <Stage1Identity
            onStartExam={handleStartExam}
            questions={questions}
            kktp={settings.kktp}
          />
        )}

        {/* TAHAP 2 — SOAL TES (10 Pilihan Ganda, Diacak) */}
        {currentStage === 'stage2' && activeStudent && (
          <Stage2Exam
            student={activeStudent}
            questions={shuffledExam}
            answers={studentAnswers}
            onSelectAnswer={handleSelectAnswer}
            onSubmitExam={handleSubmitExam}
            onDownloadPdf={() => generateQuestionsPdf(questions)}
          />
        )}

        {/* TAHAP 3 — HASIL TES (Skor, KKTP 70, Lulus/Belum Lulus, PDF) */}
        {currentStage === 'stage3' && latestResult && (
          <Stage3Result
            result={latestResult}
            questions={questions}
            allowShowReview={settings.allowShowReviewToStudent}
            onRestart={handleRestart}
            onOpenTeacherPanel={handleOpenTeacherPanel}
          />
        )}

        {/* TAHAP 4 — REKAP DATA & PANEL GURU (Password: GURUADMIN) */}
        {currentStage === 'stage4' && (
          <Stage4TeacherPanel
            results={results}
            questions={questions}
            settings={settings}
            onUpdateQuestions={handleUpdateQuestions}
            onUpdateSettings={handleUpdateSettings}
            onUpdateResults={(newResults) => {
              setResults(newResults);
              try {
                localStorage.setItem('sd3lt_sumatif_results', JSON.stringify(newResults));
              } catch (e) {
                console.error('Error saving updated results to localStorage:', e);
              }
            }}
            onDeleteResult={handleDeleteResult}
            onClearAllResults={handleClearAllResults}
            onClose={handleCloseTeacherPanel}
          />
        )}
      </main>

      {/* Modern Compact Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>SD NEGERI 3 LOLOAN TIMUR</strong>. Semua Hak Cipta Dilindungi.
          </span>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Kurikulum Merdeka</span>
            <span>•</span>
            <span>Asesmen Sumatif Matematika Kelas V</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
