// File: app/api/system/route.ts
import { NextResponse } from "next/server";
import si from "systeminformation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
     return NextResponse.json({ status: "ONLINE", timestamp: Date.now() });
  }

  try {
    // Tambahan: blockDevices untuk mendeteksi partisi mentah yang nganggur/unmounted
    const [cpu, mem, osInfo, temp, disk, graphics, currentLoad, blockDevices] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.cpuTemperature(),
      si.fsSize(),
      si.graphics(),
      si.currentLoad(),
      si.blockDevices() 
    ]);

    const mainDisk = disk.find(d => d.mount === '/') || disk[0];

    // Deteksi Partisi Kosong / Nganggur
    // 1. Partisi yang termount tapi penggunaannya 0%
    const idleMounted = disk.filter(d => d.use === 0 && d.size > 0);
    // 2. Partisi yang terbaca oleh sistem tapi tidak di-mount sama sekali
    const unmountedPartitions = blockDevices.filter(b => !b.mount && b.type === 'part' && b.size > 0);

    const idlePartitions = [
      ...idleMounted.map(d => ({
        name: d.fs,
        size: (d.size / (1024 ** 3)).toFixed(2) + " GB",
        mount: d.mount,
        status: "Empty (0% Used)"
      })),
      ...unmountedPartitions.map(b => ({
        name: b.name,
        size: (b.size / (1024 ** 3)).toFixed(2) + " GB",
        mount: "Not Mounted",
        status: "Idle/Raw"
      }))
    ];

    return NextResponse.json({
      status: "ONLINE",
      os: `${osInfo.distro} ${osInfo.release} (${osInfo.platform})`,
      cpu: {
        brand: cpu.brand,
        cores: cpu.cores,
        usage: currentLoad.currentLoad.toFixed(2),
        speed: cpu.speed + " GHz"
      },
      ram: {
        total: (mem.total / (1024 ** 3)).toFixed(2) + " GB",
        used: (mem.active / (1024 ** 3)).toFixed(2) + " GB",
        usagePercent: ((mem.active / mem.total) * 100).toFixed(2)
      },
      storage: {
        total: mainDisk ? (mainDisk.size / (1024 ** 3)).toFixed(2) + " GB" : "N/A",
        used: mainDisk ? (mainDisk.used / (1024 ** 3)).toFixed(2) + " GB" : "N/A",
        usagePercent: mainDisk ? mainDisk.use.toFixed(2) : "0",
        idlePartitions: idlePartitions // <-- Injeksi data partisi nganggur ke respon
      },
      gpu: graphics.controllers.length > 0 ? graphics.controllers.map(g => g.model).join(", ") : "Integrated Graphics",
      temperature: temp.main ? temp.main + " °C" : "Sensor Not Supported",
      timestamp: Date.now()
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data sistem" }, { status: 500 });
  }
}