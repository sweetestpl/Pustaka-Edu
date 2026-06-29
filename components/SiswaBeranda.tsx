"use client";
import React, { useState } from "react";
import { Book } from "@/lib/types";
import { 
  Search, 
  Library, 
  BookMarked, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  X,
  Compass,
  Heart
} from "lucide-react";

interface SiswaBerandaProps {
  books: Book[];
  studentName: string;
  onSelectBook: (book: Book) => void;
  favorites?: number[];
  onToggleFavorite?: (bookId: number) => void;
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (val: string) => void;
}

export default function SiswaBeranda({ 
  books, 
  studentName, 
  onSelectBook,
  favorites = [],
  onToggleFavorite,
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  selectedCategory: externalSelectedCategory,
  setSelectedCategory: externalSetSelectedCategory
}: SiswaBerandaProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localSelectedCategory, setLocalSelectedCategory] = useState("Semua");

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setLocalSearchTerm;
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : localSelectedCategory;
  const setSelectedCategory = externalSetSelectedCategory || setLocalSelectedCategory;

  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const categories = ["Semua", "Favorit Saya", "Novel", "Pengembangan Diri", "Sains & Teknologi", "Sejarah & Sosial"];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Support category filter including "Favorit Saya"
    let matchesCategory = false;
    if (selectedCategory === "Semua") {
      matchesCategory = true;
    } else if (selectedCategory === "Favorit Saya") {
      matchesCategory = favorites.includes(b.id);
    } else {
      matchesCategory = b.category === selectedCategory;
    }

    const matchesAvailability = !showOnlyAvailable || b.stock > 0;
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="flex flex-col space-y-6 text-left animate-fade-in" id="siswa-catalog-main">
      
      {/* Welcome student badge banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 p-6 rounded-2xl text-white relative overflow-hidden shadow-lg shadow-indigo-600/10">
        <div className="absolute inset-0 bg-radial-[at_100%_0%] from-indigo-300/15 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Portal Siswa Aktif</span>
            </div>
            <h1 className="font-display font-black text-2xl tracking-tight mt-1">Halo, {studentName}!</h1>
            <p className="text-indigo-100 text-xs font-normal">Jelajahi, baca sirkulasi, dan pesan pinjaman buku sekolah secara mandiri.</p>
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10 self-start md:self-auto flex items-center gap-2">
            <Compass className="w-4.5 h-4.5 text-indigo-300" />
            <span className="text-[11px] font-bold">Akses Baca Terbuka Terakreditasi</span>
          </div>
        </div>
      </div>

      {/* Interactive shelf filter widgets */}
      <div className="glass-panel p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-20">
        
        {/* Search Input */}
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul buku atau pengarang..."
            className="w-full pl-9 pr-4 py-2 glass-input rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white/80 transition-all"
            id="siswa-search-input"
          />
        </div>

        {/* Categories filters tabs */}
        <div className="flex flex-wrap gap-1.5 items-center bg-slate-200/30 backdrop-blur-md p-1 rounded-2xl border border-white/20">
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat 
                  ? "bg-white/90 text-indigo-700 shadow-sm font-extrabold border border-indigo-200/20" 
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/40"
              }`}
              id={`siswa-filter-${idx}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Toggle Available books checkbox */}
        <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition cursor-pointer self-start md:self-auto select-none bg-white/40 hover:bg-white/60 px-3.5 py-1.5 rounded-xl border border-white/20 shadow-sm">
          <input
            type="checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
            className="appearance-none w-4.5 h-4.5 bg-white/50 border border-slate-300 rounded-lg checked:bg-indigo-600 checked:border-indigo-600 relative cursor-pointer flex items-center justify-center transition-all focus:outline-none after:content-['✓'] after:text-[10px] after:text-white after:font-bold after:hidden checked:after:block"
            id="siswa-available-toggle"
          />
          <span>Hanya buku tersedia</span>
        </label>
      </div>

      {/* Catalog items display */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5" id="siswa-books-grid">
        {filteredBooks.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="group glass-panel rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition duration-350 cursor-pointer flex flex-col h-full"
            id={`siswa-book-item-${book.id}`}
          >
            {/* Thumbnail */}
            <div className="relative pt-[125%] bg-slate-50 overflow-hidden">
              <img
                src={book.cover_url}
                alt={book.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur border border-white/10 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {book.category}
              </span>

              {/* Heart favorite shorthand toggle on thumbnail corner */}
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(book.id);
                  }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-slate-400 hover:text-rose-600 transition duration-200 active:scale-90 shadow-sm z-10 cursor-pointer"
                  title={favorites.includes(book.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                  id={`siswa-book-fav-${book.id}`}
                >
                  <Heart className={`w-3.5 h-3.5 transition-colors ${favorites.includes(book.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                </button>
              )}
              
              {book.stock > 0 ? (
                <span className="absolute bottom-2.5 left-2.5 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase shadow">
                  Ready ({book.stock})
                </span>
              ) : (
                <span className="absolute bottom-2.5 left-2.5 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-lg uppercase shadow">
                  Kosong
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="p-3.5 flex flex-col flex-grow text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{book.author}</span>
              <h4 className="font-display font-bold text-slate-800 text-xs mt-1 mb-1.5 leading-snug line-clamp-1 group-hover:text-indigo-650 transition">
                {book.title}
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2 flex-grow">
                {book.description || "Uraian intisari novel lengkap."}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{book.shelf}</span>
                <span>Tahun: {book.published_year}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredBooks.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 glass-panel rounded-2xl flex flex-col items-center justify-center border-dashed">
            <Library className="w-10 h-10 text-slate-300 mb-2" />
            <p className="font-semibold text-sm">Tidak ada buku digital ditemukan</p>
            <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
              Silakan bersihkan filter kata kunci pencarian Anda untuk menampilkan koleksi buku di papan beranda.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
