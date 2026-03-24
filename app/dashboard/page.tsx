import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  // Jika belum login, lempar ke halaman login
  if (!session) {
    redirect("/api/auth/signin");
  }

  // Tampilan untuk DEFAULT USER
  if (session.user.role === "USER") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, {session.user.name}</h2>
          <p className="text-slate-500">
            Akun Anda saat ini memiliki akses terbatas. Anda memerlukan izin Administrator untuk melihat fitur utama aplikasi ini.
          </p>
          <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Request Akses Admin
          </button>
        </div>
      </div>
    );
  }

  // Tampilan untuk ADMIN
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Admin Dummy */}
      <aside className="w-64 bg-slate-900 text-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
        <nav className="space-y-4 text-sm font-medium">
          <p className="text-blue-400 cursor-pointer">Ringkasan</p>
          <p className="text-slate-400 hover:text-white cursor-pointer">Manajemen Pengguna</p>
          <p className="text-slate-400 hover:text-white cursor-pointer">Pengaturan Sistem</p>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Dashboard Utama</h1>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-600 font-medium">Admin: {session.user.email}</span>
          </div>
        </header>

        {/* Grid Stats Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-slate-500 text-sm font-medium">Statistik {i}</h3>
              <p className="text-3xl font-bold text-slate-900 mt-2">1,024</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}