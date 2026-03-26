import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer Registration – Edge Harbour",
  description:
    "Create your employer account on Edge Harbour. Access pre-vetted, compliance-verified candidates across Healthcare, Hospitality, Customer Service, and Tech.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
