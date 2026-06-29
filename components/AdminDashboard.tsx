"use client";
import React, { useState } from "react";
import { DashboardStats, Loan, Book, Member } from "@/lib/types";
import { 
  BookMarked, 
  Users, 
  AlertTriangle, 
  BookOpen, 
  PlusCircle, 
  UserPlus, 
  FileText, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  CalendarDays,
  BarChart4,
  Activity
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from "recharts";

// Premium Custom Tooltip Component for Recharts Bar Chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-3 rounded-xl shadow-xl text-xs font-semibold space-y-1">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-indigo-400 rounded-full" />
          <p className="text-slate-200">
            Peminjaman: <span className="font-mono text-xs font-black text-indigo-300">{payload[0].value}</span> Buku
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface AdminDashboardProps {
  stats: DashboardStats;
  loans: Loan[];
  books: Book[];
  members: Member[];
  onQuickAction: (action: "tambah_buku" | "tambah_anggota" | "peminjaman" | "laporan") => void;
}

export default function AdminDashboard({ stats, loans, books, members, onQuickAction }: AdminDashboardProps) {
  // Find related info for list rendering
  const getBookTitle = (bId: number) => {
    return books.find(b => b.id === bId)?.title || "Buku Terhapus";
  };

  const getMemberName = (mId: string) => {
    const member = members.find(m => m.id === mId);
    return member ? `${member.name} (${member.class_name})` : mId;
  };

  // Recent loans
  const recentLoans = loans.slice(0, 5);

  // Overdue loans (status "Terlambat")
  const overdueLoans = loans.filter(l => l.status === "Terlambat").slice(0, 5);

  const [activeChartTab, setActiveChartTab] = useState<"bar" | "line">("bar");

  // Custom polished SVG Area chart calculations based on stats
  const chartData = stats.monthlyStats.length > 0 ? stats.monthlyStats : [
    { month: "2026-01", count: 12 },
    { month: "2026-02", count: 18 },
    { month: "2026-03", count: 26 },
    { month: "2026-04", count: 15 },
    { month: "2026-05", count: 32 },
    { month: "2026-06", count: 41 }
  ];

  const formatMonthLabel = (monthStr: string) => {
    const parts = monthStr.split("-");
    if (parts.length === 2) {
      const months = [
        "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
        "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
      ];
      const monthIndex = parseInt(parts[1], 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        return `${months[monthIndex]} ${parts[0].slice(2)}`;
      }
    }
    return monthStr;
  };

  const rechartsData = chartData.map((d) => ({
    name: formatMonthLabel(d.month),
    peminjaman: d.count,
  }));

  const maxVal = Math.max(...chartData.map(d => d.count), 10);
  const width = 500;
  const height = 150;
  const paddingX = 40;
  const paddingY = 20;

  // Generate SVG path for a beautiful smooth bezier area chart
  const points = chartData.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (chartData.length - 1);
    const y = height - paddingY - (d.count * (height - paddingY * 2)) / maxVal;
    return { x, y };
  });

  const pathD = points.reduce((acc, p, index) => {
    if (index === 0) return `M ${p.x} ${p.y}`;
    // Curve interpolation
    const prev = points[index - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div id="admin-dashboard-container" className="flex flex-col space-y-6">
      {/* Prime Header & Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute inset-0 bg-radial-[at_100%_0%] from-indigo-500/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight">
              Selamat Datang kembali, Administrator!
            </h1>
            <p className="text-indigo-200 text-sm mt-1.5 max-w-xl font-normal leading-relaxed">
              Pantau totalitas transaksi, distribusi buku kurikulum sekolah, dan status pengembalian siswa dalam satu portal panel terintegrasi.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 self-start md:self-auto">
            <CalendarDays className="w-5 h-5 text-indigo-300" />
            <div className="text-left">
              <span className="block text-[10px] text-indigo-200 font-bold uppercase tracking-wider">Hari & Sesi Ini</span>
              <span className="text-xs font-semibold">{new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Total Koleksi */}
        <div className="glass-panel p-5 rounded-2xl flex items-start justify-between">
          <div className="text-left space-y-1">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Total Eksemplar</span>
            <span className="block font-display text-2xl sm:text-3xl font-extrabold text-slate-800">{stats.totalBooks}</span>
            <span className="block text-[10px] text-slate-400 font-semibold">{stats.uniqueTitles} Judul Buku</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookMarked className="w-5 h-5" />
          </div>
        </div>

        {/* Dipinjam */}
        <div className="glass-panel p-5 rounded-2xl flex items-start justify-between">
          <div className="text-left space-y-1">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Buku Dipinjam</span>
            <span className="block font-display text-2xl sm:text-3xl font-extrabold text-indigo-600">{stats.activeLoans}</span>
            <span className="block text-[10px] text-slate-400 font-semibold">Sedang di tangan siswa</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Keterlambatan */}
        <div className="glass-panel p-5 rounded-2xl flex items-start justify-between">
          <div className="text-left space-y-1">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Buku Terlambat</span>
            <span className="block font-display text-2xl sm:text-3xl font-extrabold text-rose-600">{stats.overdueLoans}</span>
            <span className="block text-[10px] text-rose-500 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Butuh pengembalian</span>
            </span>
          </div>
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Anggota Aktif */}
        <div className="glass-panel p-5 rounded-2xl flex items-start justify-between">
          <div className="text-left space-y-1">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Anggota Sekolah</span>
            <span className="block font-display text-2xl sm:text-3xl font-extrabold text-slate-800">{stats.totalMembers}</span>
            <span className="block text-[10px] text-slate-400 font-semibold">{stats.activeMembers} Siswa Aktif</span>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Row: Activity Chart + Swift Actions */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Chart View with Tab Switcher */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 border-b border-slate-100 pb-3 gap-2">
            <div className="text-left">
              <h3 className="font-display font-extrabold text-slate-800 text-base">Analisis Aktivitas Sirkulasi</h3>
              <p className="text-[11px] text-slate-400 font-medium">Visualisasi volume peminjaman buku bulanan</p>
            </div>
            
            {/* Elegant Tab Switcher */}
            <div className="flex bg-slate-200/50 backdrop-blur-md p-1 rounded-xl border border-slate-200/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveChartTab("bar")}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeChartTab === "bar"
                    ? "bg-white/80 backdrop-blur shadow-sm text-indigo-700 font-extrabold border border-indigo-200/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <BarChart4 className="w-3.5 h-3.5" />
                <span>Grafik Batang</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab("line")}
                className={`flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                  activeChartTab === "line"
                    ? "bg-white/80 backdrop-blur shadow-sm text-indigo-700 font-extrabold border border-indigo-200/20"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Tren Garis</span>
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-center min-h-[220px]">
            {activeChartTab === "bar" ? (
              <div className="w-full h-[220px]" id="recharts-bar-canvas">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechartsData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={{ stroke: '#e2e8f0' }}
                      className="font-mono font-semibold"
                    />
                    <YAxis 
                      stroke="#94a3b8" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false}
                      className="font-mono font-semibold"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                    <Bar 
                      dataKey="peminjaman" 
                      radius={[6, 6, 0, 0]}
                    >
                      {rechartsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === rechartsData.length - 1 ? '#4f46e5' : '#818cf8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="relative w-full flex items-center justify-center p-2" id="svg-area-canvas">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
                    </linearGradient>
                  </defs>
                  
                  {/* grid lines */}
                  <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e2e8f0" strokeWidth="1.5" />

                  {/* Area path */}
                  <path d={areaD} fill="url(#chartGrad)" />

                  {/* Line path */}
                  <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Interaction nodes */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                      <circle cx={p.x} cy={p.y} r="2" fill="#4f46e5" />
                      {/* labels on nodes */}
                      <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155" className="font-mono">
                        {chartData[idx].count}
                      </text>
                      {/* X axis labels */}
                      <text x={p.x} y={height - 5} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#94a3b8">
                        {chartData[idx].month}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Quick action controls panel */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl text-left">
          <h3 className="font-display font-extrabold text-slate-800 text-base mb-1">Aksi Cepat</h3>
          <p className="text-[11px] text-slate-400 font-medium mb-4">Pintasan operasi paling sering digunakan</p>
          
          <div className="flex flex-col space-y-2.5">
            <button
              onClick={() => onQuickAction("tambah_buku")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-800 transition text-xs font-bold"
              id="dash-action-addbook"
            >
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                <span>Tambah Buku Baru</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onQuickAction("tambah_anggota")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-800 transition text-xs font-bold"
              id="dash-action-addstudent"
            >
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-indigo-500" />
                <span>Registrasi Anggota Baru</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onQuickAction("peminjaman")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-800 transition text-xs font-bold"
              id="dash-action-loan"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span>Peminjaman Baru</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => onQuickAction("laporan")}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 text-slate-700 hover:text-indigo-800 transition text-xs font-bold"
              id="dash-action-report"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Cetak & Export Laporan</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="mt-5 p-3.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Sistem sinkronisasi terhubung ke <b>Neon PostgreSQL Cloud Database</b>.</span>
          </div>
        </div>
      </div>

      {/* Subtables Row: Recent Loans vs. Critical Overdue items */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Recent records */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl text-left">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-slate-800 text-sm">Peminjaman Terbaru</h3>
              <p className="text-[10px] text-slate-400 font-semibold">5 aktivitas peminjaman siswa terkini</p>
            </div>
            <button
              onClick={() => onQuickAction("peminjaman")}
              className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline font-bold"
            >
              Urus Peminjaman
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-150">
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Buku</th>
                  <th className="py-2.5 px-3">Tanggal Pinjam</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLoans.map((l, index) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {getMemberName(l.member_id)}
                    </td>
                    <td className="py-3 px-3">
                      {getBookTitle(l.book_id)}
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-mono">
                      {l.loan_date}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        l.status === "Kembali" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : l.status === "Terlambat"
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-amber-50 text-amber-700 border border-amber-100"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {recentLoans.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400 font-medium">Bum! Tidak ada data peminjaman buku terdeteksi.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Critical overdue warnings */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl text-left">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display font-extrabold text-slate-800 text-sm flex items-center gap-1.5 text-rose-600">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Buku Terlambat Balik</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold font-medium">Siswa melampaui batas pinjam 7 hari</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[9px] border-b border-slate-150">
                  <th className="py-2.5 px-3">Siswa</th>
                  <th className="py-2.5 px-3">Buku</th>
                  <th className="py-2.5 px-3 text-right">Jatuh Tempo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {overdueLoans.map((l, index) => (
                  <tr key={l.id} className="hover:bg-slate-50 text-rose-750">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {getMemberName(l.member_id)}
                    </td>
                    <td className="py-3 px-3">
                      {getBookTitle(l.book_id)}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600 font-mono font-semibold">
                      {l.due_date}
                    </td>
                  </tr>
                ))}

                {overdueLoans.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-emerald-600 font-medium flex flex-col items-center justify-center gap-1">
                      <ShieldCheck className="w-7 h-7 text-emerald-500" />
                      <span>Sempurna! Tidak ada peminjaman yang terlambat hari ini.</span>
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
