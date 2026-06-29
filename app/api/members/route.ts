import { NextResponse } from "next/server";
import { getPool, isUsingPg } from "../../lib/db";
import { getLocalStore, mutateStore } from "../../lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isUsingPg()) {
      const pool = getPool()!;
      const result = await pool.query("SELECT * FROM members ORDER BY name ASC");
      return NextResponse.json(result.rows);
    } else {
      const s = await getLocalStore();
      return NextResponse.json(s.members);
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, class_name, status, email, phone } = body;
    if (!id || !name || !class_name) {
      return NextResponse.json({ error: "NIS (ID), Nama, dan Kelas wajib diisi." }, { status: 400 });
    }

    if (isUsingPg()) {
      const pool = getPool()!;
      const check = await pool.query("SELECT * FROM members WHERE id = $1", [id]);
      if (check.rows.length > 0) {
        return NextResponse.json({ error: "NIS Anggota sudah terdaftar." }, { status: 400 });
      }
      const joinDate = new Date().toISOString().split("T")[0];
      const result = await pool.query(
        "INSERT INTO members (id, name, class_name, status, email, phone, join_date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
        [id, name, class_name, status || "Aktif", email || "", phone || "", joinDate]
      );
      return NextResponse.json(result.rows[0], { status: 201 });
    } else {
      const created = await mutateStore((s) => {
        if (s.members.some(m => m.id === id)) return null;
        const newMember = {
          id, name, class_name,
          status: (status || "Aktif") as "Aktif" | "Ditangguhkan",
          email: email || "", phone: phone || "",
          join_date: new Date().toISOString().split("T")[0],
        };
        s.members.push(newMember);
        return newMember;
      });
      if (!created) {
        return NextResponse.json({ error: "NIS Anggota sudah terdaftar." }, { status: 400 });
      }
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
