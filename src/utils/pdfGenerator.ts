import { jsPDF } from 'jspdf';
import { Question, TestResult } from '../types';

/**
 * Generate PDF for Question Paper (Naskah Soal Ujian)
 */
export function generateQuestionsPdf(questions: Question[], filename = 'Naskah_Soal_Matematika_SD3_Loloan_Timur.pdf') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Header / Kop Sekolah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(10);
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', pageWidth / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFontSize(13);
  doc.setTextColor(15, 60, 140);
  doc.text('SD NEGERI 3 LOLOAN TIMUR', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setTextColor(70, 70, 70);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Alamat: Loloan Timur, Kec. Negara, Kab. Jembrana, Bali', pageWidth / 2, y, { align: 'center' });
  y += 3.5;

  // Garis ganda pembatas kop
  doc.setDrawColor(15, 60, 140);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 1.2;
  doc.setLineWidth(0.2);
  doc.setDrawColor(120, 120, 120);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Judul Ujian
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  doc.text('NASKAH ASESMEN SUMATIF KELAS V', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('MATA PELAJARAN: MATEMATIKA — MATERI: TES KEMAMPUAN AKADEMIK', pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Tabel Identitas Pengisian Siswa
  doc.setFillColor(245, 247, 252);
  doc.setDrawColor(200, 210, 230);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(40, 40, 40);
  doc.text('Nama Siswa  : ................................................................', margin + 4, y + 6);
  doc.text('No. Absen    : .......................................', margin + 4, y + 13);
  doc.text('Kelas            : V (Lima)', margin + contentWidth / 2 + 5, y + 6);
  doc.text('KKTP            : 70', margin + contentWidth / 2 + 5, y + 13);
  y += 24;

  // Petunjuk Ujian
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(90, 90, 90);
  doc.text('Petunjuk: Pilihlah salah satu jawaban (A, B, C, atau D) yang paling tepat dengan memberi tanda silang (X)!', margin, y);
  y += 5;

  // Daftar Soal
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);

  questions.forEach((q, idx) => {
    // Check page overflow
    if (y > 255) {
      doc.addPage();
      y = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`${idx + 1}.`, margin, y);

    const questionLines = doc.splitTextToSize(q.text, contentWidth - 8);
    doc.setFont('helvetica', 'normal');
    doc.text(questionLines, margin + 8, y);
    y += questionLines.length * 4.2 + 2;

    // Options
    q.options.forEach((opt) => {
      if (y > 275) {
        doc.addPage();
        y = 15;
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const optText = `${opt.id}.  ${opt.text}`;
      const optLines = doc.splitTextToSize(optText, contentWidth - 14);
      doc.text(optLines, margin + 12, y);
      y += optLines.length * 3.8 + 1;
    });

    y += 2.5; // spacing between questions
  });

  // Footer note
  if (y > 260) {
    doc.addPage();
    y = 15;
  }
  y += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  doc.text('Dokumen Resmi SD NEGERI 3 LOLOAN TIMUR — Dicetak dari Aplikasi CBT Asesmen Sumatif', pageWidth / 2, y, { align: 'center' });

  doc.save(filename);
}

/**
 * Generate Student Result Certificate / Report Card PDF (Surat Hasil Asesmen Sumatif)
 */
export function generateStudentResultPdf(result: TestResult, filename?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Kop Resmi Sekolah
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text('PEMERINTAH KABUPATEN JEMBRANA', pageWidth / 2, y, { align: 'center' });
  y += 5.5;
  doc.setFontSize(10);
  doc.text('DINAS PENDIDIKAN KEPEMUDAAN DAN OLAHRAGA', pageWidth / 2, y, { align: 'center' });
  y += 6;
  doc.setFontSize(14);
  doc.setTextColor(15, 60, 140);
  doc.text('SD NEGERI 3 LOLOAN TIMUR', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Alamat: Loloan Timur, Kec. Negara, Kab. Jembrana, Bali - Kode Pos: 82216', pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Garis Kop
  doc.setDrawColor(15, 60, 140);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 1.2;
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Judul Dokumen
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text('SURAT KETERANGAN HASIL ASESMEN SUMATIF', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Nomor Dokumen: SKH-SD3LT/${new Date().getFullYear()}/${result.absen.padStart(3, '0')}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // Paragraf Pembuka
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  const intro = 'Berdasarkan pelaksanaan Asesmen Sumatif Berbasis Komputer (CBT) yang telah diselenggarakan oleh SD Negeri 3 Loloan Timur, dengan ini menerangkan bahwa:';
  const introLines = doc.splitTextToSize(intro, contentWidth);
  doc.text(introLines, margin, y);
  y += introLines.length * 4.5 + 4;

  // Box Identitas Siswa
  doc.setFillColor(248, 250, 254);
  doc.setDrawColor(210, 222, 245);
  doc.roundedRect(margin, y, contentWidth, 34, 3, 3, 'FD');

  doc.setFontSize(9.5);
  const leftX = margin + 6;
  const valX = margin + 45;
  let idY = y + 7;

  doc.setFont('helvetica', 'bold');
  doc.text('Nama Lengkap', leftX, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${result.nama.toUpperCase()}`, valX, idY);
  idY += 6.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Nomor Absen', leftX, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${result.absen}`, valX, idY);
  idY += 6.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Kelas / Semester', leftX, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  Kelas ${result.kelas} (Lima) / Genap`, valX, idY);
  idY += 6.5;

  doc.setFont('helvetica', 'bold');
  doc.text('Mata Pelajaran', leftX, idY);
  doc.setFont('helvetica', 'normal');
  doc.text(`:  ${result.mapel} — ${result.materi}`, valX, idY);

  y += 40;

  // Judul Rincian Nilai
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 20, 20);
  doc.text('REKAPITULASI CAPAIAN NILAI:', margin, y);
  y += 4;

  // Tabel Rekap Nilai
  const colWidths = [contentWidth * 0.4, contentWidth * 0.3, contentWidth * 0.3];
  doc.setFillColor(235, 240, 250);
  doc.setDrawColor(180, 195, 225);
  doc.rect(margin, y, contentWidth, 8, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 40, 80);
  doc.text('Komponen Asesmen', margin + 4, y + 5.5);
  doc.text('Keterangan', margin + colWidths[0] + 4, y + 5.5);
  doc.text('Hasil / Skor', margin + colWidths[0] + colWidths[1] + 4, y + 5.5);
  y += 8;

  const tableData = [
    ['Jumlah Soal Dikerjakan', 'Pilihan Ganda', `${result.totalSoal} Soal`],
    ['Jumlah Jawaban Benar', 'Skor +10 per nomor', `${result.jumlahBenar} Soal`],
    ['Jumlah Jawaban Salah', 'Skor 0', `${result.jumlahSalah} Soal`],
    ['Kriteria Ketuntasan (KKTP)', 'Batas Minimum Kelulusan', `${result.kktp}`],
    ['Nilai Akhir (Skala 0 - 100)', 'Standar Penilaian Kurikulum', `${result.nilai}`],
  ];

  tableData.forEach((row, rIdx) => {
    const isEven = rIdx % 2 === 1;
    if (isEven) {
      doc.setFillColor(250, 252, 255);
      doc.rect(margin, y, contentWidth, 7, 'F');
    }
    doc.setDrawColor(220, 225, 235);
    doc.rect(margin, y, contentWidth, 7, 'S');

    doc.setFont('helvetica', rIdx === 4 ? 'bold' : 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(20, 20, 20);
    doc.text(row[0], margin + 4, y + 5);
    doc.text(row[1], margin + colWidths[0] + 4, y + 5);
    doc.text(row[2], margin + colWidths[0] + colWidths[1] + 4, y + 5);
    y += 7;
  });

  y += 6;

  // Box Status Kelulusan
  const isLulus = result.status === 'LULUS';
  doc.setFillColor(isLulus ? 240 : 255, isLulus ? 253 : 243, isLulus ? 244 : 240);
  doc.setDrawColor(isLulus ? 34 : 220, isLulus ? 197 : 38, isLulus ? 94 : 38);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(isLulus ? 20 : 180, isLulus ? 120 : 30, isLulus ? 50 : 30);
  doc.text(
    `STATUS ASESMEN: ${result.status} (NILAI: ${result.nilai} / KKTP: ${result.kktp})`,
    pageWidth / 2,
    y + 8,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(70, 70, 70);
  const statusNote = isLulus
    ? 'Selamat! Siswa telah mencapai dan melampaui Kriteria Ketercapaian Tujuan Pembelajaran (KKTP).'
    : 'Perhatian: Siswa perlu mengikuti bimbingan perbaikan (remedial) untuk mencapai ketuntasan materi.';
  doc.text(statusNote, pageWidth / 2, y + 14, { align: 'center' });

  y += 28;

  // Bagian Tanda Tangan
  const dateStr = result.formattedDate
    ? result.formattedDate.split(' ')[0]
    : new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const signX = pageWidth - margin - 65;

  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'normal');
  doc.text(`Loloan Timur, ${dateStr}`, signX, y);
  y += 5;
  doc.text('Guru Pengampu Matematika,', signX, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.text('( Guru Kelas V SD N 3 Loloan Timur )', signX, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('NIP. 19850315 201001 1 024', signX, y);

  // Bottom Security / Timestamp
  const bottomY = doc.internal.pageSize.getHeight() - 12;
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text(`Dicetak secara digital pada: ${new Date().toLocaleString('id-ID')} | CBT Sumatif Engine`, margin, bottomY);
  doc.text('Halaman 1 dari 1', pageWidth - margin, bottomY, { align: 'right' });

  const safeFilename = filename || `Hasil_Tes_${result.absen}_${result.nama.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(safeFilename);
}

/**
 * Generate Class Summary Report PDF for Teacher
 */
export function generateClassSummaryPdf(results: TestResult[], kktp = 70) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('REKAPITULASI HASIL TES SUMATIF KELAS V', pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.setFontSize(11);
  doc.setTextColor(15, 60, 140);
  doc.text('SD NEGERI 3 LOLOAN TIMUR — TAHUN AJARAN 2026/2027', pageWidth / 2, y, { align: 'center' });
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Mata Pelajaran: Matematika (Tes Kemampuan Akademik) | KKTP: ${kktp} | Total Peserta: ${results.length} Siswa`, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Line
  doc.setDrawColor(15, 60, 140);
  doc.setLineWidth(0.6);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Table header
  const cols = [
    { title: 'No', width: 12 },
    { title: 'Waktu / Timestamp', width: 45 },
    { title: 'No. Absen', width: 22 },
    { title: 'Nama Lengkap Siswa', width: 75 },
    { title: 'Benar', width: 20 },
    { title: 'Salah', width: 20 },
    { title: 'Nilai (0-100)', width: 28 },
    { title: 'Status', width: 45 },
  ];

  doc.setFillColor(240, 244, 250);
  doc.setDrawColor(180, 200, 230);
  doc.rect(margin, y, contentWidth, 7, 'FD');

  let curX = margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 40, 80);
  cols.forEach((col) => {
    doc.text(col.title, curX + 2, y + 4.8);
    curX += col.width;
  });
  y += 7;

  // Table rows
  results.forEach((r, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 15;
    }
    const isEven = idx % 2 === 1;
    if (isEven) {
      doc.setFillColor(252, 253, 255);
      doc.rect(margin, y, contentWidth, 6, 'F');
    }
    doc.setDrawColor(225, 230, 240);
    doc.rect(margin, y, contentWidth, 6, 'S');

    curX = margin;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);

    const values = [
      `${idx + 1}`,
      r.formattedDate || r.timestamp,
      r.absen,
      r.nama,
      `${r.jumlahBenar}`,
      `${r.jumlahSalah}`,
      `${r.nilai}`,
      r.status,
    ];

    values.forEach((val, cIdx) => {
      if (cIdx === 7) {
        doc.setFont('helvetica', 'bold');
        if (val === 'LULUS') {
          doc.setTextColor(22, 128, 61);
        } else {
          doc.setTextColor(185, 28, 28);
        }
      } else if (cIdx === 6) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(20, 20, 20);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
      }
      doc.text(val, curX + 2, y + 4.2);
      curX += cols[cIdx].width;
    });

    y += 6;
  });

  // Calculate summary stats
  const total = results.length;
  const lulusCount = results.filter((r) => r.status === 'LULUS').length;
  const avg = total > 0 ? (results.reduce((acc, r) => acc + r.nilai, 0) / total).toFixed(1) : '0';
  const lulusPercent = total > 0 ? ((lulusCount / total) * 100).toFixed(1) : '0';

  y += 6;
  if (y > 180) {
    doc.addPage();
    y = 15;
  }
  doc.setFillColor(245, 247, 252);
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  doc.text(`Total Peserta: ${total} Siswa`, margin + 6, y + 5);
  doc.text(`Rata-rata Kelas: ${avg}`, margin + 60, y + 5);
  doc.text(`Tuntas (Lulus): ${lulusCount} Siswa (${lulusPercent}%)`, margin + 120, y + 5);
  doc.text(`Belum Tuntas: ${total - lulusCount} Siswa`, margin + 195, y + 5);

  doc.save('Rekap_Nilai_Kelas_V_SD3_Loloan_Timur.pdf');
}
