import "dotenv/config";
import { Pool as PgPool } from "pg";

const Pool = PgPool;

export interface DbBook {
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

export interface DbMember {
  id: string;
  name: string;
  class_name: string;
  status: "Aktif" | "Ditangguhkan";
  email: string;
  phone: string;
  join_date: string;
}

export interface DbLoan {
  id: number;
  member_id: string;
  book_id: number;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number;
  status: "Dipinjam" | "Kembali" | "Terlambat";
}

let pool: PgPool | null = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      isbn VARCHAR(50) NOT NULL,
      author VARCHAR(100) NOT NULL,
      category VARCHAR(100) NOT NULL,
      stock INT NOT NULL DEFAULT 0,
      shelf VARCHAR(50) NOT NULL,
      cover_url TEXT,
      published_year INT,
      description TEXT
    );
    CREATE TABLE IF NOT EXISTS members (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      class_name VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
      email VARCHAR(255),
      phone VARCHAR(50),
      join_date VARCHAR(50) NOT NULL
    );
    CREATE TABLE IF NOT EXISTS loans (
      id SERIAL PRIMARY KEY,
      member_id VARCHAR(50) REFERENCES members(id) ON DELETE CASCADE,
      book_id INT REFERENCES books(id) ON DELETE CASCADE,
      loan_date VARCHAR(50) NOT NULL,
      due_date VARCHAR(50) NOT NULL,
      return_date VARCHAR(50),
      fine_amount DECIMAL(10, 2) DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'Dipinjam'
    );
  `).catch(console.error);
}

export function getPool() {
  return pool;
}

export function isUsingPg() {
  return !!pool;
}

// Helpers to normalize rows from PG
export function normalizeBook(row: any): DbBook {
  return {
    ...row,
    stock: parseInt(row.stock, 10),
    published_year: parseInt(row.published_year, 10),
  };
}

export function normalizeLoan(row: any): DbLoan {
  return {
    ...row,
    book_id: parseInt(row.book_id, 10),
    fine_amount: parseFloat(row.fine_amount),
  };
}

export function calculateLateFine(dueDateStr: string, returnDateStr: string = new Date().toISOString().split("T")[0]): number {
  const due = new Date(dueDateStr);
  const ret = new Date(returnDateStr);
  const diffTime = ret.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays * 5000 : 0;
}
