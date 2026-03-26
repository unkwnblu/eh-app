interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  body: string;
}

export default function FeatureCard({
  icon,
  title,
  body,
  className = "",
  ...rest
}: FeatureCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl p-6 border border-gray-border hover:border-brand-blue/30 hover:shadow-sm transition-all ${className}`}
      {...rest}
    >
      <div className="w-10 h-10 rounded-xl bg-brand-blue/8 flex items-center justify-center text-brand-blue mb-4">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-brand mb-2">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{body}</p>
    </div>
  );
}
