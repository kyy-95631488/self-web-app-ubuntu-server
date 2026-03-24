// File: app/page.tsx
"use client";
import { motion } from "framer-motion";
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [serverStatus, setServerStatus] = useState("CHECKING...");

  useEffect(() => {
    // Mengecek status real dari backend
    fetch('/api/system')
      .then(res => res.ok ? setServerStatus("ONLINE") : setServerStatus("DEGRADED"))
      .catch(() => setServerStatus("OFFLINE"));
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-[#020617]">
      {/* Background Grid Decoration */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M60 60L0 60 0 0' fill='none' stroke='%2310b981' stroke-width='1'/%3E%3C/svg%3E")` }}>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-4xl text-center px-6"
      >
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium uppercase tracking-[0.2em] mb-8 inline-block"
        >
          Vydra System
        </motion.span>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
          VYDRA<span className="text-emerald-500">.</span>SYS
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Arsitektur manajemen data terpadu untuk Enterprise. Minimalis dalam visual, maksimal dalam performa. 
          Dirancang untuk masa depan yang lebih cepat dan aman.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-5">
          {sessionStatus === "loading" ? (
             <button disabled className="px-8 py-4 bg-slate-800 text-slate-400 font-bold rounded-lg animate-pulse w-full sm:w-auto">
               MEMUAT...
             </button>
          ) : session ? (
            <Link href="/dashboard">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-400 text-white font-bold rounded-lg shadow-lg transition-all duration-300 w-full sm:w-auto tracking-wide"
              >
                BUKA DASHBOARD
              </motion.button>
            </Link>
          ) : (
            <Link href="/auth/signin">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white text-black font-bold rounded-lg transition-all duration-300 w-full sm:w-auto tracking-wide hover:bg-emerald-50"
              >
                INISIASI SISTEM
              </motion.button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Futuristic Bottom Decor (Real Data) */}
      <div className="absolute bottom-10 left-10 text-[10px] font-mono text-slate-500 hidden md:block">
        SYSTEM_STATUS: <span className={serverStatus === "ONLINE" ? "text-emerald-400" : "text-red-400"}>{serverStatus}</span><br/>
        ENCRYPTION: AES-256<br/>
        SERVER: UBUNTU_CORE
      </div>
    </div>
  );
}