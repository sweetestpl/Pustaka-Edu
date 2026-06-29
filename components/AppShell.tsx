"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Book, Member, Loan, DashboardStats, UserRole
} from "@/lib/types";
import {
  BookOpen, LogIn, LogOut, LayoutDashboard, BookMarked,
  Users, CalendarDays, Clock, FileSpreadsheet,
  Compass, History, User, X, Sparkles,
  BookOpenCheck, Heart, CheckCircle2, XCircle, Star
} from "lucide-react";
import LandingPage from "./LandingPage";
import LoginPage from "./LoginPage";
import AdminDashboard from "./AdminDashboard";
import AdminBooks from "./AdminBooks";
import AdminMembers from "./AdminMembers";
import AdminLoans from "./AdminLoans";
import AdminReturns from "./AdminReturns";
import AdminReports from "./AdminReports";
import SiswaBeranda from "./SiswaBeranda";
import SiswaHistory from "./SiswaHistory";
import SiswaProfile from "./SiswaProfile";
import BookDetailScanner from "./BookDetailScanner";

const getPublisher = (book: Book | null): string => {
  if (!book) return "Penerbit Sekolah";
  const titleLower = book.title?.toLowerCase() || "";
  if (titleLower.includes("laskar pelangi")) return "Bentang Pustaka";
  if (titleLower.includes("bumi") || titleLower.includes("habits")) return "Gramedia Pustaka Utama";
  if (titleLower.includes("filosofi teras")) return "Penerbit Buku Kompas";
  if (titleLower.includes("fisika")) return "Penerbit Erlangga";
  if (titleLower.includes("sejarah dunia")) return "Penerbit Alvabet";
  if (book.category === "Sains & Teknologi") return "Penerbit Erlangga";
  if (book.category === "Pengembangan Diri") return "Penerbit Gramedia";

  const fallbackPublishers = [
    "Gramedia Pustaka Utama",
    "Penerbit Erlangga",
    "Balai Pustaka",
    "Bentang Pustaka",
    "Pustaka Utama",
    "Yrama Widya"
  ];
  return fallbackPublishers[(book.id || 0) % fallbackPublishers.length];
};

export default function AppShell() {
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBooks: 0, uniqueTitles: 0, activeLoans: 0,
    totalMembers: 0, activeMembers: 0, overdueLoans: 0,
    monthlyStats: []
  });

  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [activeSiswaTab, setActiveSiswaTab] = useState<string>("beranda");

  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("Semua");
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminCategory, setAdminCategory] = useState("Semua");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedBookDetail, setSelectedBookDetail] = useState<Book | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const [gBooksData, setGBooksData] = useState<{
    summary: string | null;
    highResCover: string | null;
    loading: boolean;
    error: boolean;
  } | null>(null);

  const [favorites, setFavorites] = useState<number[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("pustaka_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("pustaka_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const handleToggleFavorite = (bookId: number) => {
    setFavorites(prev =>
      prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
    );
  };

  const [ratings, setRatings] = useState<Record<number, number>>(() => {
    if (typeof window === "undefined") {
      return { 1: 5, 2: 4, 3: 5, 4: 5, 5: 4, 6: 4 };
    }
    try {
      const saved = localStorage.getItem("pustaka_ratings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { 1: 5, 2: 4, 3: 5, 4: 5, 5: 4, 6: 4 };
  });

  const handleUpdateRating = (bookId: number, ratingValue: number) => {
    setRatings(prev => {
      const updated = { ...prev, [bookId]: ratingValue };
      if (typeof window !== "undefined") {
        localStorage.setItem("pustaka_ratings", JSON.stringify(updated));
      }
      return updated;
    });
  };

  useEffect(() => {
    if (!selectedBookDetail) {
      setGBooksData(null);
      return;
    }
    const controller = new AbortController();
    const fetchGoogleBooks = async () => {
      setGBooksData({ summary: null, highResCover: null, loading: true, error: false });
      try {
        const title = selectedBookDetail.title;
        const author = selectedBookDetail.author;
        const cleanTitle = title.replace(/(kelas|Kls|Semester|Smt|Kurtilas|Kurikulum|No\.)\s*[a-zA-Z0-9]*/gi, "").trim();
        const query1 = `intitle:${encodeURIComponent(cleanTitle)}+inauthor:${encodeURIComponent(author)}`;
        const url1 = `https://www.googleapis.com/books/v1/volumes?q=${query1}&maxResults=1`;
        let response = await fetch(url1, { signal: controller.signal });
        let resData: any = null;
        if (response.ok) resData = await response.json();

        if (!resData || !resData.items || resData.items.length === 0) {
          const query2 = `${encodeURIComponent(cleanTitle)} ${encodeURIComponent(author)}`;
          const url2 = `https://www.googleapis.com/books/v1/volumes?q=${query2}&maxResults=1`;
          const resp2 = await fetch(url2, { signal: controller.signal });
          if (resp2.ok) resData = await resp2.json();
        }

        if (!resData || !resData.items || resData.items.length === 0) {
          const simplifiedTitle = cleanTitle.split(" ").slice(0, 4).join(" ");
          const url3 = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(simplifiedTitle)}&maxResults=1`;
          const resp3 = await fetch(url3, { signal: controller.signal });
          if (resp3.ok) resData = await resp3.json();
        }

        if (resData && resData.items && resData.items.length > 0) {
          const info = resData.items[0].volumeInfo;
          const apiDescription = info.description || null;
          let apiCover = null;
          if (info.imageLinks) {
            const links = info.imageLinks;
            apiCover = links.extraLarge || links.large || links.medium || links.small || links.thumbnail || links.smallThumbnail || null;
            if (apiCover) {
              apiCover = apiCover.replace("http://", "https://");
              if (apiCover.includes("&zoom=")) {
                apiCover = apiCover.replace(/&zoom=[0-9]/, "&zoom=2");
              }
            }
          }
          setGBooksData({ summary: apiDescription, highResCover: apiCover, loading: false, error: false });
        } else {
          setGBooksData({ summary: null, highResCover: null, loading: false, error: false });
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.warn("Graceful fallback for Google Books API:", err);
        setGBooksData({ summary: null, highResCover: null, loading: false, error: false });
      }
    };
    fetchGoogleBooks();
    return () => controller.abort();
  }, [selectedBookDetail]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsDataLoading(true);
    try {
      const [bRes, mRes, lRes, sRes] = await Promise.all([
        fetch("/api/books").then(r => r.json()),
        fetch("/api/members").then(r => r.json()),
        fetch("/api/loans").then(r => r.json()),
        fetch("/api/stats").then(r => r.json())
      ]);
      setBooks(bRes);
      setMembers(mRes);
      setLoans(lRes);
      setStats(sRes);
    } catch (e) {
      console.error("Gagal mendapatkan dataset dari server:", e);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleAddBook = async (bookData: Omit<Book, "id">) => {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal menambahkan buku.");
    }
    await fetchAllData();
  };

  const handleEditBook = async (id: number, bookData: Omit<Book, "id">) => {
    const res = await fetch(`/api/books/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal memperbarui buku.");
    }
    await fetchAllData();
  };

  const handleDeleteBook = async (id: number) => {
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal menghapus buku.");
    }
    await fetchAllData();
  };

  const handleAddMember = async (memberData: Omit<Member, "join_date">) => {
    const res = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal meregistrasikan siswa.");
    }
    await fetchAllData();
  };

  const handleEditMember = async (id: string, memberData: Omit<Member, "join_date" | "id">) => {
    const res = await fetch(`/api/members/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(memberData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal merubah rincian siswa.");
    }
    await fetchAllData();
  };

  const handleDeleteMember = async (id: string) => {
    const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal menghapus siswa.");
    }
    await fetchAllData();
  };

  const handleAddLoan = async (loanData: { member_id: string; book_id: number; loan_date: string; due_date: string }) => {
    const res = await fetch("/api/loans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loanData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal memproses peminjaman.");
    }
    await fetchAllData();
  };

  const handleReturnBook = async (loanId: number, returnDate: string) => {
    const res = await fetch(`/api/loans/${loanId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ return_date: returnDate })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Gagal mengembalikan buku.");
    }
    await fetchAllData();
  };

  const handleLoginSuccess = (role: UserRole, identifier: string) => {
    setUserRole(role);
    setUserIdentifier(identifier);
    setShowLoginModal(false);
    if (role === UserRole.ADMIN) {
      setActiveTab("dashboard");
    } else {
      setActiveSiswaTab("beranda");
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setUserIdentifier("");
  };

  const getLoggedInStudentName = () => {
    if (userRole !== UserRole.SISWA) return "";
    const member = members.find(m => m.id === userIdentifier);
    return member ? member.name : `Siswa #${userIdentifier}`;
  };

  const getLoggedInStudentMember = () => {
    if (userRole !== UserRole.SISWA) return null;
    return members.find(m => m.id === userIdentifier) || null;
  };

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col font-sans text-slate-800 antialiased relative overflow-hidden" id="main-app-shell">
      <div className="liquid-bg-blob liquid-bg-blob-1" />
      <div className="liquid-bg-blob liquid-bg-blob-2" />
      <div className="liquid-bg-blob liquid-bg-blob-3" />

      <div className="relative z-10 flex flex-col flex-grow w-full">

        {!userRole && (
          <div id="public-shell" className="flex flex-col min-h-screen">
            <LandingPage
              books={books}
              onOpenLogin={() => setShowLoginModal(true)}
              onSelectBook={(book) => setSelectedBookDetail(book)}
              searchTerm={catalogSearchQuery}
              setSearchTerm={setCatalogSearchQuery}
              selectedCategory={catalogCategory}
              setSelectedCategory={setCatalogCategory}
            />
          </div>
        )}

        {userRole === UserRole.ADMIN && (
          <div className="w-full bg-slate-50/40 flex justify-center" id="admin-shell-outer">
            <div className="flex flex-col md:flex-row min-h-screen w-full max-w-[1440px] px-2 md:px-4" id="admin-shell">

              <aside className="w-full md:w-64 glass-panel-dark text-slate-300 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-700/30 flex-shrink-0 md:m-4 md:rounded-2xl md:h-[calc(100vh-2rem)] sticky top-0 md:top-4 z-40" id="admin-sidebar">
                <div className="flex flex-col">
                  <div className="p-5 border-b border-slate-800/50 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow shadow-indigo-600/30">
                      <BookOpenCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left select-none">
                      <h3 className="font-display font-extrabold text-slate-100 text-base leading-none tracking-tight">PustakaEdu</h3>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 mt-1 block">Petugas Portal</span>
                    </div>
                  </div>

                  <nav className="p-4 space-y-1 text-xs font-bold text-left" id="admin-nav">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        activeTab === "dashboard"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                          : "hover:bg-slate-850 hover:text-slate-200"
                      }`}
                      id="nav-admin-dashboard"
                    >
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard Admin</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("books")}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        activeTab === "books"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                          : "hover:bg-slate-850 hover:text-slate-200"
                      }`}
                      id="nav-admin-books"
                    >
                      <div className="flex items-center gap-3">
                        <BookMarked className="w-4 h-4" />
                        <span>Kelola Data Buku</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("members")}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        activeTab === "members"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                          : "hover:bg-slate-850 hover:text-slate-200"
                      }`}
                      id="nav-admin-members"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4" />
                        <span>Kelola Data Anggota</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("loans")}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        activeTab === "loans"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                          : "hover:bg-slate-850 hover:text-slate-200"
                      }`}
                      id="nav-admin-loans"
                    >
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4 h-4" />
                        <span>Peminjaman Baru</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("returns")}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        activeTab === "returns"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                          : "hover:bg-slate-850 hover:text-slate-200"
                      }`}
                      id="nav-admin-returns"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4" />
                        <span>Pengembalian Sirkulasi</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab("reports")}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-all ${
                        activeTab === "reports"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                          : "hover:bg-slate-850 hover:text-slate-200"
                      }`}
                      id="nav-admin-reports"
                    >
                      <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Laporan Mutasi</span>
                      </div>
                    </button>

                  </nav>
                </div>

                <div className="p-4 border-t border-slate-800/40">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-red-950/25 hover:bg-rose-900/30 border border-rose-900/20 text-rose-300 hover:text-rose-100 rounded-xl transition font-semibold text-xs text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Petugas</span>
                  </button>
                </div>
              </aside>

              <main className="flex-grow p-4 sm:p-6 md:p-8 w-full transition-all" id="admin-main">
                {isDataLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-500">Menyinkronkan data dari cloud server...</span>
                  </div>
                ) : (
                  <>
                    {activeTab === "dashboard" && (
                      <AdminDashboard
                        stats={stats}
                        loans={loans}
                        books={books}
                        members={members}
                        onQuickAction={(action) => {
                          if (action === "tambah_buku") setActiveTab("books");
                          else if (action === "tambah_anggota") setActiveTab("members");
                          else if (action === "peminjaman") setActiveTab("loans");
                          else if (action === "laporan") setActiveTab("reports");
                        }}
                      />
                    )}

                    {activeTab === "books" && (
                      <AdminBooks
                        books={books}
                        onAddBook={handleAddBook}
                        onEditBook={handleEditBook}
                        onDeleteBook={handleDeleteBook}
                        searchTerm={adminSearchQuery}
                        setSearchTerm={setAdminSearchQuery}
                        selectedCategory={adminCategory}
                        setSelectedCategory={setAdminCategory}
                      />
                    )}

                    {activeTab === "members" && (
                      <AdminMembers
                        members={members}
                        onAddMember={handleAddMember}
                        onEditMember={handleEditMember}
                        onDeleteMember={handleDeleteMember}
                      />
                    )}

                    {activeTab === "loans" && (
                      <AdminLoans
                        books={books}
                        members={members}
                        loans={loans}
                        onAddLoan={handleAddLoan}
                      />
                    )}

                    {activeTab === "returns" && (
                      <AdminReturns
                        books={books}
                        members={members}
                        loans={loans}
                        onReturnBook={handleReturnBook}
                      />
                    )}

                    {activeTab === "reports" && (
                      <AdminReports
                        books={books}
                        members={members}
                        loans={loans}
                      />
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        )}

        {userRole === UserRole.SISWA && (
          <div className="w-full bg-slate-50/40 flex justify-center" id="siswa-shell-outer">
            <div className="flex flex-col min-h-screen text-slate-800 w-full max-w-7xl px-4 sm:px-6 lg:px-8" id="siswa-shell">

              <header className="sticky top-4 z-50 glass-panel rounded-2xl shadow-sm mb-2 mt-4 w-full" id="siswa-header">
                <div className="px-4 sm:px-6 h-16 flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-xl shadow-md">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="text-left select-none">
                      <h3 className="font-display font-extrabold text-slate-900 text-sm leading-none tracking-tight">PustakaEdu</h3>
                      <span className="text-[8px] uppercase tracking-wider font-bold text-slate-400 mt-0.5 block">Siswa Dashboard</span>
                    </div>
                  </div>

                  <div className="flex space-x-1.5 font-sans" id="siswa-nav">

                    <button
                      onClick={() => setActiveSiswaTab("beranda")}
                      className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeSiswaTab === "beranda"
                          ? "bg-indigo-100/60 backdrop-blur-md text-indigo-700 border border-indigo-200/20"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/40 rounded-xl"
                      }`}
                      id="siswa-tab-beranda"
                    >
                      <Compass className="w-4 h-4" />
                      <span className="hidden sm:inline">Katalog Buku</span>
                    </button>

                    <button
                      onClick={() => setActiveSiswaTab("riwayat")}
                      className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeSiswaTab === "riwayat"
                          ? "bg-indigo-100/60 backdrop-blur-md text-indigo-700 border border-indigo-200/20"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/40 rounded-xl"
                      }`}
                      id="siswa-tab-riwayat"
                    >
                      <History className="w-4 h-4" />
                      <span className="hidden sm:inline">Riwayat Pinjam</span>
                    </button>

                    <button
                      onClick={() => setActiveSiswaTab("profil")}
                      className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        activeSiswaTab === "profil"
                          ? "bg-indigo-100/60 backdrop-blur-md text-indigo-700 border border-indigo-200/20"
                          : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/40 rounded-xl"
                      }`}
                      id="siswa-tab-profil"
                    >
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Kartu Profil</span>
                    </button>

                  </div>
                </div>
              </header>

              <main className="flex-grow py-6 sm:py-8 w-full transition-all" id="siswa-workspace">
                {isDataLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-semibold text-slate-500">Menyinkronkan data sirkulasi...</span>
                  </div>
                ) : (
                  <>
                    {activeSiswaTab === "beranda" && (
                      <SiswaBeranda
                        books={books}
                        studentName={getLoggedInStudentName()}
                        onSelectBook={(book) => setSelectedBookDetail(book)}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        searchTerm={catalogSearchQuery}
                        setSearchTerm={setCatalogSearchQuery}
                        selectedCategory={catalogCategory}
                        setSelectedCategory={setCatalogCategory}
                      />
                    )}

                    {activeSiswaTab === "riwayat" && (
                      <SiswaHistory
                        loans={loans}
                        books={books}
                        studentId={userIdentifier}
                      />
                    )}

                    {activeSiswaTab === "profil" && (
                      <SiswaProfile
                        member={getLoggedInStudentMember()}
                        onLogout={handleLogout}
                      />
                    )}
                  </>
                )}
              </main>
            </div>
          </div>
        )}

        {showLoginModal && (
          <LoginPage
            onClose={() => setShowLoginModal(false)}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {selectedBookDetail && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left" id="book-detail-dialog-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full max-w-4xl bg-white rounded-3xl border border-slate-150 shadow-2xl relative overflow-hidden"
              id="book-detail-dialog-card"
            >

              <div className="absolute top-4 right-4 flex items-center gap-2.5 z-10" id="detail-dialog-controls">
                {userRole !== UserRole.ADMIN && (
                  <button
                    onClick={() => handleToggleFavorite(selectedBookDetail.id)}
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition duration-200 active:scale-95 shadow-sm cursor-pointer ${
                      favorites.includes(selectedBookDetail.id)
                        ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/80"
                        : "bg-white hover:bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-755"
                    }`}
                    title={favorites.includes(selectedBookDetail.id) ? "Hapus dari Favorit" : "Simpan ke Favorit"}
                    id="toggle-favorite-dialog-btn"
                  >
                    <Heart className={`w-3.5 h-3.5 transition-colors ${favorites.includes(selectedBookDetail.id) ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span>
                      {favorites.includes(selectedBookDetail.id) ? "Favorit Saya" : "Simpan ke Favorit"}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedBookDetail(null)}
                  className="p-1.5 rounded-full bg-white/80 hover:bg-slate-100 border border-slate-100 text-slate-400 hover:text-slate-600 transition shadow-sm"
                  aria-label="Tutup"
                  id="close-detail-dialog-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-12">

                <div className="md:col-span-4 bg-slate-105 relative min-h-[320px] md:min-h-full overflow-hidden flex items-center justify-center group/cover">
                  <img
                    src={gBooksData?.highResCover || selectedBookDetail.cover_url}
                    alt={selectedBookDetail.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover/cover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60" />
                  {gBooksData?.loading ? (
                    <div className="absolute bottom-4 left-4 right-4 bg-white/20 backdrop-blur-md border border-white/25 rounded-2xl p-2.5 flex items-center gap-2 text-[10px] font-bold text-white shadow-lg shadow-black/10">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="font-sans">Mencari Sampul Utama HD...</span>
                    </div>
                  ) : gBooksData?.highResCover ? (
                    <div className="absolute bottom-4 left-4 bg-white/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-[9px] font-bold text-white shadow-xl transition-all hover:bg-white/40">
                      <Sparkles className="w-3 h-3 text-indigo-300 animate-pulse" />
                      <span>SAMPUL HD GOOGLE BOOKS</span>
                    </div>
                  ) : null}
                </div>

                <div className="md:col-span-8 p-6 sm:p-8 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-100 text-slate-700 tracking-wider">
                        {selectedBookDetail.category}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap mt-1.5">
                        <h3 className="font-display font-extrabold text-slate-900 text-2xl tracking-tight leading-snug">
                          {selectedBookDetail.title}
                        </h3>
                        {selectedBookDetail.stock > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full border border-emerald-200/80 font-bold shadow-xs shrink-0" id="stock-badge-available">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersedia</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 text-xs px-2.5 py-1 rounded-full border border-rose-200/80 font-bold shadow-xs shrink-0" id="stock-badge-empty">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Kosong</span>
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          const author = selectedBookDetail.author;
                          setSelectedBookDetail(null);
                          if (userRole === UserRole.ADMIN) {
                            setAdminSearchQuery(author);
                            setAdminCategory("Semua");
                            setActiveTab("books");
                          } else if (userRole === UserRole.SISWA) {
                            setCatalogSearchQuery(author);
                            setCatalogCategory("Semua");
                            setActiveSiswaTab("beranda");
                          } else {
                            setCatalogSearchQuery(author);
                            setCatalogCategory("Semua");
                            setTimeout(() => {
                              const el = document.getElementById("katalog-section");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }, 100);
                          }
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-bold block mt-1.5 uppercase tracking-widest hover:underline hover:scale-[1.01] transition-all text-left group active:scale-95 cursor-pointer"
                        title={`Klik untuk mencari semua buku oleh ${selectedBookDetail.author}`}
                        id="filter-by-author-btn"
                      >
                        <span>{selectedBookDetail.author}</span>
                        <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[9px] font-normal lowercase tracking-normal text-indigo-400 font-sans">
                          (klik untuk mencari buku pengarang ini)
                        </span>
                      </button>

                      <div className="flex items-center gap-2 mt-3 bg-slate-50 border border-slate-100/90 px-3 py-1.5 rounded-xl w-fit" id="dialog-book-rating-box">
                        <div className="flex items-center gap-0.5" id="dialog-star-rating-stars">
                          {[1, 2, 3, 4, 5].map((starVal) => {
                            const currentRating = ratings[selectedBookDetail.id] || 4;
                            const isFilled = starVal <= currentRating;
                            return (
                              <button
                                key={starVal}
                                onClick={() => handleUpdateRating(selectedBookDetail.id, starVal)}
                                className="focus:outline-none transition hover:scale-120 duration-150 cursor-pointer text-amber-400 active:scale-90"
                                title={`Beri rating ${starVal} bintang untuk buku ini`}
                                id={`detail-star-${starVal}`}
                              >
                                <Star
                                  className={`w-4 h-4 transition-all duration-150 ${
                                    isFilled
                                      ? "text-amber-400 fill-amber-400 drop-shadow-[0_1px_1px_rgba(245,158,11,0.2)]"
                                      : "text-slate-200 fill-none"
                                  }`}
                                />
                              </button>
                            );
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-1">
                          <span className="font-extrabold text-slate-800 text-[13px]">{(ratings[selectedBookDetail.id] || 4)}.0</span>
                          <span className="text-slate-300">/</span>
                          <span>5.0</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 mx-0.5"></span>
                          <span className="text-slate-450 hover:text-indigo-600 transition text-[11px]" id="dialog-review-count">
                            ({((selectedBookDetail.id * 13) % 40) + 12} ulasan siswa)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 mt-4" id="book-description-blockSection">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Ringkasan & Intisari Buku:</span>
                        {gBooksData?.loading && (
                          <span className="text-[9px] text-indigo-500 font-bold animate-pulse flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping shrink-0" />
                            Menghubungkan Google Books...
                          </span>
                        )}
                        {!gBooksData?.loading && gBooksData?.summary && (
                          <span className="text-[9px] bg-indigo-50/80 border border-indigo-100/50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 animate-fade-in shadow-xs">
                            <Sparkles className="w-2.5 h-2.5 text-indigo-500 animate-pulse" />
                            <span>Google Books API</span>
                          </span>
                        )}
                      </div>

                      {gBooksData?.loading ? (
                        <div className="space-y-2 py-1" id="description-skeleton-loader">
                          <div className="h-3.5 bg-slate-100 rounded-lg w-full animate-pulse" />
                          <div className="h-3.5 bg-slate-100/80 rounded-lg w-11/12 animate-pulse" />
                          <div className="h-3.5 bg-slate-100/60 rounded-lg w-4/5 animate-pulse" />
                        </div>
                      ) : (
                        <div className="max-h-36 overflow-y-auto pr-1 text-slate-600 text-sm leading-relaxed font-normal scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                          <p className="text-justify whitespace-pre-line">
                            {gBooksData?.summary || selectedBookDetail.description || "Tidak ada deskripsi lengkap mengenai buku sekolah ini. Hubungi petugas perpustakaan digital untuk informasi sirkulasi lebih lanjut."}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold py-3 border-y border-slate-100/90 text-slate-605">
                      <div className="space-y-1">
                        <span className="text-[9px] text-indigo-500 font-bold uppercase tracking-wider block">ID Buku / ISBN:</span>
                        <span className="font-mono text-slate-800 tracking-wide block leading-tight">ID-{selectedBookDetail.id}</span>
                        <span className="font-mono text-[10px] text-slate-450 block leading-none">{selectedBookDetail.isbn}</span>
                      </div>
                      <div className="space-y-1 border-l border-slate-150 pl-3">
                        <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider block">Penerbit:</span>
                        <span className="text-slate-800 font-bold block leading-snug">{getPublisher(selectedBookDetail)}</span>
                      </div>
                      <div className="space-y-1 border-l border-slate-150 pl-3">
                        <span className="text-[9px] text-purple-600 font-bold uppercase tracking-wider block">Tahun Terbit:</span>
                        <span className="text-slate-800 font-bold block leading-tight">{selectedBookDetail.published_year}</span>
                      </div>
                      <div className="space-y-1 border-l border-slate-150 pl-3">
                        <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider block">Penyimpanan Rak:</span>
                        <span className="text-amber-800 font-bold uppercase block leading-tight">{selectedBookDetail.shelf}</span>
                      </div>
                    </div>

                    {userRole === UserRole.ADMIN && (
                      <BookDetailScanner
                        book={selectedBookDetail}
                        members={members}
                        onAddLoan={handleAddLoan}
                        onSuccessAction={() => {
                          setSelectedBookDetail(null);
                        }}
                      />
                    )}
                  </div>

                  <div className="mt-6 pt-4 flex items-center justify-between text-xs font-bold">
                    <div>
                      <span className="text-[9px] block text-slate-400 uppercase tracking-widest leading-none font-bold">Kelayakan Stok sirkulasi:</span>
                      {selectedBookDetail.stock > 0 ? (
                        <span className="text-emerald-600 font-extrabold block mt-1">Tersedia ({selectedBookDetail.stock} Eksemplar)</span>
                      ) : (
                        <span className="text-rose-500 font-extrabold block mt-1 font-bold">Semua Buku Sedang Dipinjam</span>
                      )}
                    </div>

                    {!userRole ? (
                      <button
                        onClick={() => { setSelectedBookDetail(null); setShowLoginModal(true); }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/10 transition"
                      >
                        Login Untuk Meminjam
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedBookDetail(null)}
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                      >
                        Selesai Membaca
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}

      </div>
    </div>
  );
}
