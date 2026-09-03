import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Wallet,
  Loader2,
  ArrowLeft,
  ArrowRight,
  MailCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  LayoutDashboard,
  Target,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Tela de acesso (apresentação + card de login/cadastro).
 * Somente apresentação: a lógica de autenticação permanece a mesma.
 */
export function AuthScreen() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(true);
  const [carregando, setCarregando] = useState<null | "login" | "cadastro">(
    null,
  );
  const [modo, setModo] = useState<"auth" | "recuperar">("auth");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando("login");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    setCarregando(null);
    if (error) {
      toast.error("Credenciais inválidas. Verifique e tente novamente.");
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: sanitizarDestino(search.redirect), replace: true });
  }

  async function cadastrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando("cadastro");
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });
    setCarregando(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data.session) {
      toast.success("Conta criada com sucesso!");
      navigate({ to: sanitizarDestino(search.redirect), replace: true });
    } else {
      toast.success("Conta criada! Confirme seu e-mail para entrar.");
    }
  }

  return (
    <div className="dark flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(45rem_28rem_at_12%_8%,color-mix(in_oklab,var(--primary)_14%,transparent),transparent),radial-gradient(38rem_24rem_at_92%_88%,color-mix(in_oklab,var(--glow-cyan)_9%,transparent),transparent)]"
      />

      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-6 sm:px-6 lg:py-8">
        <div className="grid items-center gap-7 lg:grid-cols-[52fr_48fr] lg:gap-10">
          {/* Card de acesso — primeiro no mobile, à direita no desktop */}
          <section className="order-1 lg:order-2">
            <div className="rounded-2xl border border-primary/30 bg-card/70 p-4 shadow-xl shadow-primary/10 backdrop-blur-xl sm:p-6">
              {modo === "recuperar" ? (
                <>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    Recuperar senha
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Informe seu e-mail para receber um link de redefinição.
                  </p>
                  <div className="mt-5">
                    <FormularioRecuperacao
                      email={email}
                      setEmail={setEmail}
                      onVoltar={() => setModo("auth")}
                    />
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                    Acesse sua conta
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Entre para acessar seu painel financeiro.
                  </p>

                  <Tabs defaultValue="entrar" className="mt-5">
                    <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-border/70 bg-secondary/60 p-1">
                      <TabsTrigger
                        value="entrar"
                        className="h-10 cursor-pointer rounded-lg text-xs font-black uppercase tracking-wide text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground data-[state=active]:bg-linear-to-r data-[state=active]:from-primary data-[state=active]:to-glow-cyan data-[state=active]:text-primary-foreground data-[state=active]:shadow-md data-[state=active]:shadow-primary/30"
                      >
                        Entrar
                      </TabsTrigger>
                      <TabsTrigger
                        value="criar"
                        className="h-10 cursor-pointer rounded-lg text-xs font-black uppercase tracking-wide text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground data-[state=active]:bg-success data-[state=active]:text-success-foreground data-[state=active]:shadow-md data-[state=active]:shadow-success/25"
                      >
                        Criar conta
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="entrar" className="mt-5">
                      <form onSubmit={entrar} className="space-y-3.5">
                        <CampoEmail email={email} setEmail={setEmail} />
                        <CampoSenha senha={senha} setSenha={setSenha} />
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground/85">
                            <Checkbox
                              checked={lembrar}
                              onCheckedChange={(v) => setLembrar(v === true)}
                            />
                            Lembrar de mim
                          </label>
                          <button
                            type="button"
                            onClick={() => setModo("recuperar")}
                            className="text-sm font-semibold text-glow-cyan transition-colors hover:text-foreground hover:underline"
                          >
                            Esqueci minha senha?
                          </button>
                        </div>
                        <Button
                          type="submit"
                          className="h-11 w-full bg-linear-to-r from-primary to-glow-cyan text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-md shadow-primary/25 transition-opacity hover:opacity-90"
                          disabled={carregando !== null}
                        >
                          {carregando === "login" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Entrar
                          {carregando !== "login" && (
                            <ArrowRight className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="criar" className="mt-5">
                      <form onSubmit={cadastrar} className="space-y-3.5">
                        <CampoEmail email={email} setEmail={setEmail} />
                        <CampoSenha senha={senha} setSenha={setSenha} />
                        <Button
                          type="submit"
                          className="h-11 w-full bg-success text-sm font-extrabold uppercase tracking-wide text-success-foreground shadow-md shadow-success/25 transition-colors hover:bg-success/90"
                          disabled={carregando !== null}
                        >
                          {carregando === "cadastro" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Criar conta grátis
                        </Button>
                        <p className="text-center text-xs font-medium text-muted-foreground">
                          É rápido, fácil e seguro!
                        </p>
                      </form>
                    </TabsContent>
                  </Tabs>
                </>
              )}

              <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-glow-cyan" />
                Privacidade em primeiro lugar · seus dados financeiros são
                privados.
              </p>
            </div>
          </section>

          {/* Apresentação */}
          <section className="order-2 lg:order-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-glow-cyan shadow-md shadow-primary/25">
                <Wallet className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight sm:text-xl">
                Finanças Pessoais
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-tight sm:text-4xl">
              Seu dinheiro.
              <br />
              Seus dados.
              <br />
              <span className="bg-linear-to-r from-primary via-glow-cyan to-success bg-clip-text text-transparent">
                Seu controle.
              </span>
            </h1>
            <p className="mt-3.5 max-w-md text-sm text-muted-foreground sm:text-base">
              Organize suas finanças, acompanhe seus objetivos e tenha clareza
              total da sua vida financeira.
            </p>

            <ul className="mt-5 space-y-2.5">
              <Beneficio
                icone={<LayoutDashboard className="h-4 w-4 text-primary" />}
                titulo="Visão completa"
                texto="Receitas, despesas, orçamentos e relatórios."
              />
              <Beneficio
                icone={<Target className="h-4 w-4 text-glow-cyan" />}
                titulo="Metas e objetivos"
                texto="Acompanhe seu progresso financeiro."
              />
              <Beneficio
                icone={<ShieldCheck className="h-4 w-4 text-success" />}
                titulo="Privacidade"
                texto="Seus dados ficam disponíveis somente após autenticação."
              />
            </ul>

            <GraficoDecorativo />
          </section>
        </div>

        <footer className="mt-7 text-center text-xs text-muted-foreground">
          Finanças Pessoais • Feito para você gerenciar seu dinheiro com
          clareza.
        </footer>
      </div>
    </div>
  );
}

function Beneficio({
  icone,
  titulo,
  texto,
}: {
  icone: React.ReactNode;
  titulo: string;
  texto: string;
}) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/70 bg-card/70">
        {icone}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{titulo}</p>
        <p className="text-xs text-muted-foreground">{texto}</p>
      </div>
    </li>
  );
}

/** Ilustração decorativa (sem dados reais ou fictícios rotulados). */
function GraficoDecorativo() {
  const barras = [38, 55, 44, 70, 60, 86];
  const pontos: Array<[number, number]> = [
    [8, 66],
    [25, 50],
    [42, 58],
    [58, 32],
    [75, 40],
    [92, 16],
  ];
  return (
    <div
      aria-hidden
      className="mt-5 rounded-xl border border-border/60 bg-card/40 p-3.5"
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-glow-cyan" />
        Evolução financeira
      </div>
      <div className="relative h-16">
        <div className="flex h-full items-end justify-between gap-2.5">
          {barras.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="w-1.5 flex-1 rounded-t-sm bg-linear-to-t from-primary/15 to-primary/55"
            />
          ))}
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          {pontos.map(([x, y]) => (
            <circle
              key={x}
              cx={x}
              cy={y}
              r="1.6"
              fill="var(--glow-cyan)"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <polyline
            points="8,66 25,50 42,58 58,32 75,40 92,16"
            fill="none"
            stroke="var(--glow-cyan)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function CampoEmail({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="email" className="text-sm font-semibold text-foreground">
        E-mail
      </Label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-glow-cyan" />
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="voce@email.com"
          required
          className="h-11 rounded-lg border border-border bg-secondary/40 pl-11 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-glow-cyan focus-visible:ring-2 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  );
}

function CampoSenha({
  senha,
  setSenha,
}: {
  senha: string;
  setSenha: (v: string) => void;
}) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor="senha" className="text-sm font-semibold text-foreground">
        Senha
      </Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-glow-cyan" />
        <Input
          id="senha"
          type={visivel ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="h-11 rounded-lg border border-border bg-secondary/40 pl-11 pr-11 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-glow-cyan focus-visible:ring-2 focus-visible:ring-primary/50"
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-glow-cyan/80 transition-colors hover:text-glow-cyan"
        >
          {visivel ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function FormularioRecuperacao({
  email,
  setEmail,
  onVoltar,
}: {
  email: string;
  setEmail: (v: string) => void;
  onVoltar: () => void;
}) {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setEnviando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setEnviado(true);
    toast.success("Link de recuperação enviado! Verifique seu e-mail.");
  }

  if (enviado) {
    return (
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
          <MailCheck className="h-6 w-6 text-glow-cyan" />
        </div>
        <p className="text-base text-foreground/85">
          Enviamos um link de recuperação para{" "}
          <span className="font-semibold text-foreground">{email}</span>.
          Verifique sua caixa de entrada e o spam.
        </p>
        <Button
          variant="outline"
          className="h-12 w-full border-border/70 bg-card/40 text-base font-semibold text-foreground hover:border-primary/50"
          onClick={onVoltar}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <CampoEmail email={email} setEmail={setEmail} />
      <Button
        type="submit"
        className="h-11 w-full bg-linear-to-r from-primary to-glow-cyan text-sm font-extrabold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/30 transition-opacity hover:opacity-90"
        disabled={enviando}
      >
        {enviando && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Enviar link de recuperação
      </Button>
      <button
        type="button"
        onClick={onVoltar}
        className="flex w-full items-center justify-center gap-1.5 text-base font-semibold text-glow-cyan transition-colors hover:text-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o login
      </button>
    </form>
  );
}

function sanitizarDestino(raw?: string): string {
  if (!raw || typeof window === "undefined") return "/dashboard";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin === window.location.origin && url.pathname.startsWith("/")) {
      return url.pathname + url.search;
    }
  } catch {
    /* inválido */
  }
  return "/dashboard";
}
