// File: app/dashboard/DashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Server, Users, Shield, Cpu, HardDrive, Thermometer, Edit, Trash2, Activity, Menu, X, Save, AlertTriangle, Loader2 } from "lucide-react";

interface DashboardClientProps {
  session: Session;
}

interface SystemInformation {
  status: string;
  os: string;
  cpu: { brand: string; cores: number; usage: string; speed: string };
  ram: { total: string; used: string; usagePercent: string };
  storage: { 
    total: string; 
    used: string; 
    usagePercent: string;
    idlePartitions: { name: string; size: string; mount: string; status: string }[];
  };
  gpu: string;
  temperature: string;
  timestamp: number;
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
}

export default function DashboardClient({ session }: DashboardClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  const isAdmin = session.user.role === "ADMIN";
  const [activeTab, setActiveTab] = useState("Ringkasan");
  
  const [sysInfo, setSysInfo] = useState<SystemInformation | null>(null);
  const [usersData, setUsersData] = useState<UserData[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "USER" as "USER" | "ADMIN" });

  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const fetchSysData = async () => {
      try {
        const res = await fetch("/api/system");
        if (!res.ok) throw new Error("Network response was not ok");
        const data: SystemInformation = await res.json();
        setSysInfo(data);
      } catch (err) { 
        console.error("Error fetching sys data", err); 
      }
    };
    fetchSysData();
    const interval = setInterval(fetchSysData, 5000); 
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === "Pengguna" && isAdmin) {
      fetch(`/api/auth/users?_t=${Date.now()}`)
        .then(async res => {
          if (!res.ok) {
             const text = await res.text();
             throw new Error(`Gagal fetch: ${res.status} ${text.substring(0, 50)}`);
          }
          return res.json();
        })
        .then((data: UserData[]) => setUsersData(data))
        .catch(err => console.error("Error fetching users", err));
    }
  }, [activeTab, isAdmin]);

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setEditForm({ name: user.name || "", role: user.role });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch("/api/auth/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, name: editForm.name, role: editForm.role })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUsersData(usersData.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
      } else {
        alert("Gagal menyimpan perubahan pengguna.");
      }
    } catch (error) {
      console.error("Gagal update user", error);
    }
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/auth/users/${userToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        setUsersData(usersData.filter(u => u.id !== userToDelete.id));
        setUserToDelete(null);
      } else {
        alert("Gagal menghapus user. Cek console server.");
      }
    } catch (error) {
      console.error("Gagal menghapus user", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- PERBAIKAN: Penambahan suppressHydrationWarning pada elemen fallback loading ---
  if (!isMounted) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center bg-[#020617]" 
        suppressHydrationWarning
      >
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const navItems = ["Ringkasan", isAdmin && "Pengguna"].filter(Boolean) as string[];

  // --- PERBAIKAN: Penambahan suppressHydrationWarning pada elemen root utama ---
  return (
    <div 
      className="min-h-screen flex bg-[#020617] text-slate-300 font-sans overflow-hidden" 
      suppressHydrationWarning
    >
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#020617]/90 backdrop-blur-md border-b border-emerald-900/50 z-40 flex items-center justify-between px-6">
        <div className="font-bold text-lg text-white">PANCASAKTI<span className="text-emerald-500">.</span></div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-emerald-500">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed lg:static top-16 left-0 bottom-0 w-72 border-r border-emerald-900/30 bg-[#020617]/95 backdrop-blur-xl p-8 flex flex-col z-30 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="mb-12 font-bold text-xl tracking-tighter text-white hidden lg:block">
          Vydra<span className="text-emerald-500">.</span>
        </div>
        
        <nav className="flex-1 space-y-6">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-700 font-bold">Menu Utama</div>
          <ul className="space-y-4">
            {navItems.map((item) => (
              <li 
                key={item} 
                onClick={() => { setActiveTab(item); setIsMobileMenuOpen(false); }}
                className={`group cursor-pointer flex items-center gap-3 transition-colors ${activeTab === item ? "text-emerald-400 font-medium" : "text-slate-400 hover:text-white"}`}
              >
                <span className={`h-1 w-1 rounded-full transition-all ${activeTab === item ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-transparent group-hover:bg-slate-500"}`}></span>
                {item}
              </li>
            ))}
          </ul>
        </nav>

        <button 
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-xs font-mono text-red-400 hover:text-red-300 transition-colors pt-4 border-t border-slate-800 text-left"
        >
          LOGOUT_SYSTEM
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto mt-16 lg:mt-0 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{activeTab}</h1>
            <p className="text-slate-500 text-sm mt-1 uppercase tracking-widest text-[10px]">
              Otoritas: <span className={isAdmin ? "text-emerald-500" : "text-slate-400"}>{session.user.role}</span>
            </p>
          </div>
          <div className="px-4 py-2 bg-emerald-950/20 border border-emerald-900/50 rounded-lg text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Activity size={14} className="animate-pulse" />
            USER_ID: {session.user.email?.split('@')[0].toUpperCase()}
          </div>
        </motion.div>

        {!isAdmin ? (
          <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl mx-auto mt-20 p-12 border border-slate-800 bg-slate-900/20 text-center rounded-2xl">
            <Shield className="w-16 h-16 text-slate-600 mx-auto mb-6" />
            <h2 className="text-xl font-bold text-white mb-4">Akses Terbatas</h2>
            <p className="text-slate-400 font-light text-sm leading-relaxed">
              Anda login sebagai <span className="text-slate-200">Standard User</span>. Dashboard analitik server hanya tersedia untuk Administrator.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "Ringkasan" && (
              <motion.div key="ringkasan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                {!sysInfo ? (
                  <div className="flex items-center justify-center h-64 text-emerald-500"><Activity className="animate-spin mr-2"/> Mengambil Telemetri Server...</div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="p-6 bg-slate-900/40 border border-emerald-900/30 rounded-xl hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Cpu size={48} /></div>
                        <h3 className="text-emerald-500/80 text-[10px] font-mono uppercase tracking-widest">CPU Server</h3>
                        <div className="text-3xl font-bold text-white mt-2">{sysInfo.cpu.usage}%</div>
                        <p className="text-xs text-slate-500 mt-2">{sysInfo.cpu.brand} ({sysInfo.cpu.cores} Cores)</p>
                      </div>

                      <div className="p-6 bg-slate-900/40 border border-emerald-900/30 rounded-xl hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Server size={48} /></div>
                        <h3 className="text-emerald-500/80 text-[10px] font-mono uppercase tracking-widest">Memory (RAM)</h3>
                        <div className="text-3xl font-bold text-white mt-2">{sysInfo.ram.usagePercent}%</div>
                        <p className="text-xs text-slate-500 mt-2">{sysInfo.ram.used} / {sysInfo.ram.total} Used</p>
                      </div>

                      <div className="p-6 bg-slate-900/40 border border-emerald-900/30 rounded-xl hover:border-emerald-500/50 transition-all relative overflow-hidden group flex flex-col justify-between">
                        <div>
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><HardDrive size={48} /></div>
                          <h3 className="text-emerald-500/80 text-[10px] font-mono uppercase tracking-widest">Storage (/)</h3>
                          <div className="text-3xl font-bold text-white mt-2">{sysInfo.storage.usagePercent}%</div>
                          <p className="text-xs text-slate-500 mt-2 mb-4">{sysInfo.storage.used} / {sysInfo.storage.total}</p>
                        </div>
                        
                        {sysInfo.storage.idlePartitions && sysInfo.storage.idlePartitions.length > 0 && (
                          <div className="mt-auto pt-3 border-t border-emerald-900/30 relative z-10">
                            <p className="text-[9px] text-amber-400 font-mono mb-2 uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                              Partisi Idle Terdeteksi
                            </p>
                            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                              {sysInfo.storage.idlePartitions.map((p, i) => (
                                <div key={i} className="flex justify-between items-center text-[10px] bg-slate-800/50 rounded px-2 py-1 border border-slate-700/50">
                                  <span className="text-slate-300 truncate w-16" title={p.name}>{p.name}</span>
                                  <span className="text-slate-400 text-[8px] mx-1">({p.status})</span>
                                  <span className="text-emerald-400 font-bold ml-auto">{p.size}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 bg-slate-900/40 border border-emerald-900/30 rounded-xl hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Thermometer size={48} /></div>
                        <h3 className="text-emerald-500/80 text-[10px] font-mono uppercase tracking-widest">CPU Core Temp</h3>
                        <div className="text-3xl font-bold text-white mt-2">{sysInfo.temperature}</div>
                        <p className="text-xs text-slate-500 mt-2">Thermal Status</p>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-900/40 border border-emerald-900/30 rounded-xl">
                       <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Server size={16} className="text-emerald-500"/> Informasi OS & Perangkat Keras</h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-400">
                          <div><span className="text-slate-500 block text-xs">Sistem Operasi</span>{sysInfo.os}</div>
                          <div><span className="text-slate-500 block text-xs">Kartu Grafis (GPU)</span>{sysInfo.gpu}</div>
                          <div><span className="text-slate-500 block text-xs">Kecepatan Clock</span>{sysInfo.cpu.speed}</div>
                          <div><span className="text-slate-500 block text-xs">Status Server</span><span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> ONLINE</span></div>
                       </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "Pengguna" && (
              <motion.div key="pengguna" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-slate-900/40 border border-emerald-900/30 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-emerald-900/30 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white flex items-center gap-2"><Users size={18} className="text-emerald-500" /> Manajemen Akses</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-950/20 text-emerald-500/80 font-mono text-xs uppercase">
                      <tr>
                        <th className="px-6 py-4">Nama</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-900/20">
                      {usersData.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 text-white">{user.name || "-"}</td>
                          <td className="px-6 py-4 text-slate-400">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider ${user.role === "ADMIN" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-300"}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-3">
                            <button onClick={() => handleEditClick(user)} className="text-blue-400 hover:text-blue-300 p-1 transition-colors"><Edit size={16} /></button>
                            <button onClick={() => setUserToDelete(user)} className="text-red-400 hover:text-red-300 p-1 transition-colors"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usersData.length === 0 && <div className="p-8 text-center text-slate-500">Memuat data pengguna...</div>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Modal EDIT Overlay UI */}
        <AnimatePresence>
          {editingUser && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-[#0f172a] border border-emerald-900/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Edit size={20} className="text-emerald-500"/> Edit Profil
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                      placeholder="Masukkan nama"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1.5 block">Role Hak Akses</label>
                    <select 
                      value={editForm.role} 
                      onChange={(e) => setEditForm({...editForm, role: e.target.value as "USER" | "ADMIN"})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm appearance-none"
                    >
                      <option value="USER">Standard User (USER)</option>
                      <option value="ADMIN">Administrator (ADMIN)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-slate-800/80">
                  <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Batal</button>
                  <button onClick={handleSaveEdit} className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-medium text-sm rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">
                    <Save size={16} /> Simpan
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal DELETE CONFIRMATION Overlay UI */}
        <AnimatePresence>
          {userToDelete && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                className="bg-[#0f172a] border border-red-900/50 p-6 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-600/20 rounded-full blur-[50px] -z-10"></div>

                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Hapus Pengguna?</h3>
                  <p className="text-sm text-slate-400 mb-6">
                    Apakah Anda yakin ingin menghapus <span className="text-white font-medium">{userToDelete.name || userToDelete.email}</span> dari sistem? Tindakan ini <span className="text-red-400 font-medium">tidak dapat dibatalkan</span>.
                  </p>
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    onClick={() => setUserToDelete(null)} 
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-50 border border-slate-700"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={executeDelete} 
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-medium text-sm rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={16} /> Hapus</>}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}