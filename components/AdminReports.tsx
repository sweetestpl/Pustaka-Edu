"use client";
import React, { useState } from "react";
import { Book, Member, Loan } from "@/lib/types";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  BookMarked,
  Printer,
  X
} from "lucide-react";

interface AdminReportsProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
}

export default function AdminReports({ books, members, loans }: AdminReportsProps) {
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-06-30");
  const [reportType, setReportType] = useState("Peminjaman");
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const getBookTitle = (id: number) => books.find(b => b.id === id)?.title || `Buku #${id}`;
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;
  const getMemberClass = (id: string) => members.find(m => m.id === id)?.class_name || "";

  // Filter loans within date
  const filteredLoans = loans.filter(l => {
    const d = l.loan_date;
    return d >= startDate && d <= endDate;
  });

  // Calculate stats summary of filtered loans
  const totalLoansInPeriod = filteredLoans.length;
  const returnedInPeriod = filteredLoans.filter(l => l.status === "Kembali").length;
  const activeInPeriod = filteredLoans.filter(l => l.status === "Dipinjam" || l.status === "Terlambat").length;
  const overdueInPeriod = filteredLoans.filter(l => l.status === "Terlambat").length;
  const totalFineCollected = filteredLoans.reduce((total, l) => total + (l.fine_amount || 0), 0);

  const handleExportCSV = () => {
    const headers = [
      "ID Sirkulasi",
      "NIS Siswa",
      "Nama Siswa",
      "Kelas Siswa",
      "ID Buku",
      "Judul Buku",
      "Tanggal Pinjam",
      "Batas Jatuh Tempo",
      "Tanggal Kembali",
      "Denda Kas (Rp)",
      "Status"
    ];

    const csvRows = [headers.join(",")];

    filteredLoans.forEach((l) => {
      const row = [
        `"${l.id}"`,
        `"${l.member_id}"`,
        `"${getMemberName(l.member_id).replace(/"/g, '""')}"`,
        `"${getMemberClass(l.member_id).replace(/"/g, '""')}"`,
        `"${l.book_id}"`,
        `"${getBookTitle(l.book_id).replace(/"/g, '""')}"`,
        `"${l.loan_date}"`,
        `"${l.due_date}"`,
        `"${l.return_date || "Belum Kembali"}"`,
        `"${l.fine_amount || 0}"`,
        `"${l.status}"`
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Sirkulasi_${startDate}_sd_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-6 text-left animate-fade-in" id="reports-main-container">
      
      {/* Title */}
      <div>
        <h2 className="font-display font-extrabold text-2xl text-slate-900">Laporan Sirkulasi Perpustakaan</h2>
        <p className="text-xs text-slate-500 font-medium">Buka evaluasi tanggal berjalan, rincian denda sekolah, dan print dokumen fisik</p>
      </div>

      {/* Filter range blocks */}
      <div className="glass-panel p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="grid sm:grid-cols-3 gap-4 flex-grow max-w-3xl text-xs font-semibold text-slate-700">
          
          {/* Start date */}
          <div className="flex flex-col space-y-1">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:bg-white font-mono font-bold"
            />
          </div>

          {/* End date */}
          <div className="flex flex-col space-y-1">
            <label>Tanggal Selesai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:bg-white font-mono font-bold"
            />
          </div>

          {/* Type */}
          <div className="flex flex-col space-y-1">
            <label>Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 font-bold focus:outline-none focus:bg-white text-xs"
            >
              <option value="Peminjaman">Laporan Peminjaman</option>
              <option value="Denda">Laporan Rekap Denda</option>
              <option value="Semua">Semua Transaksi</option>
            </select>
          </div>
        </div>

        {/* Export triggers */}
        <div className="flex items-center gap-2 self-start md:self-auto pt-2.5">
          <button
            onClick={() => setShowPrintPreview(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow shadow-indigo-600/10 cursor-pointer"
            id="reports-print-trigger-btn"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Tabel & Arsip</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            id="reports-csv-btn"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor format CSV</span>
          </button>
        </div>
      </div>

      {/* Rangkuman Period Metrics Box */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="reports-kpi-grid">
        
        {/* Loans total count */}
        <div className="bg-slate-900 text-white p-4.5 rounded-2xl border border-slate-850 flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Transaksi</h4>
            <span className="block font-display text-2xl font-black">{totalLoansInPeriod}</span>
            <span className="block text-[9px] text-slate-300">Peminjaman tercatat</span>
          </div>
          <div className="p-2 bg-white/10 rounded-xl">
            <BookMarked className="w-4.5 h-4.5 text-indigo-300" />
          </div>
        </div>

        {/* Retrured count */}
        <div className="glass-panel p-4.5 rounded-2xl flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Buku Kembali</h4>
            <span className="block font-display text-2xl font-black text-emerald-600">{returnedInPeriod}</span>
            <span className="block text-[9px] text-slate-400 font-medium">{Math.round((returnedInPeriod / (totalLoansInPeriod || 1)) * 100)}% Kelayakan</span>
          </div>
          <div className="p-2 bg-emerald-50/50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Active loans */}
        <div className="glass-panel p-4.5 rounded-2xl flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Masih Dipinjam</h4>
            <span className="block font-display text-2xl font-black text-amber-600">{activeInPeriod}</span>
            <span className="block text-[9px] text-slate-400 font-medium font-bold">Overdue: {overdueInPeriod} Buku</span>
          </div>
          <div className="p-2 bg-amber-50/50 text-amber-600 rounded-xl">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Total fines collection amount */}
        <div className="glass-panel p-4.5 rounded-2xl flex items-center justify-between">
          <div className="text-left space-y-0.5">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pemasukan Denda</h4>
            <span className="block font-display text-2xl font-black text-rose-600">Rp {totalFineCollected.toLocaleString("id-ID")}</span>
            <span className="block text-[9px] text-slate-400 font-medium font-bold">Keterlambatan</span>
          </div>
          <div className="p-2 bg-rose-50/50 text-rose-600 rounded-xl">
            <DollarSign className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl overflow-hidden mb-6" id="reports-table-panel">
        <div className="p-4 border-b border-indigo-100/25 flex items-center justify-between">
          <h3 className="font-display font-extrabold text-slate-800 text-sm">Audit Data Jurnal Sirkulasi</h3>
          <span className="text-[10px] text-slate-400 font-bold font-mono">Range: {startDate} s/d {endDate}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-700">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-150">
                <th className="py-2.5 px-3 border-r border-slate-100">ID Sirkulasi</th>
                <th className="py-2.5 px-3 text-left">Nama Siswa</th>
                <th className="py-2.5 px-3 text-left">Judul Buku Sekolah</th>
                <th className="py-2.5 px-3">Tanggal Pinjam</th>
                <th className="py-2.5 px-3">Batas Jatuh Tempo</th>
                <th className="py-2.5 px-3">Tanggal Kembali</th>
                <th className="py-2.5 px-3 text-right">Denda Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/40">
                  <td className="py-3 px-3 text-center border-r border-slate-100 font-mono font-bold text-[10px] text-slate-400">
                    #{l.id}
                  </td>
                  <td className="py-3 px-3 text-left">
                    <span className="font-bold text-slate-800 block">{getMemberName(l.member_id)}</span>
                    <span className="text-[9px] text-slate-400">NIS: {l.member_id}</span>
                  </td>
                  <td className="py-3 px-3 text-left font-semibold text-slate-700 truncate max-w-[190px]">
                    {getBookTitle(l.book_id)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-500">{l.loan_date}</td>
                  <td className="py-3 px-3 text-center font-mono font-semibold text-slate-505">{l.due_date}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold">
                    {l.return_date ? (
                      <span className="text-slate-700">{l.return_date}</span>
                    ) : (
                      <span className="text-rose-500 italic font-medium font-sans">Belum kembali</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-800">
                    {l.fine_amount > 0 ? (
                      <span className="text-rose-600 font-black">
                        Rp {l.fine_amount.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      <span className="text-slate-400">Rp 0</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">Bum! Tidak ada data sirkulasi didalam rentang tanggal audit yang dipilih.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT PREVIEW MODAL */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col my-8 border border-slate-200 animate-slide-up max-h-[90vh]">
            
            {/* Header / Actions - Hidden on physical print */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-10 no-print">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-display font-extrabold text-sm">Pratinjau Cetak Arsip Fisik</h3>
                  <p className="text-[10px] text-slate-400">Gunakan tombol print untuk menyimpan sebagai PDF atau cetak ke printer fisik</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Laporan
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="p-2 hover:bg-slate-800 rounded-xl transition text-slate-400 hover:text-white"
                  title="Tutup Pratinjau"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Container */}
            <div className="p-8 md:p-12 overflow-y-auto flex-grow bg-white text-black animate-fade-in" id="print-preview-modal-content">
              
              {/* CSS Print Styles applied locally */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body * {
                    visibility: hidden !important;
                  }
                  #print-preview-modal-content, #print-preview-modal-content * {
                    visibility: visible !important;
                  }
                  #print-preview-modal-content {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    color: black !important;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}} />

              {/* Letterhead */}
              <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
                <h1 className="font-serif font-black text-xl tracking-wide uppercase">UPT PERPUSTAKAAN DIGITAL PUSTAKAEDU</h1>
                <p className="text-xs font-serif font-semibold tracking-wider text-slate-700 mt-1">Jalan Pendidikan No. 45, Kompleks Pendidikan Jaya, Jakarta</p>
                <p className="text-[10px] font-mono mt-0.5">Surel: perpustakaan@pustakaedu.sch.id | Telp: (021) 555-0199</p>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h2 className="font-serif font-bold text-sm tracking-widest uppercase underline">LAPORAN REKAPITULASI JURNAL SIRKULASI PERPUSTAKAAN</h2>
                <p className="text-[11px] font-medium font-sans mt-1">Rentang Tanggal Jurnal: <span className="font-bold underline">{startDate}</span> s/d <span className="font-bold underline">{endDate}</span></p>
                <p className="text-[10px] font-mono text-slate-500 mt-0.5">Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Metadata Highlights */}
              <div className="grid grid-cols-4 gap-4 mb-6 text-xs text-left no-print">
                <div className="border border-slate-300 p-3 rounded-xl bg-slate-50">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none mb-1">Total Transaksi</span>
                  <span className="font-serif font-black text-lg block">{totalLoansInPeriod}</span>
                  <span className="text-[8px] text-slate-500 block">Sirkulasi terdaftar</span>
                </div>
                <div className="border border-slate-300 p-3 rounded-xl bg-slate-50">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none mb-1">Buku Kembali</span>
                  <span className="font-serif font-black text-lg text-emerald-700 block">{returnedInPeriod}</span>
                  <span className="text-[8px] text-slate-500 block">Transaksi tuntas</span>
                </div>
                <div className="border border-slate-300 p-3 rounded-xl bg-slate-50">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none mb-1">Sirkulasi Aktif</span>
                  <span className="font-serif font-black text-lg text-amber-700 block">{activeInPeriod}</span>
                  <span className="text-[8px] text-slate-500 block">Terlambat: {overdueInPeriod}</span>
                </div>
                <div className="border border-slate-300 p-3 rounded-xl bg-slate-50">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none mb-1">Kas Denda Masuk</span>
                  <span className="font-serif font-black text-lg text-rose-700 block">Rp {totalFineCollected.toLocaleString("id-ID")}</span>
                  <span className="text-[8px] text-slate-500 block">Buku jatuh tempo</span>
                </div>
              </div>

              {/* Data Table */}
              <div className="mb-8">
                <table className="w-full text-[10px] border-collapse border border-black">
                  <thead>
                    <tr className="bg-slate-100 font-serif font-bold text-center border-b border-black">
                      <th className="py-2 px-1.5 border border-black w-14">ID Ref</th>
                      <th className="py-2 px-1.5 border border-black text-left">Nama Anggota</th>
                      <th className="py-2 px-1.5 border border-black text-left">Judul Buku Perpustakaan</th>
                      <th className="py-2 px-1.5 border border-black w-18">Tgl Pinjam</th>
                      <th className="py-2 px-1.5 border border-black w-18">Jatuh Tempo</th>
                      <th className="py-2 px-1.5 border border-black w-18">Tgl Kembali</th>
                      <th className="py-2 px-1.5 border border-black text-right w-18">Denda (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black">
                    {filteredLoans.map((l) => (
                      <tr key={l.id} className="align-middle">
                        <td className="py-1.5 px-1.5 text-center font-mono font-bold">
                          #{l.id}
                        </td>
                        <td className="py-1.5 px-1.5">
                          <span className="font-bold text-black">{getMemberName(l.member_id)}</span>
                          <span className="block text-[8px] text-slate-600">NIS: {l.member_id} • {getMemberClass(l.member_id)}</span>
                        </td>
                        <td className="py-1.5 px-1.5 font-sans">
                          {getBookTitle(l.book_id)}
                        </td>
                        <td className="py-1.5 px-1.5 text-center font-mono">{l.loan_date}</td>
                        <td className="py-1.5 px-1.5 text-center font-mono">{l.due_date}</td>
                        <td className="py-1.5 px-1.5 text-center font-mono">
                          {l.return_date ? l.return_date : <span className="font-serif italic font-semibold text-black">Dipinjam</span>}
                        </td>
                        <td className="py-1.5 px-1.5 text-right font-mono font-bold">
                          {l.fine_amount > 0 ? l.fine_amount.toLocaleString("id-ID") : "0"}
                        </td>
                      </tr>
                    ))}
                    {filteredLoans.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 italic font-serif">Tidak ada rekaman transaksi sirkulasi pada periode ini.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Sub-Summary Details */}
              <div className="flex justify-between text-[11px] font-serif font-bold border border-black p-4 mb-10">
                <div className="space-y-1">
                  <p>Total Sirkulasi Terbit: {totalLoansInPeriod} Transaksi</p>
                  <p>Status Tuntas Kembali: {returnedInPeriod} Buku</p>
                </div>
                <div className="space-y-1 text-right">
                  <p>Tangguhan Pinjaman Aktif: {activeInPeriod} Buku</p>
                  <p className="text-black">Total Akumulasi Denda Pertanggungjawaban: Rp {totalFineCollected.toLocaleString("id-ID")}</p>
                </div>
              </div>

              {/* Signing Sheets for physical filing */}
              <div className="grid grid-cols-2 gap-10 text-[11px] font-serif text-center mt-12">
                <div className="space-y-16">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Kepala Perpustakaan PustakaEdu</p>
                  </div>
                  <div>
                    <p className="underline font-bold">Dra. Hj. Nunung Maryati, M.Pd.</p>
                    <p className="text-[10px] text-slate-600">NIP. 19740512 199903 2 003</p>
                  </div>
                </div>
                <div className="space-y-16">
                  <div>
                    <p>Jakarta, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <p className="font-bold">Petugas Administrasi Teknis</p>
                  </div>
                  <div>
                    <p className="underline font-bold">Rina Wijayanti, A.Md.</p>
                    <p className="text-[10px] text-slate-600">ID Petugas: PTG-0902</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
