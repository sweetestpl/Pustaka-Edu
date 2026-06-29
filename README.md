# PustakaEdu

Sistem Manajemen Perpustakaan Digital Sekolah (Next.js migration).

## Teknologi

| Layer       | Tech                |
|-------------|---------------------|
| Framework   | Next.js 15 (App Router) |
| UI          | React 19, Tailwind CSS v4 |
| Animasi     | Framer Motion       |
| Grafik      | Recharts            |
| Database    | PostgreSQL (Neon)   |
| Auth        | Cookie + HMAC       |

## Development

```bash
cd pustakaedu-next
npm install
cp .env.example .env.local
npm run dev        # localhost:3000
```

Login: `admin` / `admin123` (ADMIN) atau NIS seperti `123456` / `123456` (SISWA).

## Deployment — Vercel

1. Push repo ke GitHub.
2. Import di [vercel.com](https://vercel.com) → pilih repo.
3. Tambahkan **Environment Variables** di Vercel Dashboard:
   - `DATABASE_URL` — koneksi PostgreSQL (contoh: Neon)
   - `USERS` — `username:password` comma-separated
   - `SESSION_SECRET` — string acak 32+ karakter
4. Deploy.

## Deployment — Manual (VPS / Docker)

```bash
npm run build
# Set DATABASE_URL, USERS, SESSION_SECRET di server
npm start
```

## Struktur Proyek

```
pustakaedu-next/
├── .data/                    # Fallback JSON storage (jika DATABASE_URL kosong)
├── .github/                  # CI workflow (lint+build)
├── .next/                    # Next.js build output
├── app/                      # App Router (pages + layouts + API routes)
│   ├── api/                  # Express endpoints → Next.js Route Handlers
│   ├── login/                # Halaman login siswa
│   ├── admin/                # Dashboard admin
│   ├── siswa/                # Beranda siswa
│   ├── _components/          # Shared UI components
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page (public)
│   └── not-found.tsx         # 404
├── components/               # Reusable React components (copy dari React app)
├── lib/
│   ├── db.ts                 # DB connection (pg Pool or JSON fallback)
│   ├── auth.ts               # Auth helpers (sign/verify, hash, compare)
│   └── sessions.ts           # Session cookie middleware (get/set/destroy)
├── middleware.ts             # Route protection middleware
├── next.config.mjs           # Next.js config
├── postcss.config.mjs        # Tailwind CSS config
├── tailwind.config.ts        # Tailwind theme (fonts, etc.)
├── vercel.json               # Vercel deployment config
└── README.md
```

## Migrasi Data

Jika Anda menggunakan database PostgreSQL (Neon), tabel otomatis di-seed pada pertama kali start. Jika tidak, aplikasi otomatis fallback ke penyimpanan file lokal `.data/db.json` untuk preview.
