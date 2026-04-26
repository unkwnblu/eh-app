import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toast";

// All dashboard routes are authenticated — keep them out of search indexes
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ToastProvider>{children}</ToastProvider>;
}
