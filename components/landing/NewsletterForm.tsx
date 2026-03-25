"use client";

export default function NewsletterForm() {
  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Enter your email"
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-brand-blue transition-colors"
      />
      <button
        type="submit"
        className="w-full bg-brand-blue text-white font-semibold text-sm rounded-lg px-4 py-2.5 hover:bg-brand-blue-dark transition-colors"
      >
        Subscribe
      </button>
    </form>
  );
}
