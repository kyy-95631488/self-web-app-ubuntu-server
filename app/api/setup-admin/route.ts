// File: app/api/setup-admin/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ 
      error: "Tambahkan parameter email di URL. Contoh: ?email=akun@domain.com" 
    }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: "ADMIN" }
    });

    return NextResponse.json({ 
      message: "SUKSES! Role berhasil diubah.", 
      user: {
        email: user.email,
        role: user.role
      }
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json({ 
      error: "Gagal mengupdate role. Pastikan email tersebut sudah terdaftar/login sebelumnya." 
    }, { status: 500 });
  }
}