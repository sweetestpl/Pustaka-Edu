"use client";
import React, { useState } from "react";
import { Member } from "@/lib/types";
import { 
  Users, 
  Search, 
  UserPlus, 
  UserCheck2, 
  UserX2, 
  Trash2, 
  X, 
  PhoneCall, 
  Mail, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface AdminMembersProps {
  members: Member[];
  onAddMember: (memberData: Omit<Member, "join_date">) => Promise<void>;
  onEditMember: (id: string, memberData: Omit<Member, "join_date" | "id">) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export default function AdminMembers({ members, onAddMember, onEditMember, onDeleteMember }: AdminMembersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Form states
  const [nis, setNis] = useState("");
  const [name, setName] = useState("");
  const [className, setClassName] = useState("X-Fase-E1");
  const [status, setStatus] = useState<"Aktif" | "Ditangguhkan">("Aktif");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const classesList = [
    "X-Fase-E1", "X-Fase-E2", 
    "XI-MIPA-1", "XI-MIPA-2", "XI-IPS-1", "XI-IPS-2",
    "XII-MIPA-1", "XII-MIPA-2", "XII-IPS-1", "XII-IPS-2"
  ];

  const filteredMembers = members.filter(m => {
    return m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           m.id.includes(searchTerm) ||
           m.class_name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openFormModal = (member: Member | null = null) => {
    setFormError("");
    if (member) {
      setEditingMember(member);
      setNis(member.id || "");
      setName(member.name || "");
      setClassName(member.class_name || "X-Fase-E1");
      setStatus(member.status || "Aktif");
      setEmail(member.email || "");
      setPhone(member.phone || "");
    } else {
      setEditingMember(null);
      setNis("");
      setName("");
      setClassName("X-Fase-E1");
      setStatus("Aktif");
      setEmail("");
      setPhone("");
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!nis.trim() || !name.trim() || !className.trim()) {
      setFormError("NIS, Nama Siswa, dan Kelas wajib diisi.");
      return;
    }

    if (nis.trim().length < 4) {
      setFormError("NIS Siswa harus minimal 4 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMember) {
        await onEditMember(editingMember.id, {
          name,
          class_name: className,
          status,
          email,
          phone
        });
      } else {
        await onAddMember({
          id: nis,
          name,
          class_name: className,
          status,
          email,
          phone
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || "Gagal menyimpan rincian siswa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (member: Member) => {
    const nextStatus = member.status === "Aktif" ? "Ditangguhkan" : "Aktif";
    const confirmMsg = nextStatus === "Ditangguhkan" 
      ? `Tangguhkan keanggotaan ${member.name}? Siswa yang ditangguhkan tidak diizinkan meminjam buku.`
      : `Aktifkan kembali keanggotaan ${member.name}?`;

    if (window.confirm(confirmMsg)) {
      try {
        await onEditMember(member.id, {
          name: member.name,
          class_name: member.class_name,
          status: nextStatus,
          email: member.email,
          phone: member.phone
        });
      } catch (err: any) {
        alert(err.message || "Gagal mengubah status kelayakan.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`Hapus anggota ${id} secara permanen? Perbuatan ini akan mendrop log transaksi peminjaman miliknya.`)) {
      try {
        await onDeleteMember(id);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus siswa.");
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6 text-left" id="admin-members-container">
      {/* Header and top buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="members-header">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900">Kelola Anggota Perpustakaan</h2>
          <p className="text-xs text-slate-500 font-medium">Registrasi, monitoring, dan suspensi siswa aktif sekolah terdaftar</p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/15 transition-all self-start sm:self-auto"
          id="btn-add-new-member"
        >
          <UserPlus className="w-4.5 h-4.5" />
          <span>Registrasi Siswa</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-4 rounded-2xl shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari siswa berdasarkan Nama, NIS, atau Nama Kelas..."
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs focus:outline-none text-slate-800 transition-all"
            id="members-search-bar"
          />
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4" id="members-cards-grid">
        {filteredMembers.map((m) => (
          <div 
            key={m.id} 
            className="glass-panel p-5 rounded-2xl flex flex-col justify-between group hover:border-slate-350 transition relative overflow-hidden"
            id={`member-card-${m.id}`}
          >
            {/* Corner status light */}
            <div className={`absolute top-0 right-0 w-24 h-24 translate-x-12 -translate-y-12 rotate-45 pointer-events-none opacity-10 ${
              m.status === "Aktif" ? "bg-emerald-500" : "bg-rose-500"
            }`} />

            <div className="text-left space-y-3.5">
              {/* Header card identity */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg border border-indigo-100">
                    Kelas {m.class_name}
                  </span>
                  <h3 className="font-display font-bold text-slate-800 text-sm mt-1.5 leading-tight group-hover:text-indigo-600 transition-colors">
                    {m.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">NIS: {m.id}</span>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                  m.status === "Aktif" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                  <span className={`w-1 h-1 rounded-full ${m.status === "Aktif" ? "bg-emerald-500" : "bg-rose-500"}`} />
                  {m.status}
                </span>
              </div>

              {/* Contact and history details */}
              <div className="space-y-1.5 text-slate-600 text-xs border-t border-slate-100/80 pt-3">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{m.email || "<i>Tidak ada email</i>"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  <span>{m.phone || "<i>Tidak ada telepon</i>"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Bergabung: <strong className="font-mono">{m.join_date}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick configuration triggers */}
            <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => openFormModal(m)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 hover:border-slate-350 text-slate-600 hover:bg-slate-50 transition"
                id={`edit-member-btn-${m.id}`}
              >
                Ubah Profil
              </button>

              <div className="flex items-center gap-1">
                {m.status === "Aktif" ? (
                  <button
                    onClick={() => toggleStatus(m)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                    title="Tangguhkan Keanggotaan"
                    id={`suspend-member-btn-${m.id}`}
                  >
                    <UserX2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => toggleStatus(m)}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                    title="Aktifkan Keanggotaan"
                    id={`activate-member-btn-${m.id}`}
                  >
                    <UserCheck2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => handleDelete(m.id)}
                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Hapus Anggota"
                  id={`delete-member-btn-${m.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 glass-panel rounded-3xl flex flex-col items-center justify-center border-dashed">
            <Users className="w-12 h-12 text-slate-300 mb-2" />
            <p className="font-semibold">Siswa tidak terdaftar</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Tidak ada data pencarian yang cocok dengan kata kunci "{searchTerm}". Sila tambahkan anggota baru bila siswa belum terdaftar.
            </p>
          </div>
        )}
      </div>

      {/* Member Edit / Register Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md" id="member-form-overlay">
          <div className="w-full max-w-md glass-panel-heavy rounded-2xl relative overflow-hidden" id="member-form-card">
            <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600" />

            <div className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="text-left">
                  <h3 className="font-display font-extrabold text-slate-900 text-lg">
                    {editingMember ? "Ubah Informasi Anggota" : "Registrasi Anggota Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Pastikan NIS terdaftar sesuai dengan kartu siswa</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition hover:bg-slate-50 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form body */}
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-4 text-left">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* NIS (Read Only on Edit) */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nomor Induk Siswa (NIS) <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={nis}
                    disabled={!!editingMember}
                    onChange={(e) => setNis(e.target.value)}
                    placeholder="Contoh: 123456"
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-500 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold font-mono"
                  />
                  {!editingMember && (
                    <span className="text-[9px] text-slate-400 font-medium">NIS bersifat permanen sebagai ID login unik siswa.</span>
                  )}
                </div>

                {/* Nama Siswa */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nama Siswa Lengkap <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama lengkap siswa"
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Kelas */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kelas <span className="text-rose-500">*</span></label>
                    <select
                      value={className}
                      onChange={(e) => setClassName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition font-bold"
                    >
                      {classesList.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Kelayakan Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition font-semibold"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Ditangguhkan">Ditangguhkan</option>
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-700">Email Sekolah Siswa</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama.lengkap@school.sch.id"
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Telepon */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nomor Telepon / WhatsApp Orang Tua</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 0812XXXXXXXX"
                    className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-mono"
                  />
                </div>

                {status === "Ditangguhkan" && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10px] text-rose-800 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <span><b>Perhatian:</b> Siswa bersangkutan ditangguhkan dari opsi pinjaman aktif akibat pengembalian buku telat berulang atau alasan kedisiplinan.</span>
                  </div>
                )}

                {/* Submissions */}
                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 font-semibold text-xs rounded-xl transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                  >
                    {isSubmitting ? "Menyimpan..." : "Simpan Anggota"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
