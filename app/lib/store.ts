import { promises as fs } from "fs";
import path from "path";
import { DbBook, DbMember, DbLoan, calculateLateFine } from "./db";

const DEFAULT_BOOKS: DbBook[] = [
  {
    id: 1, title: "Laskar Pelangi", isbn: "978-979-3062-79-1", author: "Andrea Hirata",
    category: "Novel", stock: 4, shelf: "Rak A-1",
    cover_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    published_year: 2005,
    description: "Laskar Pelangi menceritakan perjuangan hidup sepuluh anak dari keluarga miskin di Pulau Belitung untuk bersekolah di SD Muhammadiyah dengan segala keterbatasan."
  },
  {
    id: 2, title: "Bumi", isbn: "978-602-03-3295-6", author: "Tere Liye",
    category: "Novel", stock: 3, shelf: "Rak A-2",
    cover_url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    published_year: 2014,
    description: "Petualangan seru Raib, Seli, dan Ali di dunia paralel Klan Bulan yang menakjubkan dan penuh dengan kekuatan tak biasa."
  },
  {
    id: 3, title: "Filosofi Teras", isbn: "978-602-412-518-9", author: "Henry Manampiring",
    category: "Pengembangan Diri", stock: 2, shelf: "Rak B-1",
    cover_url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
    published_year: 2018,
    description: "Pengenalan Filsafat Stoa (Stoisisme) yang dikemas secara praktis untuk membantu mengendalikan emosi negatif dan mental tangguh dalam kehidupan sehari-hari."
  },
  {
    id: 4, title: "Atomic Habits", isbn: "978-602-06-3317-6", author: "James Clear",
    category: "Pengembangan Diri", stock: 1, shelf: "Rak B-2",
    cover_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400",
    published_year: 2018,
    description: "Cara mudah dan terbukti untuk membangun kebiasaan baik dan melupakan sisa kebiasaan buruk dengan memanfaatkan sistem 1% perubahan kecil setiap hari."
  },
  {
    id: 5, title: "Fisika Dasar Volume I", isbn: "978-979-075-345-1", author: "Halliday & Resnick",
    category: "Sains & Teknologi", stock: 5, shelf: "Rak C-1",
    cover_url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=400",
    published_year: 2010,
    description: "Buku pegangan komparatif materi fisika mekanika, termodinamika, dan gelombang yang menjadi acuan standar kurikulum sekolah menengah atas dan universitas."
  },
  {
    id: 6, title: "Sejarah Dunia yang Disembunyikan", isbn: "978-602-911-992-3", author: "Jonathan Black",
    category: "Sejarah & Sosial", stock: 0, shelf: "Rak D-1",
    cover_url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
    published_year: 2007,
    description: "Eksplorasi kronologis sejarah peradaban manusia dari sudut pandang aliran mistis, mitologi kuno, dan perkumpulan rahasia yang tersembunyi selama ribuan tahun."
  },
];

const dateMinusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
};

const DEFAULT_LOANS: DbLoan[] = [
  { id: 1, member_id: "123456", book_id: 1, loan_date: dateMinusDays(5), due_date: dateMinusDays(-2), return_date: null, fine_amount: 0, status: "Dipinjam" },
  { id: 2, member_id: "234567", book_id: 2, loan_date: dateMinusDays(12), due_date: dateMinusDays(5), return_date: null, fine_amount: 0, status: "Terlambat" },
  { id: 3, member_id: "345678", book_id: 4, loan_date: dateMinusDays(3), due_date: dateMinusDays(-4), return_date: null, fine_amount: 0, status: "Dipinjam" },
  { id: 4, member_id: "123456", book_id: 5, loan_date: dateMinusDays(10), due_date: dateMinusDays(3), return_date: dateMinusDays(3), fine_amount: 0, status: "Kembali" },
  { id: 5, member_id: "345678", book_id: 3, loan_date: dateMinusDays(20), due_date: dateMinusDays(13), return_date: dateMinusDays(10), fine_amount: 15000, status: "Kembali" },
];

const DEFAULT_MEMBERS: DbMember[] = [
  { id: "123456", name: "Budi Setiawan", class_name: "XI-MIPA-1", status: "Aktif", email: "budi@school.sch.id", phone: "081234567890", join_date: "2025-01-10" },
  { id: "234567", name: "Siti Rahma", class_name: "XI-MIPA-2", status: "Aktif", email: "siti.rahma@school.sch.id", phone: "081298765432", join_date: "2025-02-15" },
  { id: "345678", name: "Andi Wijaya", class_name: "XII-IPS-1", status: "Aktif", email: "andi.wijaya@school.sch.id", phone: "081345678221", join_date: "2024-07-20" },
  { id: "456789", name: "Dewi Lestari", class_name: "X-Fase-E1", status: "Ditangguhkan", email: "dewi.lestari@school.sch.id", phone: "081233344455", join_date: "2025-05-02" },
];

interface LocalStore {
  books: DbBook[];
  members: DbMember[];
  loans: DbLoan[];
  nextBookId: number;
  nextLoanId: number;
}

let store: LocalStore = {
  books: DEFAULT_BOOKS,
  members: DEFAULT_MEMBERS,
  loans: DEFAULT_LOANS,
  nextBookId: 7,
  nextLoanId: 6,
};

function getDbPath() {
  // Vercel serverless has read-only filesystem except /tmp
  if (process.env.VERCEL) {
    return path.join("/tmp", "db.json");
  }
  return path.join(process.cwd(), "db.json");
}

let initialized = false;

async function ensureInit() {
  if (initialized) return;
  initialized = true;
  const dbPath = getDbPath();
  try {
    const data = await fs.readFile(dbPath, "utf-8");
    const parsed = JSON.parse(data);
    if (parsed.books && parsed.members && parsed.loans) {
      store = parsed;
    }
  } catch {
    // initial seed
    await save();
  }
}

async function save() {
  try {
    await fs.writeFile(getDbPath(), JSON.stringify(store, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist local db:", e);
  }
}

function refreshOverdueStatuses() {
  const today = new Date().toISOString().split("T")[0];
  store.loans.forEach(loan => {
    if (loan.status === "Dipinjam" && loan.due_date < today) {
      loan.status = "Terlambat";
    }
  });
}

export async function getLocalStore(): Promise<LocalStore> {
  await ensureInit();
  refreshOverdueStatuses();
  await save();
  return store;
}

export async function mutateStore<T>(mutator: (s: LocalStore) => T | Promise<T>): Promise<T> {
  await ensureInit();
  const result = await mutator(store);
  await save();
  return result;
}

export { calculateLateFine };
