"use client";
import React, { useState } from "react";
import { Book } from "@/lib/types";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Library, 
  Filter, 
  X, 
  Check, 
  BookMarked,
  Info,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon
} from "lucide-react";

interface AdminBooksProps {
  books: Book[];
  onAddBook: (bookData: Omit<Book, "id">) => Promise<void>;
  onEditBook: (id: number, bookData: Omit<Book, "id">) => Promise<void>;
  onDeleteBook: (id: number) => Promise<void>;
  searchTerm?: string;
  setSearchTerm?: (val: string) => void;
  selectedCategory?: string;
  setSelectedCategory?: (val: string) => void;
}

export default function AdminBooks({ 
  books, 
  onAddBook, 
  onEditBook, 
  onDeleteBook,
  searchTerm: externalSearchTerm,
  setSearchTerm: externalSetSearchTerm,
  selectedCategory: externalSelectedCategory,
  setSelectedCategory: externalSetSelectedCategory
}: AdminBooksProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  const [localSelectedCategory, setLocalSelectedCategory] = useState("Semua");

  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;
  const setSearchTerm = externalSetSearchTerm || setLocalSearchTerm;
  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : localSelectedCategory;
  const setSelectedCategory = externalSetSelectedCategory || setLocalSelectedCategory;

  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [isbn, setIsbn] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Novel");
  const [stock, setStock] = useState("1");
  const [shelf, setShelf] = useState("Rak A-1");
  const [coverUrl, setCoverUrl] = useState("");
  const [publishedYear, setPublishedYear] = useState(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // States and helpers for image uploader / drag-and-drop
  const [coverInputMode, setCoverInputMode] = useState<"url" | "file">("url");
  const [isDragging, setIsDragging] = useState(false);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Hanya berkas gambar (.jpg, .png, .jpeg, .webp) yang diperbolehkan.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran berkas gambar maksimal adalah 2MB agar ramah penyimpanan.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setCoverUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const categories = ["Semua", "Novel", "Pengembangan Diri", "Sains & Teknologi", "Sejarah & Sosial"];
  const bookCategories = ["Novel", "Pengembangan Diri", "Sains & Teknologi", "Sejarah & Sosial"];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === "Semua" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openFormModal = (book: Book | null = null) => {
    setFormError("");
    if (book) {
      setEditingBook(book);
      setTitle(book.title || "");
      setIsbn(book.isbn || "");
      setAuthor(book.author || "");
      setCategory(book.category || "Novel");
      setStock(book.stock !== undefined && book.stock !== null ? book.stock.toString() : "0");
      setShelf(book.shelf || "");
      setCoverUrl(book.cover_url || "");
      setPublishedYear(book.published_year !== undefined && book.published_year !== null ? book.published_year.toString() : "");
      setDescription(book.description || "");
      const isBase64 = book.cover_url?.startsWith("data:image/");
      setCoverInputMode(isBase64 ? "file" : "url");
    } else {
      setEditingBook(null);
      setTitle("");
      setIsbn("");
      setAuthor("");
      setCategory("Novel");
      setStock("5");
      setShelf("Rak A-1");
      setCoverUrl("");
      setPublishedYear(new Date().getFullYear().toString());
      setDescription("");
      setCoverInputMode("url");
    }
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !isbn.trim() || !author.trim() || !shelf.trim()) {
      setFormError("Judul, ISBN, Pengarang, dan Rak wajib diisi.");
      return;
    }

    const nStock = parseInt(stock, 10);
    const nYear = parseInt(publishedYear, 10);

    if (isNaN(nStock) || nStock < 0) {
      setFormError("Jumlah stok harus berupa angka positif.");
      return;
    }

    if (isNaN(nYear) || nYear < 1900 || nYear > 2100) {
      setFormError("Tahun terbit berkisar dari 1900 - 2100.");
      return;
    }

    const coverPayload = coverUrl.trim() || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400";

    setIsSubmitting(true);
    try {
      if (editingBook) {
        await onEditBook(editingBook.id, {
          title, imdb: "",
          isbn,
          author,
          category,
          stock: nStock,
          shelf,
          cover_url: coverPayload,
          published_year: nYear,
          description
        } as any);
      } else {
        await onAddBook({
          title,
          isbn,
          author,
          category,
          stock: nStock,
          shelf,
          cover_url: coverPayload,
          published_year: nYear,
          description
        });
      }
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || "Gagal menyimpan buku.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus buku ini secara permanen dari perpustakaan?")) {
      try {
        await onDeleteBook(id);
      } catch (err: any) {
        alert(err.message || "Gagal menghapus buku.");
      }
    }
  };

  return (
    <div className="flex flex-col space-y-6 text-left" id="admin-books-container">
      {/* Title block with trigger button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="books-header">
        <div>
          <h2 className="font-display font-extrabold text-2xl text-slate-900">Kelola Koleksi Buku</h2>
          <p className="text-xs text-slate-500 font-medium">Tambah, edit, dan hapus rincian buku perpustakaan digital sekolah</p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/15 transition-all self-start sm:self-auto"
          id="btn-add-new-book"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {/* Filter panel */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input field */}
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari berdasarkan judul, pengarang, ISBN..."
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs focus:outline-none text-slate-800 transition-all"
            id="books-search-bar"
          />
        </div>

        {/* Tab category filters */}
        <div className="flex flex-wrap gap-1.5 items-center">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1" />
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat 
                  ? "bg-indigo-100/60 backdrop-blur text-indigo-700 border border-indigo-200/20" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/40"
              }`}
              id={`books-filter-${idx}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Datatable */}
      <div className="glass-panel rounded-2xl shadow-sm overflow-hidden" id="books-table-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-705">
            <thead>
              <tr className="bg-slate-50/20 backdrop-blur border-b border-slate-200/30 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 text-left">Buku & ISBN</th>
                <th className="py-3 px-4 text-left">Pengarang</th>
                <th className="py-3 px-4 text-left">Kategori</th>
                <th className="py-3 px-4 text-left">Stok / Status</th>
                <th className="py-3 px-4 text-left">Lokasi Rak</th>
                <th className="py-3 px-4 text-center">Aksi Pelayan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 group" id={`book-row-${b.id}`}>
                  {/* Title & ISBN with mini-image cover */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-13 rounded-lg overflow-hidden relative bg-slate-100 border border-slate-100 flex-shrink-0">
                        <img 
                          src={b.cover_url} 
                          alt={b.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <span className="block font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors leading-tight">{b.title}</span>
                        <span className="block font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-wider">ISBN: {b.isbn}</span>
                      </div>
                    </div>
                  </td>

                  {/* Author */}
                  <td className="py-3 px-4 text-slate-650 font-medium">
                    {b.author}
                  </td>

                  {/* Category badge */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg font-bold text-[10px] uppercase bg-slate-100 text-slate-700 border border-slate-150">
                      {b.category}
                    </span>
                  </td>

                  {/* Stock amount / badge */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {b.stock > 0 ? (
                        <>
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          <span className="font-bold text-emerald-700">Tersedia ({b.stock})</span>
                        </>
                      ) : (
                        <>
                          <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                          <span className="font-bold text-rose-500">Kosong</span>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Shelf index marker */}
                  <td className="py-3 px-4">
                    <span className="bg-amber-50 text-amber-800 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-amber-100 uppercase">
                      {b.shelf}
                    </span>
                  </td>

                  {/* Controllers action trigger */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openFormModal(b)}
                        className="p-1.5 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 rounded-lg transition"
                        title="Edit Buku"
                        id={`edit-book-btn-${b.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Hapus Buku"
                        id={`delete-book-btn-${b.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Library className="w-10 h-10 text-slate-300" />
                      <span className="text-xs font-semibold">Buku tidak ditemukan</span>
                      <span className="text-[10px] text-slate-400 text-slate-400 max-w-xs leading-relaxed">
                        Coba periksa kembali ejaan kata kunci pencarian Anda atau bersihkan filter pencarian.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Add Book Custom Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" id="book-form-overlay">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-100 shadow-2xl relative overflow-hidden" id="book-form-card">
            {/* Accent strip */}
            <div className="absolute top-0 inset-x-0 h-1 bg-indigo-600" />
            
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="text-left">
                  <h3 className="font-display font-extrabold text-slate-900 text-lg">
                    {editingBook ? "Perbarui Detail Buku" : "Tambah Koleksi Buku Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-400">Rincian data informasi buku perpustakaan digital</p>
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
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {/* Title / Judul */}
                  <div className="col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Judul Buku <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Masukkan judul buku sekolah lengkap"
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>

                  {/* Pengarang */}
                  <div className="col-span-1 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Pengarang/Penulis <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Nama pengarang"
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>

                  {/* ISBN */}
                  <div className="col-span-1 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">ISBN <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      placeholder="Contoh: 978-XX-XXXX-XX-X"
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium font-mono"
                    />
                  </div>

                  {/* Kategori */}
                  <div className="col-span-1 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700 font-bold">Kategori Koleksi</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    >
                      {bookCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Lokasi Rak */}
                  <div className="col-span-1 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Lokasi Penyimpanan Rak <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      value={shelf}
                      onChange={(e) => setShelf(e.target.value)}
                      placeholder="Contoh: Rak A-1"
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-bold"
                    />
                  </div>

                  {/* Jumlah Stok */}
                  <div className="col-span-1 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Jumlah Stok <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  {/* Tahun Terbit */}
                  <div className="col-span-1 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Tahun Terbit</label>
                    <input
                      type="number"
                      value={publishedYear}
                      onChange={(e) => setPublishedYear(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-semibold"
                    />
                  </div>

                  {/* Cover URL or File Upload */}
                  <div className="col-span-2 flex flex-col space-y-2">
                    <div className="flex items-center justify-between font-normal">
                      <label className="text-xs font-bold text-slate-700">Gambar Sampul Buku</label>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setCoverInputMode("url")}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                            coverInputMode === "url"
                              ? "bg-white text-indigo-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-extrabold"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Tautan URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCoverInputMode("file")}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-md transition-all ${
                            coverInputMode === "file"
                              ? "bg-white text-indigo-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] font-extrabold"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>Unggah Berkas</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-9">
                        {coverInputMode === "url" ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={coverUrl || ""}
                              onChange={(e) => setCoverUrl(e.target.value)}
                              placeholder="Masukkan tautan URL gambar (https://...)"
                              className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all font-medium"
                            />
                            <span className="text-[10px] text-slate-400 block font-normal">
                              Tempel tautan eksternal langsung, atau beralih ke Unggah Berkas untuk memilih gambar lokal.
                            </span>
                          </div>
                        ) : (
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById("book-cover-file-input")?.click()}
                            className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center space-y-1.5 relative overflow-hidden min-h-[90px] ${
                              isDragging 
                                ? "border-indigo-500 bg-indigo-50/50" 
                                : "border-slate-200 hover:border-indigo-400 bg-slate-50"
                            }`}
                          >
                            <input
                              type="file"
                              id="book-cover-file-input"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            
                            <Upload className={`w-5 h-5 ${isDragging ? "text-indigo-600 animate-bounce" : "text-slate-400"}`} />
                            <div className="space-y-0.5 pointer-events-none">
                              <span className="block text-[11px] font-bold text-slate-705">
                                Seret gambar ke sini, atau <span className="text-indigo-650 hover:underline font-extrabold">pilih berkas</span>
                              </span>
                              <span className="block text-[9px] text-slate-400">
                                Berkas gambar (JPG, PNG, WEBP) maks. 2MB
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cover Preview Thumbnail */}
                      <div className="col-span-3 flex flex-col items-center justify-center">
                        <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shadow-sm relative flex items-center justify-center group text-center">
                          {coverUrl ? (
                            <>
                              <img 
                                src={coverUrl} 
                                alt="Pratinjau Sampul" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                type="button"
                                onClick={() => setCoverUrl("")}
                                className="absolute inset-0 bg-slate-900/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-[10px] cursor-pointer"
                                title="Hapus Sampul"
                              >
                                Hapus
                              </button>
                            </>
                          ) : (
                            <div className="p-2 text-[9px] text-slate-400 font-semibold flex flex-col items-center gap-1 leading-tight">
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                              <span>Kosong</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div className="col-span-2 flex flex-col space-y-1">
                    <label className="text-xs font-bold text-slate-700">Deskripsi Singkat Novel/Buku</label>
                    <textarea
                      value={description || ""}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Uraikan intisari atau ringkasan singkat isi buku sekolah ini..."
                      rows={3}
                      className="w-full px-3.5 py-2 border border-slate-200 bg-slate-50 rounded-xl text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Submitions */}
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
                    {isSubmitting ? "Menyimpan..." : "Simpan Buku"}
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
