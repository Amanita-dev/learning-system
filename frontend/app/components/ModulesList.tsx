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
    <div className="lg:col-span-1">
      <div className="rounded-3xl p-6 sticky top-8 bg-gradient-to-br from-red-900/30 to-orange-700/30 backdrop-blur-lg border border-red-500/30 animate-slideIn shadow-[0_0_25px_rgba(239,68,68,0.2)]">
        <h2 className="text-2xl font-bold text-white mb-6">📋 Модули</h2>

        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          {modules.map((module, index) => (
            <button
              key={module.id}
              onClick={() => handleClick(module)}
              disabled={module.is_locked || isLoading}
              className={`
                w-full p-4 rounded-xl font-semibold transition-all duration-300 text-left
                backdrop-blur-lg border
                ${
                  selectedModule?.id === module.id
                    ? "bg-gradient-to-r from-orange-500/30 to-red-500/30 border-orange-400/50 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                    : module.is_completed
                    ? "bg-green-500/20 border-green-400/30 text-green-100 hover:bg-green-500/30"
                    : module.is_locked
                    ? "bg-gray-500/20 border-gray-400/30 text-gray-300 cursor-not-allowed opacity-60"
                    : "bg-black/20 border-red-500/20 text-white hover:bg-white/10 hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {module.is_completed ? "✅" : module.is_locked ? "🔒" : `${index + 1}`}
                  </span>
                  <span className="text-sm md:text-base">{module.title}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}