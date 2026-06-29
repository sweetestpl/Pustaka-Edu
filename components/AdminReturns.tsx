"use client";
import React, { useState } from "react";
import { Book, Member, Loan } from "@/lib/types";
import { 
  Check, 
  Clock, 
  HelpCircle, 
  ShieldAlert, 
  QrCode, 
  Play, 
  AlertCircle, 
  CreditCard,
  CheckCircle2, 
  X,
  RefreshCw
} from "lucide-react";

interface AdminReturnsProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  onReturnBook: (loanId: number, returnDate: string) => Promise<void>;
}

export default function AdminReturns({ books, members, loans, onReturnBook }: AdminReturnsProps) {
  const [typedId, setTypedId] = useState("");
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showFineModal, setShowFineModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanStatus, setScanStatus] = useState("");

  const activeLoans = loans.filter(l => l.status !== "Kembali");

  const getBookTitle = (id: number) => books.find(b => b.id === id)?.title || `Buku #${id}`;
  const getBookAuthor = (id: number) => books.find(b => b.id === id)?.author || "N/A";
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;
  const getMemberClass = (id: string) => members.find(m => m.id === id)?.class_name || "";

  // Dynamic fine calculation
  const getFineDetails = (loan: Loan, retDateStr: string) => {
    const due = new Date(loan.due_date);
    const ret = new Date(retDateStr);
    const diffTime = ret.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const overdueDays = diffDays > 0 ? diffDays : 0;
    const fineRate = 5000; // Rp 5000 / day
    const totalFine = overdueDays * fineRate;

    return {
      overdueDays,
      totalFine
    };
  };

  const handleScanAction = (e: React.FormEvent) => {
    e.preventDefault();
    setScanStatus("");
    const query = typedId.trim();

    if (!query) {
      setScanStatus("Peringatan: Silakan masukkan NIS siswa atau ID loan untuk mensimulasikan scan barcode.");
      return;
    }

    // Try finding matching loans
    const found = activeLoans.find(l => {
      return l.member_id === query || l.id.toString() === query || l.book_id.toString() === query;
    });

    if (found) {
      setSelectedLoan(found);
      const fineDetails = getFineDetails(found, returnDate);
      
      if (fineDetails.totalFine > 0) {
        setShowFineModal(true);
      } else {
        triggerReturnProcess(found.id);
      }
      setTypedId("");
    } else {
      setScanStatus("Siswa tidak memiliki pinjaman aktif / buku tidak terdaftar dalam sirkulasi.");
    }
  };

  const initiateReturn = (loan: Loan) => {
    setSelectedLoan(loan);
    const fineDetails = getFineDetails(loan, returnDate);
    if (fineDetails.totalFine > 0) {
      setShowFineModal(true);
    } else {
      triggerReturnProcess(loan.id);
    }
  };

  const triggerReturnProcess = async (loanId: number) => {
    setIsSubmitting(true);
    try {
      await onReturnBook(loanId, returnDate);
      alert("Pengembalian buku berhasil diproses!");
      setShowFineModal(false);
      setSelectedLoan(null);
    } catch (err: any) {
      alert(err.message || "Gagal mengembalikan buku.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 text-left" id="returns-main-container">
      
      {/* LEFT: Scanner console */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        <div className="glass-panel p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-indigo-600">
            <QrCode className="w-5 h-5 animate-pulse" />
            <h3 className="font-display font-extrabold text-slate-800 text-sm">Konsol Scanner Barcode & KTM</h3>
          </div>

          <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-4 leading-relaxed">
            Modul integrasi scanner barcode fisik atau pencarian KTM mandiri. Pustakawan dapat memindai kartu pelajar secara langsung atau memasukkan Nomor Induk Siswa secara manual untuk memproses transaksi secara real-time. (Cth NIS: <strong className="font-mono bg-slate-50 px-1 border rounded">234567</strong>).
          </p>

          <form onSubmit={handleScanAction} className="space-y-4 text-xs font-semibold">
            {scanStatus && (
              <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl font-medium">
                {scanStatus}
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <label className="text-slate-700">Scan Barcode / Input NIS / ID Transaksi</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={typedId}
                  onChange={(e) => setTypedId(e.target.value)}
                  placeholder="Masukkan NIS / ID Buku (cth: 234567)"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono font-bold"
                  id="scanner-simulator-input"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Scan</span>
                </button>
              </div>
            </div>

            {/* Set active return date */}
            <div className="flex flex-col space-y-1">
              <label className="text-slate-700">Tanggal Pengembalian Buku</label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono font-bold"
                id="simulator-return-date-picker"
              />
              <span className="text-[10px] text-slate-400 font-bold block mt-1">Tanggal pencatatan pengembalian buku ke sistem sirkulasi sekolah.</span>
            </div>
          </form>
        </div>

        {/* Informative fine policy notice */}
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 text-[10px] text-amber-800">
          <span className="font-bold flex items-center gap-1.5 mb-1.5 text-slate-800">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Penjelasan Denda Sekolah</span>
          </span>
          <p className="text-slate-600 leading-normal">
            Sesuai regulasi buku sekolah PustakaEdu, keterlambatan didenda <strong className="text-indigo-600 font-bold">Rp 5.000,- / hari</strong> per buku. Denda wajib dilunasi kepada petugas perpustakaan sebelum status pinjaman dirubah menjadi "Kembali".
          </p>
        </div>
      </div>

      {/* RIGHT: Active loans ready for return */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        <div className="glass-panel p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4 font-display">
            <div>
              <h3 className="font-display font-extrabold text-slate-800 text-sm">Meja Pengembalian & Sirkulasi</h3>
              <p className="text-[10px] text-slate-400 font-semibold font-medium">Klik pengembalian buku di daftar bawah untuk memproses transaksi secara cepat.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-150">
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Buku Dipinjam</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3">Denda Terkalkulasi</th>
                  <th className="py-2.5 px-3 text-right">Tindakan Sirkulasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((l) => {
                  const fineDetails = getFineDetails(l, returnDate);
                  return (
                    <tr key={l.id} className="hover:bg-slate-50/50">
                      
                      {/* Name / Class */}
                      <td className="py-3 px-3">
                        <span className="block font-bold text-slate-800">{getMemberName(l.member_id)}</span>
                        <span className="block text-[9px] text-slate-400 font-medium font-mono mt-0.5">NIS: {l.member_id}</span>
                      </td>

                      {/* Book detail */}
                      <td className="py-3 px-3">
                        <span className="block font-semibold text-slate-800 truncate max-w-[170px]">{getBookTitle(l.book_id)}</span>
                      </td>

                      {/* Due date */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">
                        {l.due_date}
                      </td>

                      {/* Dynamic fine display */}
                      <td className="py-3 px-3 font-mono font-bold">
                        {fineDetails.totalFine > 0 ? (
                          <span className="text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded font-black">
                            Rp {(fineDetails.totalFine).toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-extrabold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            Nihil (Rp 0)
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => initiateReturn(l)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-100 text-indigo-700 rounded-lg text-[10px] font-extrabold transition font-bold"
                          id={`return-trigger-btn-${l.id}`}
                        >
                          Proses Kembali
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {activeLoans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span>Sempurna! Semua koleksi sirkulasi aman di rak saat ini.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DETAILED FINE CALCULATION MODAL */}
      {showFineModal && selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md" id="fine-calculator-overlay">
          <div className="w-full max-w-md glass-panel-heavy rounded-2xl relative overflow-hidden text-left" id="fine-calculator-modal">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-rose-600" />

            <div className="p-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="text-left">
                  <h3 className="font-display font-extrabold text-rose-600 text-base">Kalkulator Denda Terlambat</h3>
                  <p className="text-[10px] text-slate-400 font-medium">Selesaikan pembayaran denda dengan petugas</p>
                </div>
                <button
                  onClick={() => setShowFineModal(false)}
                  className="p-1 hover:bg-slate-50 text-slate-400 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Loan parameters */}
              <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50/70 p-4 border border-slate-100 rounded-2xl mb-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/60">
                  <span className="text-slate-400 font-semibold font-medium">Siswa Peminjam:</span>
                  <span className="text-slate-800 font-bold">{getMemberName(selectedLoan.member_id)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/60">
                  <span className="text-slate-400 font-semibold font-medium">Buku Sekolah:</span>
                  <span className="text-slate-800 font-bold truncate max-w-[190px]">{getBookTitle(selectedLoan.book_id)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/60 text-slate-500 font-mono">
                  <span>Jatuh Tempo:</span>
                  <span className="font-bold">{selectedLoan.due_date}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-100/60 text-slate-500 font-mono">
                  <span>Tanggal Kembali:</span>
                  <span className="font-bold">{returnDate}</span>
                </div>
                <div className="flex justify-between items-center text-rose-700">
                  <span className="font-bold">Total Keterlambatan:</span>
                  <span className="font-black bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded">{getFineDetails(selectedLoan, returnDate).overdueDays} Hari</span>
                </div>
              </div>

              {/* Invoice fine block */}
              <div className="p-4 bg-rose-500 text-white rounded-2xl flex items-center justify-between mb-5 select-none shadow-md shadow-rose-500/10">
                <div className="text-left">
                  <span className="block text-[9px] uppercase tracking-wider font-extrabold text-rose-100">Tagihan Denda</span>
                  <span className="font-mono text-xl font-black">
                    Rp {getFineDetails(selectedLoan, returnDate).totalFine.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowFineModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-semibold rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  onClick={() => triggerReturnProcess(selectedLoan.id)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow transition"
                  id="confirm-fine-payment-btn"
                >
                  {isSubmitting ? "Memproses..." : "Konfirmasi Pembayaran & Kembalikan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
