import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline";

interface ButtonProps {
  href: string;
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand/90 transition-colors",
  secondary:
    "bg-brand-blue text-white hover:bg-brand-blue-dark transition-colors",
  outline:
    "border border-brand text-brand hover:bg-brand hover:text-white transition-all",
};

export default function Button({
  href,
  variant = "primary",
  children,
  className = "",
  icon,
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 font-semibold text-sm rounded-full px-7 py-3.5 ${variantClasses[variant]} ${className}`}
    >
      {icon}
      {children}
    </Link>
  );
}
