// File: app/auth/signin/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck, Home } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Bagian handle submit di app/auth/signin/page.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        remember: rememberMe ? "true" : "false",
        redirect: false, // Ubah ke false agar kita bisa handle error & redirect manual
      });

      if (res?.error) {
        setError("Email atau Password salah!");
        setIsLoading(false);
      } else {
        // Refresh halaman atau redirect agar token baru diaplikasikan
        window.location.href = "/dashboard";
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Terjadi kesalahan sistem");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a] text-white p-4">
      {/* Background Animated Orbs (Green Theme Vydra) */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[600px] h-[600px] bg-green-400/20 rounded-full blur-[150px]" 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
             whileHover={{ rotate: 360 }}
             transition={{ duration: 1 }}
             className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 mb-4 shadow-lg shadow-emerald-500/20"
          >
            <ShieldCheck size={32} />
          </motion.div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 leading-tight">
            Selamat Datang
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Masuk ke sistem Vydra</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-widest">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
              <input
                type="email"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                placeholder="name@company.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-medium text-gray-400 ml-1 uppercase tracking-widest">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" size={18} />
              <input
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-sm"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4 rounded border border-gray-500 group-hover:border-emerald-400 transition-colors">
                <input 
                  type="checkbox" 
                  className="peer opacity-0 absolute inset-0 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <motion.div 
                  initial={false}
                  animate={{ scale: rememberMe ? 1 : 0 }}
                  className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"
                />
              </div>
              <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">Remember Me</span>
            </label>
            <a href="#" className="text-xs text-emerald-400 hover:underline">Lupa Password?</a>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-xs italic text-center"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Masuk <ArrowRight size={18} /></>}
          </motion.button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-gray-500 font-medium">Atau lanjutkan dengan</span></div>
        </div>

        <motion.button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 py-3 rounded-xl text-sm font-medium transition-colors"
        >
          <Home size={20} className="text-emerald-400" />
          Google Account
        </motion.button>

        <p className="text-center mt-8 text-xs text-gray-500">
          Belum punya akun? <Link href="/auth/register" className="text-emerald-400 hover:underline font-medium">Daftar sekarang</Link>
        </p>
      </motion.div>
    </div>
  );
}