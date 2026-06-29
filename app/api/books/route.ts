import { NextResponse } from "next/server";
import { getPool, isUsingPg, normalizeBook } from "../../lib/db";
import { getLocalStore, mutateStore } from "../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isUsingPg()) {
      const pool = getPool()!;
      const result = await pool.query("SELECT * FROM books ORDER BY id DESC");
      return NextResponse.json(result.rows.map(normalizeBook));
    } else {
      const s = await getLocalStore();
      return NextResponse.json(s.books);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, isbn, author, category, stock, shelf, cover_url, published_year, description } = body;
    if (!title || !isbn || !author || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const bookStock = isNaN(parseInt(stock, 10)) ? 0 : parseInt(stock, 10);
    const pubYear = isNaN(parseInt(published_year, 10)) ? new Date().getFullYear() : parseInt(published_year, 10);
    const cover = cover_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300";

    if (isUsingPg()) {
      const pool = getPool()!;
      const result = await pool.query(
        "INSERT INTO books (title, isbn, author, category, stock, shelf, cover_url, published_year, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [title, isbn, author, category, bookStock, shelf || "Rak Umum", cover, pubYear, description || ""]
      );
      return NextResponse.json(normalizeBook(result.rows[0]), { status: 201 });
    } else {
      const newBook = await mutateStore((s) => {
        const book = {
          id: s.nextBookId++,
          title, isbn, author, category,
          stock: bookStock,
          shelf: shelf || "Rak Umum",
          cover_url: cover,
          published_year: pubYear,
          description: description || "",
        };
        s.books.unshift(book);
        return book;
      });
      return NextResponse.json(newBook, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
