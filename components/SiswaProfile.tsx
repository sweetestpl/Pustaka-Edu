"use client";
import React from "react";
import { Member } from "@/lib/types";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  LogOut, 
  Contact, 
  ShieldCheck, 
  Activity, 
  Award,
  IdCard,
  Compass
} from "lucide-react";

interface SiswaProfileProps {
  member: Member | null;
  onLogout: () => void;
}

export default function SiswaProfile({ member, onLogout }: SiswaProfileProps) {
  if (!member) {
    return (
      <div className="glass-panel p-8 rounded-2xl shadow-sm text-center text-slate-500 font-semibold py-12">
        Memuat data profil siswa...
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-12 gap-6 text-left animate-fade-in" id="siswa-profile-main">
      
      {/* LEFT: Swiss style membership card element */}
      <div className="lg:col-span-5 flex flex-col space-y-4">
        
        {/* Card Component */}
        <div className="bg-gradient-to-tr from-indigo-950/80 via-slate-900/80 to-indigo-900/60 backdrop-blur-xl text-white rounded-3xl p-6 relative overflow-hidden shadow-2xl border border-white/10" id="digital-student-card">
          {/* Abstract pattern decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-24 h-24 bg-pink-500/10 rounded-full blur-xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/10 rounded-lg border border-white/10">
                <IdCard className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <span className="font-display font-black text-sm tracking-wide">KARTU PERPUSTAKAAN</span>
                <span className="block text-[8px] tracking-wider text-indigo-200 uppercase font-bold">PustakaEdu Digital Card</span>
              </div>
            </div>
            
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {member.status}
            </span>
          </div>

          {/* Card Body */}
          <div className="space-y-4 text-xs font-semibold">
            {/* Student Name */}
            <div className="space-y-1">
              <span className="text-[9px] text-indigo-300 uppercase font-black tracking-wider leading-none">Nama Anggota</span>
              <h3 className="text-lg font-display font-extrabold tracking-wide uppercase truncate">
                {member.name}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* NIS */}
              <div className="space-y-1">
                <span className="text-[9px] text-indigo-300 uppercase font-black tracking-wider leading-none">Nomor Induk Siswa (NIS)</span>
                <span className="font-mono text-sm font-extrabold tracking-widest block mt-0.5">{member.id}</span>
              </div>

              {/* Class */}
              <div className="space-y-1">
                <span className="text-[9px] text-indigo-300 uppercase font-black tracking-wider leading-none">Kelas Belajar</span>
                <span className="text-sm font-bold block mt-0.5">KELAS {member.class_name}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[8px] text-indigo-300 uppercase font-bold font-mono">
            <span>Berlaku Selama Siswa Aktif</span>
            <span>ID: P-EDU-{member.id}</span>
          </div>
        </div>

        {/* Quick logout button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-3 glass-btn-secondary font-bold rounded-2xl text-xs transition active:scale-98 cursor-pointer"
          id="siswa-logout-btn"
        >
          <LogOut className="w-4 h-4 text-slate-500" />
          <span>Keluar Sesi Perpustakaan</span>
        </button>
      </div>

      {/* RIGHT: Detailed profile meta parameters */}
      <div className="lg:col-span-7 glass-panel p-5 rounded-2xl shadow-sm space-y-4">
        
        <div className="pb-3 border-b border-slate-200/50 flex items-center gap-2 text-indigo-700">
          <Compass className="w-5 h-5 text-indigo-500" />
          <h3 className="font-display font-extrabold text-slate-800 text-sm">Informasi Data Pribadi</h3>
        </div>

        {/* Profile list */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-650">
          {/* Email */}
          <div className="p-3 bg-white/40 border border-slate-200/40 backdrop-blur-sm rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Email Terdaftar</span>
            </div>
            <span className="text-slate-800 font-bold block truncate">{member.email || "Tidak ada email terdaftar"}</span>
          </div>

          {/* Phone */}
          <div className="p-3 bg-white/40 border border-slate-200/40 backdrop-blur-sm rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Phone className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Nomer Telepon / WA</span>
            </div>
            <span className="text-slate-800 font-bold block font-mono">{member.phone || "Tidak ada telepon terdaftar"}</span>
          </div>

          {/* Join Date */}
          <div className="p-3 bg-white/40 border border-slate-200/40 backdrop-blur-sm rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Tanggal Bergabung</span>
            </div>
            <span className="text-slate-800 font-bold block font-mono">{member.join_date}</span>
          </div>

          {/* Status Check badge */}
          <div className="p-3 bg-white/40 border border-slate-200/40 backdrop-blur-sm rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Kelayakan Pinjam</span>
            </div>
            <span className={`font-bold block uppercase tracking-wide ${member.status === "Aktif" ? "text-emerald-600" : "text-rose-600"}`}>
              {member.status === "Aktif" ? "Diberikan Izin Penuh" : "Ditangguhkan / Dibekukan"}
            </span>
          </div>
        </div>

        {/* Achievements / activity logs panel */}
        <div className="p-4 bg-emerald-50/40 border border-emerald-200/30 backdrop-blur-sm rounded-xl flex items-start gap-3 text-xs text-emerald-800 font-medium">
          <Award className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-left">
            <span className="font-bold text-slate-800">Apresiasi Literasi Unggul!</span>
            <p className="text-slate-600 leading-relaxed font-normal">
              Anda tercatat sebagai siswa berdisiplin tinggi sirkulasi perpustakaan semeter ini. Pertahankan ketepatan pengembalian buku guna memperluas horizon akademis Anda.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
