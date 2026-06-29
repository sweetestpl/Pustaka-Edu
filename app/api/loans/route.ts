import { NextResponse } from "next/server";
import { DbLoan, getPool, isUsingPg, normalizeLoan } from "../../lib/db";
import { getLocalStore, mutateStore } from "../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isUsingPg()) {
      const pool = getPool()!;
      const result = await pool.query("SELECT * FROM loans ORDER BY id DESC");
      return NextResponse.json(result.rows.map(normalizeLoan));
    } else {
      const s = await getLocalStore();
      return NextResponse.json(s.loans);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { member_id, book_id, loan_date, due_date } = body;
    if (!member_id || !book_id || !loan_date || !due_date) {
      return NextResponse.json({ error: "Informasi Peminjaman tidak lengkap." }, { status: 400 });
    }
    const bId = parseInt(book_id, 10);

    if (isUsingPg()) {
      const pool = getPool()!;
      const mCheck = await pool.query("SELECT * FROM members WHERE id = $1", [member_id]);
      if (mCheck.rows.length === 0) {
        return NextResponse.json({ error: "Anggota dengan NIS ini tidak ditemukan." }, { status: 400 });
      }
      if (mCheck.rows[0].status !== "Aktif") {
        return NextResponse.json({ error: "Status anggota sedang Ditangguhkan. Tidak dapat meminjam buku." }, { status: 400 });
      }
      const bCheck = await pool.query("SELECT * FROM books WHERE id = $1", [bId]);
      if (bCheck.rows.length === 0) {
        return NextResponse.json({ error: "Buku tidak ditemukan." }, { status: 400 });
      }
      const bStock = parseInt(bCheck.rows[0].stock, 10);
      if (bStock <= 0) {
        return NextResponse.json({ error: "Stok buku habis / sedang dipinjam seluruhnya." }, { status: 400 });
      }
      await pool.query("UPDATE books SET stock = stock - 1 WHERE id = $1", [bId]);
      const result = await pool.query(
        "INSERT INTO loans (member_id, book_id, loan_date, due_date, return_date, fine_amount, status) VALUES ($1, $2, $3, $4, null, 0, 'Dipinjam') RETURNING *",
        [member_id, bId, loan_date, due_date]
      );
      return NextResponse.json(normalizeLoan(result.rows[0]), { status: 201 });
    } else {
      const created = await mutateStore((s) => {
        const member = s.members.find(m => m.id === member_id);
        if (!member) return null;
        if (member.status !== "Aktif") return "MEMBER_SUSPENDED";
        const book = s.books.find(b => b.id === bId);
        if (!book) return null;
        if (book.stock <= 0) return "NO_STOCK";
        book.stock -= 1;
        const newLoan: DbLoan = {
          id: s.nextLoanId++,
          member_id, book_id: bId,
          loan_date, due_date,
          return_date: null, fine_amount: 0,
          status: "Dipinjam",
        };
        s.loans.unshift(newLoan);
        return newLoan;
      });
      if (created === null) {
        return NextResponse.json({ error: "Anggota tidak ditemukan atau buku tidak tersedia." }, { status: 400 });
      }
      if (created === "MEMBER_SUSPENDED") {
        return NextResponse.json({ error: "Status anggota sedang Ditangguhkan. Tidak dapat meminjam buku." }, { status: 400 });
      }
      if (created === "NO_STOCK") {
        return NextResponse.json({ error: "Stok buku habis / sedang dipinjam seluruhnya." }, { status: 400 });
      }
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
