"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { BookOpen, LogIn, Loader2, Users, Shield } from "lucide-react";
import LoginPage from "@/components/LoginPage";

export default function LoginPageWrapper() {
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "SISWA">("ADMIN");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const router = useRouter();

  const handleLogin = useCallback(async () => {
    if (!username.trim()) {
      setError("Username harus diisi.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole, username: username.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login gagal.");
        return;
      }

      setSuccess(true);
      setRedirectUrl(data.redirect || (selectedRole === "ADMIN" ? "/admin/dashboard" : "/siswa/dashboard"));
    } catch {
      setError("Gagal melakukan autentikasi.");
    } finally {
      setLoading(false);
    }
  }, [selectedRole, username]);

  if (success && redirectUrl) {
    router.push(redirectUrl);
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <LogIn className="text-white w-8 h-8" />
          </motion.div>
          <p className="text-white text-xl font-semibold">Berhasil masuk, mengalihkan...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="liquid-bg-blob liquid-bg-blob-1" />
      <div className="liquid-bg-blob liquid-bg-blob-2" />
      <div className="liquid-bg-blob liquid-bg-blob-3" />

      <div className="relative z-10 w-full max-w-[380px]">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <h1 className="text-white text-2xl font-display font-bold tracking-tight">PustakaEdu</h1>
          </div>
          <p className="text-white/60">Sistem Manajemen Perpustakaan Digital</p>
        </motion.div>

        {/* Role Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-6"
        >
          {/* Admin Card */}
          <div
            className={`flex-1 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
              selectedRole === "ADMIN"
                ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-400 shadow-lg shadow-indigo-500/20"
                : "glass-panel border-white/10 hover:border-white/30"
            }`}
            onClick={() => setSelectedRole("ADMIN")}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${
              selectedRole === "ADMIN"
                ? "bg-indigo-500 shadow-lg shadow-indigo-500/30"
                : "bg-indigo-100/80"
            }`}>
              <Shield className={`w-6 h-6 ${selectedRole === "ADMIN" ? "text-white" : "text-indigo-600"}`} />
            </div>
            <h3 className={`font-bold text-center ${
              selectedRole === "ADMIN" ? "text-white" : "text-slate-700"
            }`}>
              Admin
            </h3>
            <p className={`text-xs text-center mt-1 ${
              selectedRole === "ADMIN" ? "text-white/60" : "text-slate-500"
            }`}>
              Manajemen penuh
            </p>
          </div>

          {/* Siswa Card */}
          <div
            className={`flex-1 p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2 ${
              selectedRole === "SISWA"
                ? "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20"
                : "glass-panel border-white/10 hover:border-white/30"
            }`}
            onClick={() => setSelectedRole("SISWA")}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${
              selectedRole === "SISWA"
                ? "bg-emerald-500 shadow-lg shadow-emerald-500/30"
                : "bg-emerald-100/80"
            }`}>
              <Users className={`w-6 h-6 ${selectedRole === "SISWA" ? "text-white" : "text-emerald-600"}`} />
            </div>
            <h3 className={`font-bold text-center ${
              selectedRole === "SISWA" ? "text-white" : "text-slate-700"
            }`}>
              Siswa
            </h3>
            <p className={`text-xs text-center mt-1 ${
              selectedRole === "SISWA" ? "text-white/60" : "text-slate-500"
            }`}>
              Pinjam & Kembalikan
            </p>
          </div>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel-dark rounded-2xl p-8 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              selectedRole === "ADMIN"
                ? "bg-indigo-500/20"
                : "bg-emerald-500/20"
            }`}>
              <LogIn
                className={`w-5 h-5 ${
                  selectedRole === "ADMIN" ? "text-indigo-400" : "text-emerald-400"
                }`}
              />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">
                Masuk sebagai {selectedRole === "ADMIN" ? "Admin" : "Siswa"}
              </h2>
              <p className="text-white/50 text-sm">
                {selectedRole === "ADMIN"
                  ? "Gunakan username admin"
                  : "Gunakan NIS sebagai username"}
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="glass-input w-full px-4 py-3 rounded-xl text-white placeholder-white/40 border border-white/10 focus:outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-400/20 transition-all"
                placeholder={
                  selectedRole === "ADMIN" ? "admin" : "Masukkan NIS..."
                }
                disabled={loading}
                autoComplete="off"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                selectedRole === "ADMIN"
                  ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30"
                  : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Masuk
                </>
              )}
            </button>
          </form>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-white/40 text-xs mt-8"
        >
          PustakaEdu &copy; 2025. Sistem Manajemen Perpustakaan Digital.
        </motion.p>
      </div>
    </div>
  );
}
