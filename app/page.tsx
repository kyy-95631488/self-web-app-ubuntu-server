import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-900">
      <div className="max-w-3xl text-center space-y-6 p-8">
        <h1 className="text-5xl font-extrabold tracking-tight">
          Sistem <span className="text-blue-600">Terpadu</span> Masa Depan
        </h1>
        <p className="text-lg text-slate-600">
          Platform manajemen cerdas dengan antarmuka yang bersih, cepat, dan responsif. 
          Dirancang khusus untuk produktivitas maksimal tanpa gangguan visual.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link href="/api/auth/signin" className="px-6 py-3 bg-slate-900 text-white rounded-md font-medium hover:bg-slate-800 transition">
            Mulai Sekarang
          </Link>
          <Link href="/about" className="px-6 py-3 bg-white border border-slate-300 rounded-md font-medium hover:bg-slate-50 transition">
            Pelajari Lebih Lanjut
          </Link>
        </div>
      </div>
    </div>
  );
}