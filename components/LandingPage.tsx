"use client";
import React, { useState } from "react";
import { Book } from "@/lib/types";
import { 
  BookOpen, 
  Search, 
  LogIn, 
  Sparkles, 
  ArrowRight, 
  ShieldAlert,
  Award, 
  CheckCircle2, 
  BookMarked,
  Library
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  books: Book[];
  onOpenLogin: () => void;
  onSelectBook: (book: Book) => void;
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (val: string) => void;
}

export default function LandingPage({ 
  books, 
  onOpenLogin, 
  onSelectBook,
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  selectedCategory: externalSelectedCategory,
  setSelectedCategory: externalSetSelectedCategory
}: LandingPageProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localSelectedCategory, setLocalSelectedCategory] = useState("Semua");

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setLocalSearchTerm;
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : localSelectedCategory;
  const setSelectedCategory = externalSetSelectedCategory || setLocalSelectedCategory;

  const categories = ["Semua", "Novel", "Pengembangan Diri", "Sains & Teknologi", "Sejarah & Sosial"];

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === "Semua" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" id="landing-container">
      {/* Navbar */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto w-[calc(100%-2rem)] md:w-[calc(100%-4rem)] glass-panel rounded-2xl shadow-sm my-2 mt-4" id="landing-header">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5" id="landing-logo">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/20">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900">
                Pustaka<span className="text-indigo-600">Edu</span>
              </span>
              <span className="block text-[10px] text-slate-500 font-medium leading-none tracking-wider uppercase">
                Digital School Library
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="landing-login-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk Perpustakaan</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-transparent pt-10 pb-16" id="landing-hero">
        <div className="absolute inset-0 bg-radial-[at_50%_0%] from-indigo-50/70 via-transparent to-transparent opacity-70 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
              <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100/80 rounded-full text-indigo-700 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pustaka Digital Sekolah Unggulan</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]" id="hero-title">
                Membangun Budaya <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">Literasi Masa Depan</span>
              </h1>
              
              <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                PustakaEdu adalah gerbang digital literasi sekolah terintegrasi yang memudahkan siswa meminjam buku, 
                memantau riwayat peminjaman, dan menikmati ratusan literatur berharga kapan saja dan di mana saja.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a 
                  href="#katalog-section" 
                  className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all text-center shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-2"
                >
                  <span>Lihat Katalog Buku</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <button 
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all hover:border-slate-300 text-center"
                >
                  Portal Guru & Siswa
                </button>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100 max-w-lg mx-auto lg:mx-0">
                <div>
                  <span className="block font-display text-2xl sm:text-3xl font-extrabold text-slate-900">1,500+</span>
                  <span className="text-xs text-slate-500 font-medium">Buku Berlisensi</span>
                </div>
                <div>
                  <span className="block font-display text-2xl sm:text-3xl font-extrabold text-slate-900">450+</span>
                  <span className="text-xs text-slate-500 font-medium">Siswa Aktif</span>
                </div>
                <div>
                  <span className="block font-display text-2xl sm:text-3xl font-extrabold text-slate-900">99.2%</span>
                  <span className="text-xs text-slate-500 font-medium">Tepat Waktu</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center relative">
              <div className="relative w-72 sm:w-80 h-96 bg-indigo-100 rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600" 
                  alt="Students Reading"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white text-left">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
                    <Award className="w-4 h-4" />
                    <span>Perpustakaan Digital Terbaik</span>
                  </div>
                  <h3 className="font-display font-bold text-lg leading-tight">Meningkatkan Prestasi Lewat Kebiasaan Membaca</h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">Perpustakaan kami menyediakan buku-buku bimbingan akademis, kurikulum merdeka, novel populer, dan pengembangan diri.</p>
                </div>
              </div>

              {/* Float decor widgets */}
              <div className="absolute -left-6 bottom-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100/80 flex items-center gap-3 animate-bounce">
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Bebas Denda</span>
                  <span className="text-[10px] text-slate-500 font-medium">Jika tepat waktu</span>
                </div>
              </div>

              <div className="absolute -right-6 top-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100/80 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <BookMarked className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Kemudahan Meminjam</span>
                  <span className="text-[10px] text-slate-500 font-medium">Cukup pakai NIS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Search Header */}
      <section id="katalog-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow">
        <div className="text-center max-w-3xl mx-auto mb-10 flex flex-col space-y-3">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900">
            Jelajahi Koleksi Buku Sekolah
          </h2>
          <p className="text-slate-600 text-sm">
            Temukan ribuan buku fiksi, non-fiksi, sains, sejarah, dan kurikulum terbaru. Gunakan pencarian di bawah untuk mencari instan berdasarkan judul atau pengarang.
          </p>
        </div>

        {/* Filters Container */}
        <div className="glass-panel p-4 rounded-2xl mb-8">
          <div className="grid md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-7 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari buku berdasarkan judul, pengarang, atau ISBN..."
                className="w-full pl-11 pr-4 py-3 glass-input rounded-xl text-sm focus:outline-none focus:bg-white transition-all text-slate-800"
                id="landing-search-input"
              />
            </div>

            {/* Category Selectors */}
            <div className="md:col-span-5 flex flex-wrap gap-2 justify-end">
              {categories.map((cat, idx) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                    selectedCategory === cat
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                      : "glass-pill hover:bg-slate-200/50 text-slate-600"
                  }`}
                  id={`cat-filter-${idx}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Catalog Grid */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="landing-books-grid">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => onSelectBook(book)}
              className="group glass-panel rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
              id={`landing-book-card-${book.id}`}
            >
              {/* Product Cover image container */}
              <div className="relative pt-[125%] bg-slate-100 overflow-hidden">
                <img
                  src={book.cover_url}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                
                {/* Category tag status bubble */}
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  {book.category}
                </span>

                {/* Stock status indicator */}
                {book.stock > 0 ? (
                  <span className="absolute bottom-3 right-3 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    Stok: {book.stock}
                  </span>
                ) : (
                  <span className="absolute bottom-3 right-3 bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1 shadow-sm">
                    Kosong
                  </span>
                )}
              </div>

              {/* Card Meta Content */}
              <div className="p-4 flex flex-col flex-grow text-left">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
                  {book.author}
                </span>
                <h3 className="font-display font-bold text-slate-800 text-sm mt-1 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed flex-grow">
                  {book.description || "Tidak ada deskripsi lengkap mengenai buku sekolah ini."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-600">
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-mono">{book.shelf}</span>
                  <span>Tahun: {book.published_year}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredBooks.length === 0 && (
            <div className="col-span-full py-16 flex flex-col items-center text-center text-slate-500 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <Library className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-medium">Tidak ada buku ditemukan</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Kata kunci pencarian "{searchTerm}" tidak sesuai dengan buku apa pun di perpustakaan PustakaEdu.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Literary quote CTA Banner */}
      <section className="bg-slate-900 text-white py-14 relative overflow-hidden" id="landing-quote-section">
        <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 flex flex-col space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Mutu Hari Ini</span>
          <p className="font-display text-lg sm:text-2xl font-semibold italic text-slate-100 leading-relaxed">
            "Membaca adalah alat paling mendasar untuk memperoleh pengetahuan luas, melatih kecerdasan bernalar, dan memperluas imajinasi tanpa batas."
          </p>
          <div className="text-sm font-semibold text-slate-300">— Ki Hajar Dewantara</div>
          <div className="pt-4">
            <button 
              onClick={onOpenLogin}
              className="px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-all rounded-xl text-xs font-bold tracking-wider uppercase shadow-xl hover:shadow-indigo-600/25"
            >
              Mulai Membaca & Pinjam Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* School Footer */}
      <footer className="bg-slate-950 text-slate-500 py-10 border-t border-slate-900 text-sm" id="landing-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex flex-col space-y-1">
            <span className="font-display font-bold text-slate-200">SD/SMP/SMA PustakaEdu Terpadu</span>
            <span className="text-xs text-slate-500">Sistem Informasi Perpustakaan Digital Sekolah Terakreditasi A</span>
          </div>
          <div className="text-xs text-slate-400 flex flex-col space-y-1">
            <span>© 2026 PustakaEdu. Hak cipta dilindungi undang-undang.</span>
            <span>di buat oleh Halena Kamila Madani</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
