import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const CHAVE = "tema";

function aplicar(tema: "claro" | "escuro") {
  const raiz = document.documentElement;
  raiz.classList.toggle("dark", tema === "escuro");
}

export function ThemeToggle({ className }: { className?: string }) {
  const [tema, setTema] = useState<"claro" | "escuro">("claro");

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE);
    const inicial = salvo === "escuro" ? "escuro" : "claro";
    setTema(inicial);
    aplicar(inicial);
  }, []);

  function alternar(novo: "claro" | "escuro") {
    setTema(novo);
    localStorage.setItem(CHAVE, novo);
    aplicar(novo);
  }

  return (
    <div
      role="group"
      aria-label="Tema"
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-sidebar-accent p-1",
        className,
      )}
    >
      <button
        type="button"
        aria-label="Tema claro"
        aria-pressed={tema === "claro"}
        onClick={() => alternar("claro")}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          tema === "claro"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
        )}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        aria-label="Tema escuro"
        aria-pressed={tema === "escuro"}
        onClick={() => alternar("escuro")}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
          tema === "escuro"
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/80 hover:text-sidebar-foreground",
        )}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>

  );
}
