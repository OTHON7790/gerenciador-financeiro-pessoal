import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minha Lista de Tarefas" },
      {
        name: "description",
        content: "Um aplicativo simples para organizar suas tarefas do dia a dia.",
      },
      { property: "og:title", content: "Minha Lista de Tarefas" },
      {
        property: "og:description",
        content: "Um aplicativo simples para organizar suas tarefas do dia a dia.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Tarefa = {
  id: string;
  texto: string;
  concluida: boolean;
};

const STORAGE_KEY = "minha-lista-de-tarefas";

function carregarTarefas(): Tarefa[] {
  if (typeof window === "undefined") return [];
  try {
    const salvo = window.localStorage.getItem(STORAGE_KEY);
    return salvo ? (JSON.parse(salvo) as Tarefa[]) : [];
  } catch {
    return [];
  }
}

function Index() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novoTexto, setNovoTexto] = useState("");

  useEffect(() => {
    setTarefas(carregarTarefas());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
    }
  }, [tarefas]);

  function adicionarTarefa() {
    const texto = novoTexto.trim();
    if (!texto) return;
    const nova: Tarefa = {
      id: crypto.randomUUID(),
      texto,
      concluida: false,
    };
    setTarefas((atual) => [...atual, nova]);
    setNovoTexto("");
  }

  function alternarConclusao(id: string) {
    setTarefas((atual) =>
      atual.map((t) => (t.id === id ? { ...t, concluida: !t.concluida } : t))
    );
  }

  function excluirTarefa(id: string) {
    setTarefas((atual) => atual.filter((t) => t.id !== id));
  }

  const pendentes = tarefas.filter((t) => !t.concluida).length;

  return (
    <div className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Minha Lista de Tarefas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {pendentes === 0
              ? "Tudo em dia! 🎉"
              : `${pendentes} tarefa${pendentes === 1 ? "" : "s"} pendente${pendentes === 1 ? "" : "s"}`}
          </p>
        </header>

        <div className="flex gap-2">
          <input
            type="text"
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") adicionarTarefa();
            }}
            placeholder="Digite uma nova tarefa..."
            aria-label="Nova tarefa"
            className="flex-1 rounded-md border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={adicionarTarefa}
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Adicionar
          </button>
        </div>

        <ul className="mt-6 space-y-2">
          {tarefas.length === 0 && (
            <li className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nenhuma tarefa ainda. Adicione a primeira acima!
            </li>
          )}
          {tarefas.map((tarefa) => (
            <li
              key={tarefa.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3.5 shadow-sm"
            >
              <span
                className={`flex-1 text-sm transition-colors ${
                  tarefa.concluida
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {tarefa.texto}
              </span>
              <button
                onClick={() => alternarConclusao(tarefa.id)}
                aria-label={tarefa.concluida ? "Marcar como pendente" : "Marcar como concluída"}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={tarefa.concluida ? "Desfazer" : "Concluir"}
              >
                {tarefa.concluida ? "↩︎" : "✓"}
              </button>
              <button
                onClick={() => excluirTarefa(tarefa.id)}
                aria-label="Excluir tarefa"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-destructive/30 bg-background text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Excluir"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
