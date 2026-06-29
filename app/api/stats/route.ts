import { NextResponse } from "next/server";
import { getPool, isUsingPg, normalizeBook, normalizeLoan } from "../../lib/db";
import { getLocalStore } from "../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let books: any[] = [];
    let members: any[] = [];
    let loans: any[] = [];

    if (isUsingPg()) {
      const pool = getPool()!;
      const [b, m, l] = await Promise.all([
        pool.query("SELECT * FROM books ORDER BY id DESC"),
        pool.query("SELECT * FROM members ORDER BY name ASC"),
        pool.query("SELECT * FROM loans ORDER BY id DESC"),
      ]);
      books = b.rows.map(normalizeBook);
      members = m.rows;
      loans = l.rows.map(normalizeLoan);
    } else {
      const s = await getLocalStore();
      books = s.books;
      members = s.members;
      loans = s.loans;
    }

    const totalBooks = books.reduce((acc, b) => acc + b.stock, 0);
    const uniqueTitles = books.length;
    const activeLoans = loans.filter(l => l.status === "Dipinjam" || l.status === "Terlambat").length;
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.status === "Aktif").length;
    const overdueLoans = loans.filter(l => l.status === "Terlambat").length;

    const monthlyLoansStats: Record<string, number> = {};
    loans.forEach(l => {
      if (l.loan_date) {
        const month = l.loan_date.substring(0, 7);
        monthlyLoansStats[month] = (monthlyLoansStats[month] || 0) + 1;
      }
    });

    const monthlyStats = Object.keys(monthlyLoansStats)
      .sort()
      .map(month => ({ month, count: monthlyLoansStats[month] }));

    return NextResponse.json({
      totalBooks, uniqueTitles, activeLoans, totalMembers, activeMembers, overdueLoans, monthlyStats,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
