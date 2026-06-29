import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, type SessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { role, username } = await req.json();

    if (!role || !username) {
      return NextResponse.json(
        { error: "Role dan Username wajib diisi." },
        { status: 400 }
      );
    }

    const isAllowed =
      (role === "ADMIN" && username.toLowerCase() === "admin") ||
      (role === "SISWA" && username.length > 0);

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Username atau role tidak valid." },
        { status: 400 }
      );
    }

    let user = { id: username, name: username, role: role as "ADMIN" | "SISWA" };

    if (role === "ADMIN") {
      user = { id: "admin", name: "Admin Pustaka", role: "ADMIN" };
    } else {
      // Fetch real siswa data for NIS
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/members/${username}`);
      if (res.ok) {
        const member = await res.json();
        user = {
          id: member.id,
          name: member.name,
          role: "SISWA",
          class_name: member.class_name,
          email: member.email,
        } as SessionUser;
      } else {
        user = { id: username, name: `Siswa (${username})`, role: "SISWA" };
      }
    }

    await setSessionCookie(user);
    return NextResponse.json({ user, redirect: role === "ADMIN" ? "/admin/dashboard" : "/siswa/dashboard" });
  } catch {
    return NextResponse.json({ error: "Gagal melakukan autentikasi." }, { status: 500 });
  }
}
