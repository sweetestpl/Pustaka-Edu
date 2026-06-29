"use client";
import React, { useState } from "react";
import { Book, Member } from "@/lib/types";
import { 
  QrCode, 
  User, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  RefreshCw,
  Search,
  BookOpen
} from "lucide-react";

interface BookDetailScannerProps {
  book: Book;
  members: Member[];
  onAddLoan: (loanData: { member_id: string; book_id: number; loan_date: string; due_date: string }) => Promise<void>;
  onSuccessAction: () => void;
}

export default function BookDetailScanner({ book, members, onAddLoan, onSuccessAction }: BookDetailScannerProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const activeMembers = members.filter(m => m.status === "Aktif");
  
  // Filter active members based on search
  const filteredMembers = activeMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.id.includes(searchQuery)
  );

  // Date generators
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getSevenDaysLaterStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  const handleProcessScan = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError("");
    setFeedbackSuccess("");

    if (!selectedMemberId) {
      setFeedbackError("Galat: Harap pilih siswa sekolah penerima pinjam terlebih dahulu pada menu dropdown.");
      return;
    }

    if (book.stock <= 0) {
      setFeedbackError("Galat: Stok sirkulasi buku sekolah saat ini habis.");
      return;
    }

    setIsScanning(true);

    // Process scanning with hardware reader latency emulation
    setTimeout(async () => {
      try {
        const student = activeMembers.find(m => m.id === selectedMemberId);
        
        await onAddLoan({
          member_id: selectedMemberId,
          book_id: book.id,
          loan_date: getTodayStr(),
          due_date: getSevenDaysLaterStr()
        });

        setIsScanning(false);
        setScanSuccess(true);
        setFeedbackSuccess(
          `Sukses! Pindai QR Buku ID-${book.id} selesai. Buku "${book.title}" resmi dipinjamkan kepada ${student?.name || selectedMemberId} dengan batas jatuh tempo 7 hari.`
        );
        
        // Refresh the parent app data
        setTimeout(() => {
          onSuccessAction();
        }, 3000);
      } catch (err: any) {
        setIsScanning(false);
        setFeedbackError(err.message || "Gagal mencatatkan sirkulasi buku dari parser QR code.");
      }
    }, 1800);
  };

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mt-4 text-left" id="scanner-box-container">
      
      {/* Title Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 mb-4 text-indigo-700">
        <div className="flex items-center gap-2">
          <Scan className="w-5 h-5 text-indigo-600 animate-pulse" />
          <h4 className="font-display font-extrabold text-slate-800 text-xs">Pindai QR Buku Sirkulasi Instan (Pustakawan)</h4>
        </div>
        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">MODE PETUGAS</span>
      </div>

      {scanSuccess ? (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold text-xs">Buku Berhasil Dipinjamkan!</span>
          </div>
          <p className="text-[11px] leading-relaxed font-medium">
            {feedbackSuccess}
          </p>
          <div className="flex items-center gap-2 pt-2 border-t border-emerald-100 text-[10px] text-emerald-600 font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Menyinkronkan status sirkulasi, jendela detail akan ditutup...</span>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-4">
          
          {/* Left inputs: select student */}
          <div className="md:col-span-7 space-y-3 text-xs font-semibold text-slate-700">
            
            {feedbackError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl flex items-start gap-1.5 font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{feedbackError}</span>
              </div>
            )}

            {/* Quick Filter Search Siswa */}
            <div className="space-y-1">
              <label className="text-slate-655 text-[11px] font-bold">Cari / Saring Nama / NIS Siswa</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik NIS atau Nama Siswa..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 text-slate-800"
                />
              </div>
            </div>

            {/* Select student */}
            <div className="space-y-1">
              <label className="text-slate-655 text-[11px] font-bold">Pilih Siswa Peminjam</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-800 focus:outline-none focus:border-indigo-500 font-bold"
                id="scanner-student-dropdown"
              >
                <option value="">-- Pilih Siswa Penerima Pinjam --</option>
                {filteredMembers.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.id}) - Kelas {m.class_name}
                  </option>
                ))}
              </select>
              {filteredMembers.length === 0 && searchQuery && (
                <span className="text-[10px] text-rose-650 block">Siswa aktif tidak ditemukan.</span>
              )}
            </div>

            {/* Active date notice */}
            <div className="p-3 bg-slate-100 rounded-xl text-[10px] text-slate-500 space-y-1 border border-slate-200/50">
              <div className="flex justify-between">
                <span>Tanggal Sirkulasi:</span>
                <span className="font-mono font-bold text-slate-700">{getTodayStr()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tenggat Pengembalian:</span>
                <span className="font-mono font-bold text-indigo-600">{getSevenDaysLaterStr()}</span>
              </div>
            </div>
          </div>

          {/* Right scan viewport */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div className="relative w-full aspect-square md:aspect-auto md:h-36 rounded-xl overflow-hidden bg-slate-900 flex flex-col items-center justify-center border border-slate-800 shadow-inner group">
              
              {/* Camera view design */}
              <div className="absolute inset-2 border border-dashed border-white/20 rounded-md pointer-events-none" />
              
              {/* Corner guides */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-indigo-500" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-indigo-500" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-indigo-500" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-indigo-500" />

              {isScanning ? (
                <>
                  {/* Laser line moving sweep animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_10px_2px_rgba(239,68,68,0.8)] animate-pulse" style={{ top: "45%" }} />
                  <div className="text-center p-3 z-10 space-y-1.5">
                    <LoaderRing />
                    <span className="block font-mono text-[9px] text-rose-400 font-bold uppercase tracking-wider animate-pulse">MEMINDAI QR BUKU...</span>
                    <span className="block font-mono text-[8px] text-slate-400">ID: PUSTAKA-ID-{book.id}</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-3 z-10 space-y-1">
                  <QrCode className="w-8 h-8 text-indigo-400 mx-auto opacity-80" />
                  <span className="block font-mono text-[9px] text-slate-300 font-bold">SCANNER STANDBY</span>
                  <span className="block text-[8px] text-slate-500 leading-normal">Arahkan barcode atau ketuk tombol di bawah</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleProcessScan}
              disabled={isScanning || book.stock <= 0}
              className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition shadow"
              id="librarian-trigger-scan-btn"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Memproses Scan...</span>
                </>
              ) : (
                <>
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Pindai QR Peminjaman Instan</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

// Simple loader ring for scanner
function LoaderRing() {
  return (
    <div className="mx-auto w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
  );
}
