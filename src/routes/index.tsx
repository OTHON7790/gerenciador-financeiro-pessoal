import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minha Lista de Tarefas" },
      {
        name: "description",
        content:
          "Organize suas tarefas do dia a dia com filtros, contadores e um visual moderno.",
      },
      { property: "og:title", content: "Minha Lista de Tarefas" },
      {
        property: "og:description",
        content:
          "Organize suas tarefas do dia a dia com filtros, contadores e um visual moderno.",
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

type Filtro = "todas" | "pendentes" | "concluidas";

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

const FILTROS: { valor: Filtro; rotulo: string }[] = [
  { valor: "todas", rotulo: "Todas" },
  { valor: "pendentes", rotulo: "Pendentes" },
  { valor: "concluidas", rotulo: "Concluídas" },
];

function Index() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [novoTexto, setNovoTexto] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

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
    setTarefas((atual) => [nova, ...atual]);
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

  function limparConcluidas() {
    setTarefas((atual) => atual.filter((t) => !t.concluida));
  }

  const pendentes = useMemo(
    () => tarefas.filter((t) => !t.concluida).length,
    [tarefas]
  );
  const concluidas = useMemo(
    () => tarefas.filter((t) => t.concluida).length,
    [tarefas]
  );

  const tarefasVisiveis = useMemo(() => {
    switch (filtro) {
      case "pendentes":
        return tarefas.filter((t) => !t.concluida);
      case "concluidas":
        return tarefas.filter((t) => t.concluida);
      default:
        return tarefas;
    }
  }, [tarefas, filtro]);

  const progresso =
    tarefas.length === 0 ? 0 : Math.round((concluidas / tarefas.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 dark:from-slate-950 dark:to-slate-900 sm:py-16">
      <div className="mx-auto w-full max-w-xl">
        {/* Cabeçalho */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-3xl text-primary-foreground shadow-lg shadow-primary/25">
            ✓
          </div>
          <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            Minha Lista de Tarefas
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {tarefas.length === 0
              ? "Comece adicionando sua primeira tarefa."
              : `${concluidas} de ${tarefas.length} concluídas · ${pendentes} pendente${pendentes === 1 ? "" : "s"}`}
          </p>
        </header>

        {/* Barra de progresso */}
        {tarefas.length > 0 && (
          <div className="mb-6">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Progresso geral</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}

        {/* Campo de nova tarefa */}
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
            className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            onClick={adicionarTarefa}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]"
          >
            <span className="text-base leading-none">+</span>
            Adicionar
          </button>
        </div>

        {/* Filtros e ação de limpar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-border bg-background p-1 shadow-sm">
            {FILTROS.map((f) => {
              const ativo = filtro === f.valor;
              const contagem =
                f.valor === "todas"
                  ? tarefas.length
                  : f.valor === "pendentes"
                    ? pendentes
                    : concluidas;
              return (
                <button
                  key={f.valor}
                  onClick={() => setFiltro(f.valor)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    ativo
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.rotulo}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      ativo
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {contagem}
                  </span>
                </button>
              );
            })}
          </div>

          {concluidas > 0 && (
            <button
              onClick={limparConcluidas}
              className="inline-flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-background px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="leading-none">🗑</span>
              Limpar concluídas
              <span className="text-destructive/70">({concluidas})</span>
            </button>
          )}
        </div>

        {/* Lista de tarefas */}
        <ul className="mt-6 space-y-2">
          {tarefasVisiveis.length === 0 && (
            <li className="rounded-xl border border-dashed border-border bg-background/50 p-10 text-center">
              <div className="mb-2 text-3xl opacity-40">
                {filtro === "concluidas" ? "📋" : "📝"}
              </div>
              <p className="text-sm text-muted-foreground">
                {filtro === "pendentes" && "Nenhuma tarefa pendente. Tudo em dia! 🎉"}
                {filtro === "concluidas" && "Nenhuma tarefa concluída ainda."}
                {filtro === "todas" &&
                  "Nenhuma tarefa ainda. Adicione a primeira acima!"}
              </p>
            </li>
          )}
          {tarefasVisiveis.map((tarefa) => (
            <li
              key={tarefa.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm transition-all hover:shadow-md"
            >
              <button
                onClick={() => alternarConclusao(tarefa.id)}
                aria-label={
                  tarefa.concluida ? "Marcar como pendente" : "Marcar como concluída"
                }
                title={tarefa.concluida ? "Desfazer" : "Concluir"}
                className={`inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tarefa.concluida
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-background text-transparent hover:border-primary"
                }`}
              >
                <span className="text-xs leading-none">✓</span>
              </button>
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
                onClick={() => excluirTarefa(tarefa.id)}
                aria-label="Excluir tarefa"
                title="Excluir"
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>

        {/* Rodapé */}
        {tarefas.length > 0 && (
          <footer className="mt-8 text-center text-xs text-muted-foreground">
            {pendentes === 0
              ? "Parabéns! Todas as tarefas foram concluídas. 🎉"
              : "Dica: pressione Enter para adicionar rapidamente."}
          </footer>
        )}
      </div>
    </div>
  );
}
