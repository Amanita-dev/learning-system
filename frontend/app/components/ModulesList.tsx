import { Module } from "../lib/learning-api";

interface ModulesListProps {
  modules: Module[];
  selectedModule: Module | null;
  onSelectModule: (module: Module) => void;
  isLoading: boolean;
}

export default function ModulesList({
  modules,
  selectedModule,
  onSelectModule,
  isLoading
}: ModulesListProps) {
  const handleClick = (module: Module) => {
    if (module.is_locked) {
      alert("❌ Модуль закрыт. Завершите предыдущий модуль!");
      return;
    }
    onSelectModule(module);
  };

  return (
    <aside className="lg:col-span-1">
      <div className="material-surface sticky top-6 rounded-[28px] p-5">
        <h2 className="mb-4 text-xl font-semibold text-[color:var(--foreground)]">Модули</h2>

        <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
          {modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => handleClick(module)}
              disabled={module.is_locked || isLoading}
              className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                selectedModule?.id === module.id
                  ? "border-[color:var(--primary)] bg-[color:var(--primary-container)] text-[color:var(--primary)]"
                  : module.is_completed
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : module.is_locked
                  ? "cursor-not-allowed border-[color:var(--outline)] bg-[color:var(--surface-variant)] text-[color:var(--secondary)] opacity-70"
                  : "border-[color:var(--outline)] bg-[color:var(--surface)] text-[color:var(--foreground)] hover:bg-[color:var(--surface-variant)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-sm font-semibold">
                  {module.is_completed ? "✅" : module.is_locked ? "🔒" : `${index + 1}`}
                </span>
                <span className="text-sm font-medium md:text-base">{module.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
