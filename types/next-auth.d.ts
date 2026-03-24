// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      role: "USER" | "ADMIN"
    } & DefaultSession["user"]
  }

  interface User {
    // Tambahkan tanda tanya (?) di sini agar Adapter tidak kebingungan
    role?: "USER" | "ADMIN" 
  }
}