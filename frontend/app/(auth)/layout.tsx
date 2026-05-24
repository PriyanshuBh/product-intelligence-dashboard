export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-svh place-items-center bg-background px-6 py-12">
      <div
        aria-hidden
        className="dot-grid pointer-events-none absolute inset-0 opacity-50"
      />
      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_60px_-30px_rgb(0_0_0/0.18)]">
          {children}
        </div>
      </div>
    </div>
  );
}
