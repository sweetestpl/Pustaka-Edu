import { NextResponse } from "next/server";
import { getPool, isUsingPg, normalizeBook } from "../../../lib/db";
import { mutateStore } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    const body = await request.json();
    const { title, isbn, author, category, stock, shelf, cover_url, published_year, description } = body;

    if (isUsingPg()) {
      const pool = getPool()!;
      const result = await pool.query(
        "UPDATE books SET title = $1, isbn = $2, author = $3, category = $4, stock = $5, shelf = $6, cover_url = $7, published_year = $8, description = $9 WHERE id = $10 RETURNING *",
        [title, isbn, author, category, parseInt(stock, 10), shelf, cover_url, parseInt(published_year, 10), description, id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json(normalizeBook(result.rows[0]));
    } else {
      const updated = await mutateStore((s) => {
        const index = s.books.findIndex(b => b.id === id);
        if (index === -1) return null;
        s.books[index] = {
          ...s.books[index],
          title, isbn, author, category,
          stock: parseInt(stock, 10),
          shelf, cover_url,
          published_year: parseInt(published_year, 10),
          description,
        };
        return s.books[index];
      });
      if (!updated) {
        return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);

    if (isUsingPg()) {
      const pool = getPool()!;
      const check = await pool.query("SELECT * FROM books WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
      }
      await pool.query("DELETE FROM books WHERE id = $1", [id]);
      return NextResponse.json({ success: true, message: "Buku didelete dengan sukses" });
    } else {
      const ok = await mutateStore((s) => {
        const index = s.books.findIndex(b => b.id === id);
        if (index === -1) return false;
        s.books.splice(index, 1);
        return true;
      });
      if (!ok) {
        return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: "Buku didelete dengan sukses" });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
