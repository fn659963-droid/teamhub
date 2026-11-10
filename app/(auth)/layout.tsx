export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: "#f1f5f9" }}>
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-96 flex-col justify-between px-10 py-10" style={{ background: "#1e1b4b" }}>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">T</span>
          </div>
          <span className="text-white text-lg font-bold tracking-tight">TeamHub</span>
        </div>
        <div>
          <p className="text-indigo-200 text-sm leading-relaxed">
            Your internal hub for team coordination, work logs, and shared resources.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <span className="text-slate-800 text-lg font-bold tracking-tight">TeamHub</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
