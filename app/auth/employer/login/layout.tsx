import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Sign In – Edge Harbour",
  description:
    "Sign in to your Edge Harbour employer dashboard. Manage vacancies, review candidates, and track compliance in one place.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
