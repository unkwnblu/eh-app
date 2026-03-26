import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Candidate Sign In – Edge Harbour",
  description:
    "Sign in to your Edge Harbour candidate profile. Check application status, update documents, and connect with UK employers.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
