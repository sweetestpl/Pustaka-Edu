import React, { useState } from "react";
import { UserRole } from "../lib/types";
import { 
  X, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  UserSquare2, 
  GraduationCap, 
  ArrowRight,
  Fingerprint
} from "lucide-react";

interface LoginPageProps {
  onClose: () => void;
  onLoginSuccess: (role: UserRole, identifier: string) => void;
}

export default function LoginPage({ onClose, onLoginSuccess }: LoginPageProps) {
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.SISWA);
  
  // Student fields
  const [studentNis, setStudentNis] = useState("");
  
  // Admin fields
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = (role: UserRole, customVal?: string) => {
    setIsLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setIsLoading(false);
      if (role === UserRole.SISWA) {
        // Log in as Budi
        onLoginSuccess(UserRole.SISWA, customVal || "123456");
      } else {
        onLoginSuccess(UserRole.ADMIN, "admin_pustaka");
      }
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (activeTab === UserRole.SISWA) {
        if (!studentNis.trim()) {
          setErrorMessage("NIS (Nomor Induk Siswa) wajib diisi.");
          return;
        }
        // Validating standard demo users (including customized ones)
        // Let's allow login with any 6-digit NIS for smooth sandbox operations,
        // fallback matching budget ids as well
        const normalizedNis = studentNis.trim();
        if (normalizedNis.length < 4) {
          setErrorMessage("NIS harus memiliki minimal 4 karakter.");
          return;
        }
        onLoginSuccess(UserRole.SISWA, normalizedNis);
      } else {
        if (!adminUsername.trim() || !adminPassword.trim()) {
          setErrorMessage("Username dan password wajib diisi.");
          return;
        }
        if (adminUsername === "admin" && adminPassword === "admin123") {
          onLoginSuccess(UserRole.ADMIN, "admin");
        } else {
          setErrorMessage("Username atau password salah. Silakan hubungi Kepala Perpustakaan untuk pemulihan akun.");
        }
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md" id="login-modal-overlay">
      
      <div 
        className="w-full max-w-md glass-panel-heavy rounded-3xl relative overflow-hidden text-left" 
        id="login-card-container"
      >
        {/* Color accents */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600" />

        {/* Modal Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-200/40 text-slate-400 hover:text-slate-600 transition"
          aria-label="Tutup"
          id="login-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header branding */}
          <div className="flex flex-col items-center text-center mt-2 mb-6">
            <div className="p-2.5 bg-indigo-50/50 rounded-2xl text-indigo-600 mb-2">
              <Fingerprint className="w-7 h-7" />
            </div>
            <h2 className="font-display font-extrabold text-2xl text-slate-900">
              Masuk PustakaEdu
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Sistem Informasi & Perpustakaan Digital Sekolah
            </p>
          </div>

          {/* Role Switching Tabs */}
          <div className="flex p-1 bg-slate-200/50 backdrop-blur rounded-2xl mb-6" id="login-tabs">
            <button
              onClick={() => { setActiveTab(UserRole.SISWA); setErrorMessage(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === UserRole.SISWA 
                  ? "bg-white text-indigo-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              id="login-tab-siswa"
            >
              <GraduationCap className="w-4 h-4" />
              <span>Siswa</span>
            </button>
            <button
              onClick={() => { setActiveTab(UserRole.ADMIN); setErrorMessage(""); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === UserRole.ADMIN 
                  ? "bg-white text-indigo-700 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
              id="login-tab-admin"
            >
              <UserSquare2 className="w-4 h-4" />
              <span>Admin / Pustakawan</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            {errorMessage && (
              <div id="login-error-alert" className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 block flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SISWA Form */}
            {activeTab === UserRole.SISWA ? (
              <div className="flex flex-col space-y-1">
                <label className="text-xs font-bold text-slate-700">Nomor Induk Siswa (NIS)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    id="input-nis"
                    value={studentNis}
                    onChange={(e) => setStudentNis(e.target.value)}
                    placeholder="Masukkan NIS Anda (cth: 123456)"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:bg-white/80 transition text-slate-800"
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  Siswa aktif yang terdaftar di database dapat langsung masuk menggunakan NIS.
                </p>
              </div>
            ) : (
              /* ADMIN Form */
              <div className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-700">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      id="input-admin-username"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Masukkan username admin"
                      className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:bg-white/80 transition text-slate-800"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="input-admin-password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Masukkan password admin"
                      className="w-full pl-10 pr-10 py-2.5 glass-input rounded-xl text-sm focus:outline-none focus:bg-white/80 transition text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sign in submission */}
            <button
              type="submit"
              disabled={isLoading}
              id="login-submit-btn"
              className="w-full flex items-center justify-center gap-2 py-3 glass-btn-primary rounded-xl text-sm font-bold transition duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Masuk Aplikasi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
