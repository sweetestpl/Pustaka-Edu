"use client";
import React from "react";
import { Loan, Book } from "@/lib/types";
import { 
  History, 
  HelpCircle, 
  Clock, 
  CheckCircle, 
  BookOpen, 
  ShieldAlert, 
  AlertCircle
} from "lucide-react";

interface SiswaHistoryProps {
  loans: Loan[];
  books: Book[];
  studentId: string;
}

export default function SiswaHistory({ loans, books, studentId }: SiswaHistoryProps) {
  // Only fetch loans relevant to the logged in student
  const studentLoans = loans.filter(l => l.member_id === studentId);

  const getBookTitle = (bId: number) => books.find(b => b.id === bId)?.title || "Buku Terhapus";
  const getBookAuthor = (bId: number) => books.find(b => b.id === bId)?.author || "N/A";
  const getBookShelf = (bId: number) => books.find(b => b.id === bId)?.shelf || "N/A";

  // Categorize loans
  const activeLoans = studentLoans.filter(l => l.status === "Dipinjam" || l.status === "Terlambat");
  const overdueLoans = studentLoans.filter(l => l.status === "Terlambat");
  const pastLoans = studentLoans.filter(l => l.status === "Kembali");

  return (
    <div className="grid lg:grid-cols-12 gap-6 text-left animate-fade-in" id="siswa-history-main">
      
      {/* LEFT COLUMN: Active Loans and Overdue Alerts */}
      <div className="lg:col-span-8 flex flex-col space-y-6">
        
        {/* Overdue alert container if any exist */}
        {overdueLoans.length > 0 && (
          <div className="bg-rose-50 border border-rose-100 p-4.5 rounded-2xl flex items-start gap-3.5 text-rose-800" id="overdue-warning-alert">
            <ShieldAlert className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-rose-950 font-display">Peringatan: Keterlambatan Pengembalian Buku!</h4>
              <p className="leading-relaxed font-semibold">
                Anda memiliki <b>{overdueLoans.length} buku</b> yang telah melewati tenggat jatuh tempo peminjaman 7 hari. 
                Denda keterlambatan berjalan <strong className="text-rose-700">Rp 5.000,- / hari</strong> akumulatif. 
                Harap segera kembalikan ke meja petugas sirkulasi.
              </p>
            </div>
          </div>
        )}

        {/* Current Pinjams Progress */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-indigo-700">
            <BookOpen className="w-5 h-5" />
            <h3 className="font-display font-extrabold text-slate-800 text-sm">Buku Sedang Dipinjam</h3>
          </div>

          <div className="space-y-3.5">
            {activeLoans.map((l) => (
              <div 
                key={l.id} 
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  l.status === "Terlambat" 
                    ? "bg-rose-50/15 border-rose-150 text-rose-800" 
                    : "bg-slate-50/20 border-slate-200/60"
                }`}
              >
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold text-slate-800 text-sm">{getBookTitle(l.book_id)}</h4>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pengarang: {getBookAuthor(l.book_id)}</span>
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 font-mono text-[10px]">
                    <span>Pinjam: <strong>{l.loan_date}</strong></span>
                    <span>Jatuh Tempo: <strong className={l.status === "Terlambat" ? "text-rose-600 font-extrabold" : ""}>{l.due_date}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="bg-slate-100 text-slate-650 text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-slate-200">
                    {getBookShelf(l.book_id)}
                  </span>
                  
                  {l.status === "Terlambat" ? (
                    <span className="bg-rose-500 text-white font-black text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow shadow-rose-500/10">
                      Terlambat
                    </span>
                  ) : (
                    <span className="bg-indigo-600 text-white font-extrabold text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      Aktif
                    </span>
                  )}
                </div>
              </div>
            ))}

            {activeLoans.length === 0 && (
              <div className="py-10 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-500">Tidak ada pinjaman berjalan.</p>
                <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-relaxed">
                  Semua buku sekolah telah dikembalikan tepat waktu. Silakan pilih koleksi literatur baru di beranda!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Historic return cards */}
        <div className="glass-panel p-5 rounded-2xl text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-slate-500">
            <History className="w-5 h-5" />
            <h3 className="font-display font-bold text-slate-800 text-sm">Arsip Pengembalian Buku</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-150">
                  <th className="py-2 px-3">Judul Buku Sekolah</th>
                  <th className="py-2 px-3">Tgl Pinjam</th>
                  <th className="py-2 px-3">Tgl Kembali</th>
                  <th className="py-2 px-3 text-right">Denda Terbayar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {pastLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/60 font-medium">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-700 block text-sm">{getBookTitle(l.book_id)}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[10px]">{l.loan_date}</td>
                    <td className="py-3 px-3 font-mono text-[10px]">{l.return_date}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      {l.fine_amount > 0 ? (
                        <span className="text-rose-600">Rp {l.fine_amount.toLocaleString("id-ID")}</span>
                      ) : (
                        <span className="text-slate-450">-</span>
                      )}
                    </td>
                  </tr>
                ))}

                {pastLoans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">Belum ada riwayat pengembalian buku tercatat.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive FAQ procedures and policies */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        
        {/* FAQ box */}
        <div className="glass-panel p-5 rounded-2xl text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-indigo-700">
            <HelpCircle className="w-5 h-5" />
            <h3 className="font-display font-extrabold text-slate-800 text-sm">Petunjuk & FAQ Sirkulasi</h3>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="space-y-1 text-left">
              <span className="font-bold text-slate-800 text-xs">1. Bagaimana cara meminjam buku?</span>
              <p className="text-slate-500 leading-relaxed font-normal">
                Pilih buku yang tersedia di katalog beranda, catat kode Rak. Temui petugas perpustakaan di sekolah, sebutkan NIS Anda dan ID buku untuk memproses sirkulasi pinjam.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="space-y-1 text-left">
              <span className="font-bold text-slate-800 text-xs">2. Berapa batas maksimal hari pinjam?</span>
              <p className="text-slate-500 leading-relaxed font-normal">
                Batas pinjam standar sirkulasi buku sekolah adalah <strong className="text-indigo-600 font-bold">7 hari kalender</strong> sejak tanggal pinjam didaftarkan.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="space-y-1 text-left">
              <span className="font-bold text-slate-800 text-xs">3. Apa yang terjadi jika terlambat mengembalikan?</span>
              <p className="text-slate-500 leading-relaxed font-normal">
                Keterlambatan didenda <strong className="text-rose-600 font-bold">Rp 5.000,- per hari</strong> kalender per buku. Status akun Anda otomatis ditangguhkan apabila denda belum dilunasi.
              </p>
            </div>
          </div>
        </div>

        {/* General Alert */}
        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-[10px] text-slate-600 leading-relaxed">
          <span className="font-bold block mb-1 text-indigo-800">Kontak Pustakawan Sekolah:</span>
          <span>Apabila Anda melihat keganjilan status data peminjaman buku sirkulasi, silakan temui pengelola pustakawan di Gedung Perpustakaan Utama lantai 2.</span>
        </div>
      </div>

    </div>
  );
}
