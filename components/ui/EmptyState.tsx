import Link from "next/link";

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl py-16 px-8 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-slate-400 mb-4">
        {icon}
      </div>
      <h3 className="text-base font-bold text-brand mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-xs leading-relaxed">{description}</p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 px-5 py-2.5 bg-brand-blue text-white text-sm font-bold rounded-xl hover:bg-brand-blue-dark transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
