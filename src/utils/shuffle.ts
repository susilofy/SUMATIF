import { Question, ShuffledQuestion } from '../types';

// Fisher-Yates shuffle algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function prepareShuffledExam(questions: Question[]): ShuffledQuestion[] {
  // 1. Acak urutan soal
  const shuffledQuestions = shuffleArray(questions);

  // 2. Acak pilihan jawaban di tiap soal namun tetap beri label A, B, C, D
  const standardLabels = ['A', 'B', 'C', 'D'];

  return shuffledQuestions.map((q, index) => {
    const shuffledOptions = shuffleArray(q.options);
    
    return {
      originalId: q.id,
      displayNumber: index + 1,
      text: q.text,
      options: shuffledOptions.map((opt, optIndex) => ({
        id: opt.id, // original option ID ('A', 'B', etc)
        label: standardLabels[optIndex] || String.fromCharCode(65 + optIndex),
        text: opt.text,
      })),
      correctAnswerId: q.correctAnswerId,
      difficulty: q.difficulty,
      explanation: q.explanation,
      topic: q.topic,
    };
  });
}
