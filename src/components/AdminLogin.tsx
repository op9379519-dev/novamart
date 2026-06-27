import React, { useState } from "react";
import { ShieldAlert, Lock, User as UserIcon, ArrowRight, CheckCircle2 } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
  lang?: "en" | "hi" | "es";
}

export default function AdminLogin({ onLoginSuccess, lang = "en" }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const normUsername = username.trim().toLowerCase();
    const correctUsername = "om rupchandani";
    const correctPassword = "om_khatri3568";

    if (normUsername === correctUsername && password === correctPassword) {
      setSuccess("✓ Superuser credentials authorized! Opening the Admin Marketplace matrix...");
      setTimeout(() => {
        onLoginSuccess();
      }, 1200);
    } else {
      setError("❌ Invalid Superuser credentials. Access Denied!");
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 text-left select-none" id="admin-login-layout">
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-3xl bg-white dark:bg-neutral-900 shadow-xl overflow-hidden relative">
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 rounded-full blur-2xl"></div>

        {/* Header Block */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-2.5 bg-red-600/10 text-red-500 rounded-xl border border-red-500/20">
            <Lock size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-neutral-900 dark:text-white uppercase tracking-wider">Superuser Portal</h2>
            <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest">Aesthetic Audit Authentication</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-lg font-black text-neutral-900 dark:text-white">Admin Authentication</h3>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
              Enterprise control matrices require certified administrator access. Please input your allocated credentials below.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[11px] text-red-500 leading-relaxed font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-500 leading-relaxed font-bold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username */}
            <div className="space-y-1">
              <label className="font-bold text-neutral-400 block" htmlFor="admin-username">Admin Username</label>
              <div className="relative">
                <input
                  type="text"
                  id="admin-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. om rupchandani"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white pl-9 font-sans font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
                <UserIcon className="absolute left-3 top-3.5 text-neutral-400" size={13} />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="font-bold text-neutral-400 block" htmlFor="admin-password">Portal Key (Password)</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] text-red-500 hover:underline font-bold"
                >
                  {showPassword ? "Hide Key" : "Show Key"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full bg-neutral-50 dark:bg-neutral-950 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-950 dark:text-white pl-9 font-mono focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  required
                />
                <Lock className="absolute left-3 top-3.5 text-neutral-400" size={13} />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider text-[11px] shadow-lg shadow-red-600/15"
            >
              <span>Unlock Admin Controls</span>
              <ArrowRight size={13} />
            </button>
          </form>
        </div>

        {/* Bottom Security Footer */}
        <div className="p-3.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-150 dark:border-neutral-800 text-[10px] text-neutral-400 font-semibold uppercase tracking-wide flex justify-center items-center gap-1.5">
          <ShieldAlert size={14} className="text-red-500" />
          <span>Secured Sandbox Environment Access</span>
        </div>
      </div>
    </div>
  );
}
