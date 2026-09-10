import { TestResult } from '../types';

export function formatSpreadsheetRows(results: TestResult[]) {
  return results.map((r) => ({
    timestamp: r.formattedDate || r.timestamp,
    nama: r.nama,
    kelas: r.kelas,
    absen: r.absen,
    jumlahBenar: r.jumlahBenar,
    jumlahSalah: r.jumlahSalah,
    nilai: r.nilai,
    status: r.status,
  }));
}

/**
 * Download CSV file formatted for Microsoft Excel & Google Sheets
 * Matches exact columns from Google Spreadsheet:
 * Timestamp,Nama Siswa,Kelas,Nomor Absen,Jumlah Benar,Jumlah Salah,Nilai,Status Kelulusan,Sekolah,Mata Pelajaran
 */
export function exportToCSV(results: TestResult[], filename = 'Rekap_Nilai_SD3_Loloan_Timur.csv') {
  const headers = [
    'Timestamp',
    'Nama Siswa',
    'Kelas',
    'Nomor Absen',
    'Jumlah Benar',
    'Jumlah Salah',
    'Nilai',
    'Status Kelulusan',
    'Sekolah',
    'Mata Pelajaran',
  ];

  const rows = results.map((r) => [
    `"${r.formattedDate || r.timestamp}"`,
    `"${r.nama.replace(/"/g, '""')}"`,
    `"${r.kelas || 'V'}"`,
    `"${r.absen}"`,
    r.jumlahBenar,
    r.jumlahSalah,
    r.nilai,
    `"${r.status}"`,
    `"${r.sekolah || 'SD NEGERI 3 LOLOAN TIMUR'}"`,
    `"${r.mapel || 'Matematika'}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy TSV table to clipboard so the teacher can press Ctrl+V directly into Google Sheets!
 */
export async function copyTableForGoogleSheets(results: TestResult[]): Promise<boolean> {
  const headers = [
    'Timestamp',
    'Nama Siswa',
    'Kelas',
    'Nomor Absen',
    'Jumlah Benar',
    'Jumlah Salah',
    'Nilai',
    'Status Kelulusan',
    'Sekolah',
    'Mata Pelajaran',
  ];
  const lines = results.map((r) =>
    [
      r.formattedDate || r.timestamp,
      r.nama,
      r.kelas || 'V',
      r.absen,
      r.jumlahBenar,
      r.jumlahSalah,
      r.nilai,
      r.status,
      r.sekolah || 'SD NEGERI 3 LOLOAN TIMUR',
      r.mapel || 'Matematika',
    ].join('\t')
  );

  const tsvText = [headers.join('\t'), ...lines].join('\n');
  try {
    await navigator.clipboard.writeText(tsvText);
    return true;
  } catch (e) {
    console.error('Failed to copy to clipboard:', e);
    return false;
  }
}

export const DEFAULT_GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzAh0Qq2Ku6cL7TldUhb3Ohd2fdEBNItrXjOp9pk8V3WH453J_IRamJ4cKwIRqiui9q3Q/exec';

/**
 * Source data directly from the user's Google Spreadsheet:
 * Timestamp,Nama Siswa,Kelas,Nomor Absen,Jumlah Benar,Jumlah Salah,Nilai,Status Kelulusan,Sekolah,Mata Pelajaran
 * "10/9/2026, 23.12.38",Uji Coba Sinkronisasi Guru,V,0,10,0,100,LULUS,SD NEGERI 3 LOLOAN TIMUR,Matematika
 * 10/09/2026 23:22:21,,,,,,,,SD NEGERI 3 LOLOAN TIMUR,Matematika
 * "10/9/2026, 15.22.56",Test Fetch Probe,V,99,10,0,100,LULUS,SD NEGERI 3 LOLOAN TIMUR,Matematika
 */
export const SPREADSHEET_SOURCE_DATA: TestResult[] = [
  {
    id: 'sheet-row-1',
    timestamp: '2026-09-10T23:12:38.000Z',
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
    timestamp: '2026-09-10T23:22:21.000Z',
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
    timestamp: '2026-09-10T15:22:56.000Z',
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

/**
 * Send result to Google Sheets Webhook (Apps Script Web App)
 */
export async function sendResultToGoogleSheet(
  result: TestResult,
  webhookUrl = DEFAULT_GOOGLE_APPS_SCRIPT_URL
): Promise<{ success: boolean; message: string }> {
  const targetUrl = webhookUrl && webhookUrl.trim() ? webhookUrl.trim() : DEFAULT_GOOGLE_APPS_SCRIPT_URL;

  const payload = {
    timestamp: result.formattedDate || result.timestamp,
    nama: result.nama,
    kelas: result.kelas,
    absen: result.absen,
    jumlahBenar: result.jumlahBenar,
    jumlahSalah: result.jumlahSalah,
    nilai: result.nilai,
    status: result.status,
    sekolah: result.sekolah || 'SD NEGERI 3 LOLOAN TIMUR',
    mapel: result.mapel || 'Matematika',
  };

  // 1. Try sending via local proxy middleware if available
  try {
    const proxyRes = await fetch('/api/spreadsheet-send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data.success) {
        return {
          success: true,
          message: 'Data berhasil disinkronkan ke Google Spreadsheet!',
        };
      }
    }
  } catch {
    // Proxy failed or not available, fallback to direct fetch
  }

  // 2. Direct fetch with 'no-cors' mode (standard for Google Apps Script Web App in browsers)
  try {
    await fetch(targetUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: 'Data berhasil dikirim ke Google Spreadsheet!',
    };
  } catch (error) {
    console.error('Error sending to Google Sheet:', error);
    return {
      success: false,
      message: 'Gagal mengirim ke Google Sheets: ' + (error instanceof Error ? error.message : 'Koneksi terputus'),
    };
  }
}

export interface FetchSpreadsheetResult {
  success: boolean;
  data?: TestResult[];
  message: string;
  isDoGetMissing?: boolean;
}

/**
 * Fetch live rows from Google Apps Script Web App
 */
export async function fetchSpreadsheetData(
  webhookUrl = DEFAULT_GOOGLE_APPS_SCRIPT_URL
): Promise<FetchSpreadsheetResult> {
  const targetUrl = webhookUrl && webhookUrl.trim() ? webhookUrl.trim() : DEFAULT_GOOGLE_APPS_SCRIPT_URL;

  // 1. First try the server proxy endpoint
  try {
    const proxyRes = await fetch('/api/spreadsheet-data');
    if (proxyRes.ok) {
      const json = await proxyRes.json();
      if (json.success && json.data) {
        const rows = parseRawGoogleSheetData(json.data);
        return {
          success: true,
          data: rows,
          message: 'Data berhasil diambil secara live dari Google Spreadsheet.',
        };
      } else if (json.isDoGetMissing) {
        return {
          success: false,
          isDoGetMissing: true,
          message: 'Google Apps Script belum memiliki fungsi doGet().',
        };
      }
    }
  } catch {
    // Continue to direct fetch attempt
  }

  // 2. Direct fetch to Google Apps Script URL
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const directRes = await fetch(targetUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (directRes.ok) {
      const text = await directRes.text();
      try {
        const parsed = JSON.parse(text);
        const rows = parseRawGoogleSheetData(parsed);
        return {
          success: true,
          data: rows,
          message: 'Data berhasil diambil dari Google Spreadsheet.',
        };
      } catch {
        if (text.includes('Script function not found: doGet')) {
          return {
            success: false,
            isDoGetMissing: true,
            message: 'Fungsi doGet() belum didefinisikan di Google Apps Script.',
          };
        }
      }
    }
  } catch {
    // Network or CORS restriction on direct client GET
  }

  return {
    success: false,
    message: 'Sinkronisasi lokal aktif. Siap menerima data baru.',
  };
}

/**
 * Parse CSV text into TestResult[]
 */
export function parseCsvToTestResults(csvText: string): TestResult[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const parseCsvRow = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    result.push(cur.trim());
    return result;
  };

  const headers = parseCsvRow(lines[0]).map((h) => h.trim());
  const results: TestResult[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cols = parseCsvRow(line);
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = cols[idx] || '';
    });

    const timestamp = rowObj['Timestamp'] || cols[0] || '';
    const rawNama = rowObj['Nama Siswa'] || cols[1] || '';
    const nama = rawNama.trim() ? rawNama.trim() : '-';
    const kelas = rowObj['Kelas'] || cols[2] || 'V';
    const absen = rowObj['Nomor Absen'] || cols[3] || '-';
    const benar = parseInt(rowObj['Jumlah Benar'] || cols[4] || '0', 10);
    const salah = parseInt(rowObj['Jumlah Salah'] || cols[5] || '0', 10);
    const nilai = parseInt(rowObj['Nilai'] || cols[6] || '0', 10);
    const rawStatus = rowObj['Status Kelulusan'] || rowObj['Status'] || cols[7] || '';
    const sekolah = rowObj['Sekolah'] || cols[8] || 'SD NEGERI 3 LOLOAN TIMUR';
    const mapel = rowObj['Mata Pelajaran'] || cols[9] || 'Matematika';

    let status: 'LULUS' | 'BELUM LULUS' = 'BELUM LULUS';
    if (rawStatus.toUpperCase().includes('LULUS') && !rawStatus.toUpperCase().includes('BELUM')) {
      status = 'LULUS';
    } else if (nilai >= 70) {
      status = 'LULUS';
    }

    results.push({
      id: `sheet-csv-${i}-${timestamp.replace(/[^a-zA-Z0-9]/g, '')}`,
      timestamp,
      formattedDate: timestamp,
      nama,
      kelas: kelas || 'V',
      absen: absen || '-',
      jumlahBenar: isNaN(benar) ? 0 : benar,
      jumlahSalah: isNaN(salah) ? 0 : salah,
      nilai: isNaN(nilai) ? 0 : nilai,
      status,
      kktp: 70,
      sekolah: sekolah || 'SD NEGERI 3 LOLOAN TIMUR',
      mapel: mapel || 'Matematika',
      materi: 'Tes Kemampuan Akademik',
      totalSoal: 10,
      studentAnswers: {},
    });
  }

  return results;
}

/**
 * Normalizes different Google Apps Script return structures into TestResult[]
 */
function parseRawGoogleSheetData(raw: any): TestResult[] {
  if (typeof raw === 'string' && raw.includes('Timestamp') && raw.includes('Nama Siswa')) {
    return parseCsvToTestResults(raw);
  }
  if (raw && typeof raw.csv === 'string') {
    return parseCsvToTestResults(raw.csv);
  }

  const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  if (!Array.isArray(list)) return [];

  return list
    .filter((item: any) => item && (item.nama || item['Nama Siswa'] || item[1] || item.timestamp || item['Timestamp']))
    .map((item: any, idx: number) => {
      // Handles both object array and 2D row array
      if (Array.isArray(item)) {
        const [time, nama, kelas, absen, benar, salah, nilai, status, sekolah, mapel] = item;
        const numNilai = Number(nilai) || 0;
        return {
          id: 'sheet-row-' + idx + '-' + String(time || Date.now()),
          timestamp: String(time || new Date().toISOString()),
          formattedDate: String(time || ''),
          nama: String(nama || '-'),
          absen: String(absen ?? '-'),
          kelas: String(kelas || 'V'),
          sekolah: String(sekolah || 'SD NEGERI 3 LOLOAN TIMUR'),
          mapel: String(mapel || 'Matematika'),
          materi: 'Tes Kemampuan Akademik',
          totalSoal: 10,
          jumlahBenar: Number(benar) || 0,
          jumlahSalah: Number(salah) || 0,
          nilai: numNilai,
          status: (status === 'LULUS' || status === 'BELUM LULUS') ? status : (numNilai >= 70 ? 'LULUS' : 'BELUM LULUS'),
          kktp: 70,
          studentAnswers: {},
        } as TestResult;
      }

      const numNilai = Number(item.nilai ?? item['Nilai'] ?? 0);
      const rawStatus = item.status ?? item['Status'] ?? item['Status Kelulusan'];
      return {
        id: item.id || ('sheet-obj-' + idx + '-' + (item.timestamp || Date.now())),
        timestamp: String(item.timestamp || item['Timestamp'] || new Date().toISOString()),
        formattedDate: String(item.timestamp || item['Timestamp'] || ''),
        nama: String(item.nama || item['Nama Siswa'] || '-'),
        absen: String(item.absen ?? item['Nomor Absen'] ?? item['Absen'] ?? '-'),
        kelas: String(item.kelas || item['Kelas'] || 'V'),
        sekolah: String(item.sekolah || item['Sekolah'] || 'SD NEGERI 3 LOLOAN TIMUR'),
        mapel: String(item.mapel || item['Mata Pelajaran'] || 'Matematika'),
        materi: 'Tes Kemampuan Akademik',
        totalSoal: 10,
        jumlahBenar: Number(item.jumlahBenar ?? item['Jumlah Benar'] ?? 0),
        jumlahSalah: Number(item.jumlahSalah ?? item['Jumlah Salah'] ?? 0),
        nilai: numNilai,
        status: (rawStatus === 'LULUS' || rawStatus === 'BELUM LULUS') ? rawStatus : (numNilai >= 70 ? 'LULUS' : 'BELUM LULUS'),
        kktp: 70,
        studentAnswers: item.studentAnswers || {},
      } as TestResult;
    });
}

/**
 * Complete Google Apps Script supporting both writing (doPost) and reading (doGet)
 */
export const COMPLETE_GOOGLE_APPS_SCRIPT = `// SKRIP LENGKAP 2-ARAH GOOGLE APPS SCRIPT
// SD NEGERI 3 LOLOAN TIMUR

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Nama Siswa",
        "Kelas",
        "Nomor Absen",
        "Jumlah Benar",
        "Jumlah Salah",
        "Nilai",
        "Status Kelulusan",
        "Sekolah",
        "Mata Pelajaran"
      ]);
    }
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.timestamp || new Date().toLocaleString("id-ID"),
      data.nama || "",
      data.kelas || "V",
      data.absen || "",
      Number(data.jumlahBenar) || 0,
      Number(data.jumlahSalah) || 0,
      Number(data.nilai) || 0,
      data.status || (Number(data.nilai) >= 70 ? "LULUS" : "BELUM LULUS"),
      data.sekolah || "SD NEGERI 3 LOLOAN TIMUR",
      data.mapel || "Matematika"
    ]);
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ "result": "success", "data": [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var data = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!row[1]) continue;
      data.push({
        timestamp: row[0],
        nama: row[1],
        kelas: row[2],
        absen: row[3],
        jumlahBenar: row[4],
        jumlahSalah: row[5],
        nilai: row[6],
        status: row[7],
        sekolah: row[8],
        mapel: row[9]
      });
    }
    return ContentService.createTextOutput(JSON.stringify({ "result": "success", "data": data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

