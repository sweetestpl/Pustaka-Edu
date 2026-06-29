export interface Book {
  id: number;
  title: string;
  isbn: string;
  author: string;
  category: string;
  stock: number;
  shelf: string;
  cover_url: string;
  published_year: number;
  description: string;
}

export interface Member {
  id: string; // NIS
  name: string;
  class_name: string;
  status: "Aktif" | "Ditangguhkan";
  email: string;
  phone: string;
  join_date: string;
}

export interface Loan {
  id: number;
  member_id: string;
  book_id: number;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number;
  status: "Dipinjam" | "Kembali" | "Terlambat";
}

export interface DashboardStats {
  totalBooks: number;
  uniqueTitles: number;
  activeLoans: number;
  totalMembers: number;
  activeMembers: number;
  overdueLoans: number;
  monthlyStats: { month: string; count: number }[];
}

export enum UserRole {
  ADMIN = "ADMIN",
  SISWA = "SISWA"
}
