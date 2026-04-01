import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Registration – Edge Harbour",
  description:
    "Create your free candidate profile on Edge Harbour. Upload your CV, verify your right to work, and get matched with UK employers in Healthcare, Hospitality, Customer Service, and Tech.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
