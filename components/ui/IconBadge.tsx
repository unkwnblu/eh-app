interface IconBadgeProps {
  children: React.ReactNode;
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses = {
  sm: "w-9 h-9",
  md: "w-10 h-10",
};

export default function IconBadge({
  children,
  size = "md",
  className = "",
}: IconBadgeProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-brand-blue/8 dark:bg-brand-blue/15 flex items-center justify-center text-brand-blue flex-shrink-0 ${className}`}
    >
      {children}
    </div>
  );
}
