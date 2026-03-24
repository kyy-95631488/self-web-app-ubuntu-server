// File: app/providers.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          suppressHydrationWarning // Tambahkan ini
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </SessionProvider>
  );
}