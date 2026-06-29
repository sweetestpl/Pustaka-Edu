"use client";
import React, { useState } from "react";
import { Book, Member, Loan } from "@/lib/types";
import { 
  BookOpen, 
  UserCheck, 
  Calendar, 
  PlusCircle, 
  Search, 
  ShieldAlert, 
  Clock, 
  CheckCircle2,
  CalendarCheck
} from "lucide-react";

interface AdminLoansProps {
  books: Book[];
  members: Member[];
  loans: Loan[];
  onAddLoan: (loanData: { member_id: string; book_id: number; loan_date: string; due_date: string }) => Promise<void>;
}

export default function AdminLoans({ books, members, loans, onAddLoan }: AdminLoansProps) {
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  
  // Date calculations
  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getSevenDaysLaterStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  };

  const [loanDate, setLoanDate] = useState(getTodayStr());
  const [dueDate, setDueDate] = useState(getSevenDaysLaterStr());

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active loans list (status !== "Kembali")
  const activeLoans = loans.filter(l => l.status !== "Kembali");

  // Helper matching names
  const getBookTitle = (id: number) => books.find(b => b.id === id)?.title || `Buku #${id}`;
  const getBookAuthor = (id: number) => books.find(b => b.id === id)?.author || "N/A";
  const getBookShelf = (id: number) => books.find(b => b.id === id)?.shelf || "N/A";
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || id;
  const getMemberClass = (id: string) => members.find(m => m.id === id)?.class_name || "";

  // Members lists filters (only show Active status)
  const activeMembersOnly = members.filter(m => m.status === "Aktif");
  // Books lists filters (only show books with stock > 0)
  const instockBooksOnly = books.filter(b => b.stock > 0);

  const handleLoanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!selectedMemberId) {
      setFormError("Silakan pilih siswa terlebih dahulu.");
      return;
    }

    if (!selectedBookId) {
      setFormError("Silakan pilih buku yang ingin dipinjam.");
      return;
    }

    if (!loanDate || !dueDate) {
      setFormError("Tanggal Pinjam dan Jatuh Tempo wajib ditentukan.");
      return;
    }

    if (dueDate < loanDate) {
      setFormError("Tanggal jatuh tempo tidak boleh mendahului tanggal peminjaman.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddLoan({
        member_id: selectedMemberId,
        book_id: parseInt(selectedBookId, 10),
        loan_date: loanDate,
        due_date: dueDate
      });
      setFormSuccess("Peminjaman buku sekolah dideklarasikan sukses!");
      
      // Reset inputs
      setSelectedBookId("");
      setSelectedMemberId("");
      setLoanDate(getTodayStr());
      setDueDate(getSevenDaysLaterStr());
    } catch (err: any) {
      setFormError(err.message || "Gagal mencatatkan peminjaman baru.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 text-left animate-fade-in" id="admin-loans-container">
      
      {/* LEFT: Peminjaman Form Input */}
      <div className="lg:col-span-4 flex flex-col space-y-4">
        <div className="glass-panel p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4 text-indigo-600">
            <CalendarCheck className="w-5 h-5" />
            <h3 className="font-display font-extrabold text-slate-800 text-sm">Form Peminjaman Digital</h3>
          </div>

          <form onSubmit={handleLoanSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
            {formError && (
              <div id="loan-error-alert" className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-1.5 font-medium">
                <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div id="loan-success-alert" className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-start gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Select School Student */}
            <div className="flex flex-col space-y-1">
              <label className="text-slate-700 font-bold">Pilih Siswa (Aktif)</label>
              <select
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2.5-custom border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-850 font-bold focus:outline-none focus:bg-white focus:border-indigo-500 py-2.5"
                id="loan-member-select"
              >
                <option value="">-- Cari / Pilih Anggota Sekolah --</option>
                {activeMembersOnly.map(m => (
                  <option key={m.id} value={m.id} className="font-sans">
                    {m.name} (ID: {m.id}) - Kelas {m.class_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Select Book */}
            <div className="flex flex-col space-y-1">
              <label className="text-slate-700 font-bold">Pilih Buku (Stok Tersedia)</label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2.5-custom border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-850 font-bold focus:outline-none focus:bg-white focus:border-indigo-500 py-2.5"
                id="loan-book-select"
              >
                <option value="">-- Cari / Pilih Buku --</option>
                {instockBooksOnly.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} ({b.author}) [Stok: {b.stock}] - {b.shelf}
                  </option>
                ))}
              </select>
            </div>

            {/* Pinjam Date */}
            <div className="flex flex-col space-y-1">
              <label className="text-slate-700 font-bold">Tanggal Peminjaman</label>
              <input
                type="date"
                value={loanDate}
                onChange={(e) => setLoanDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            {/* Due Date */}
            <div className="flex flex-col space-y-1">
              <label className="text-slate-700 font-bold font-bold">Tanggal Jatuh Tempo (Max 7 Hari)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 font-mono font-bold"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2 text-xs"
              id="loan-save-btn"
            >
              <span>{isSubmitting ? "Memproses..." : "Simpan Transaksi"}</span>
            </button>
          </form>
        </div>

        <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-[10px] text-indigo-900 leading-relaxed">
          <span className="font-bold block mb-1">Standard Kebijakan Sekolah:</span>
          <ul className="list-disc pl-4 space-y-0.5 font-medium text-slate-600">
            <li>Siswa hanya diperbolehkan meminjam buku maksimal 7 hari berurutan.</li>
            <li>Mengembalikan buku melewati tenggat jatuh tempo dikenakan denda keterlambatan sebesar <b>Rp 5.000,- per hari</b>.</li>
          </ul>
        </div>
      </div>

      {/* RIGHT: Active Loans List */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        <div className="glass-panel p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="font-display font-extrabold text-slate-800 text-sm">Daftar Peminjaman Aktif</h3>
              <p className="text-[10px] text-slate-400 font-semibold font-medium">Buku sekolah yang sedang berada di tangan siswa</p>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              {activeLoans.length} Total Pinjam
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-700" id="active-loans-table">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-150">
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Detail Buku</th>
                  <th className="py-2.5 px-3">Tgl Pinjam</th>
                  <th className="py-2.5 px-3">Jatuh Tempo</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeLoans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    {/* Student */}
                    <td className="py-3.5 px-3">
                      <span className="block font-bold text-slate-800">{getMemberName(l.member_id)}</span>
                      <span className="block text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-0.5">NIS: {l.member_id}</span>
                    </td>

                    {/* Book & Shelf */}
                    <td className="py-3.5 px-3">
                      <span className="block font-semibold text-slate-800 truncate max-w-[180px]">{getBookTitle(l.book_id)}</span>
                      <span className="block text-[9px] text-amber-700 font-medium font-mono mt-0.5">LOKASI: {getBookShelf(l.book_id)}</span>
                    </td>

                    {/* Borrow date */}
                    <td className="py-3.5 px-3 text-slate-500 font-mono font-semibold">
                      {l.loan_date}
                    </td>

                    {/* Due date */}
                    <td className="py-3.5 px-3 text-slate-550 font-mono font-bold">
                      {l.due_date}
                    </td>

                    {/* Status badges */}
                    <td className="py-3.5 px-3 text-right">
                      {l.status === "Terlambat" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100">
                          <Clock className="w-3 h-3" />
                          <span>Terlambat</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-750 border border-amber-100">
                          <BookOpen className="w-3 h-3" />
                          <span>Dipinjam</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {activeLoans.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-1">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        <span className="text-xs font-semibold">Seluruh Buku Tersimpan Rapi</span>
                        <span className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                          Tidak ada transaksi peminjaman aktif terdeteksi saat ini.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
