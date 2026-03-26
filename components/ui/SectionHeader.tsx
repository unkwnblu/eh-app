interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  heading: React.ReactNode;
  description?: React.ReactNode;
}

export default function SectionHeader({
  label,
  heading,
  description,
  className = "",
  ...rest
}: SectionHeaderProps) {
  return (
    <div className={className} {...rest}>
      <span className="text-brand-blue text-xs font-semibold tracking-widest uppercase">
        {label}
      </span>
      <h2 className="mt-4 text-4xl lg:text-5xl font-black tracking-tight text-brand dark:text-white leading-tight">
        {heading}
      </h2>
      {description && (
        <p className="mt-5 text-slate-500 dark:text-slate-400 text-base leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
