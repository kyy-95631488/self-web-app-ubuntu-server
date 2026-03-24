// File: app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";
import { authOptions } from "@/lib/auth"; // <-- UBAH KE SINI

export const metadata = {
  title: "Dashboard - Vydra",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
// ... sisanya sama

  if (!session || !session.user) {
    redirect("/auth/signin");
  }

  return <DashboardClient session={session} />;
}