import { NextResponse } from "next/server";
import { getPool, isUsingPg, calculateLateFine } from "../../../../lib/db";
import { mutateStore } from "../../../../lib/store";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const loanId = parseInt(idStr, 10);
    const body = await request.json().catch(() => ({}));
    const returnDate = body.return_date || new Date().toISOString().split("T")[0];

    if (isUsingPg()) {
      const pool = getPool()!;
      const check = await pool.query("SELECT * FROM loans WHERE id = $1", [loanId]);
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Transaksi peminjaman tidak ditemukan." }, { status: 404 });
      }
      const loan = check.rows[0];
      if (loan.return_date) {
        return NextResponse.json({ error: "Buku sudah dikembalikan sebelumnya." }, { status: 400 });
      }
      const fine = calculateLateFine(loan.due_date, returnDate);
      await pool.query(
        "UPDATE loans SET return_date = $1, fine_amount = $2, status = 'Kembali' WHERE id = $3",
        [returnDate, fine, loanId]
      );
      await pool.query("UPDATE books SET stock = stock + 1 WHERE id = $1", [parseInt(loan.book_id, 10)]);
      const updatedRes = await pool.query("SELECT * FROM loans WHERE id = $1", [loanId]);
      const { normalizeLoan } = await import("../../../../lib/db");
      return NextResponse.json(normalizeLoan(updatedRes.rows[0]));
    } else {
      const updated = await mutateStore((s) => {
        const loan = s.loans.find(l => l.id === loanId);
        if (!loan) return null;
        if (loan.return_date) return "ALREADY_RETURNED";
        const fine = calculateLateFine(loan.due_date, returnDate);
        const book = s.books.find(b => b.id === loan.book_id);
        if (book) book.stock += 1;
        loan.return_date = returnDate;
        loan.fine_amount = fine;
        loan.status = "Kembali";
        return loan;
      });
      if (updated === null) {
        return NextResponse.json({ error: "Transaksi peminjaman tidak ditemukan." }, { status: 404 });
      }
      if (updated === "ALREADY_RETURNED") {
        return NextResponse.json({ error: "Buku sudah dikembalikan sebelumnya." }, { status: 400 });
      }
      return NextResponse.json(updated);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
