// File: app/api/auth/users/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Ubah tipe data params menjadi Promise
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Lakukan await (unwrap) pada params sebelum mengekstrak id-nya
    const resolvedParams = await params;
    
    await prisma.user.delete({ where: { id: resolvedParams.id } });
    return NextResponse.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat menghapus user" }, { status: 500 });
  }
}