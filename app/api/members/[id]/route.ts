import { NextResponse } from "next/server";
import { getPool, isUsingPg } from "../../../lib/db";
import { mutateStore } from "../../../lib/store";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, class_name, status, email, phone } = body;

    if (isUsingPg()) {
      const pool = getPool()!;
      const result = await pool.query(
        "UPDATE members SET name = $1, class_name = $2, status = $3, email = $4, phone = $5 WHERE id = $6 RETURNING *",
        [name, class_name, status, email, phone, id]
      );
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    } else {
      const updated = await mutateStore((s) => {
        const index = s.members.findIndex(m => m.id === id);
        if (index === -1) return null;
        s.members[index] = { ...s.members[index], name, class_name, status, email, phone };
        return s.members[index];
      });
      if (!updated) {
        return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
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
    const { id } = await params;

    if (isUsingPg()) {
      const pool = getPool()!;
      const check = await pool.query("SELECT * FROM members WHERE id = $1", [id]);
      if (check.rows.length === 0) {
        return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
      }
      await pool.query("DELETE FROM members WHERE id = $1", [id]);
      return NextResponse.json({ success: true });
    } else {
      const ok = await mutateStore((s) => {
        const index = s.members.findIndex(m => m.id === id);
        if (index === -1) return false;
        s.members.splice(index, 1);
        return true;
      });
      if (!ok) {
        return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
