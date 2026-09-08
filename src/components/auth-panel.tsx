import { useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { precisaSegundoFator } from "@/lib/mfa";

import { toast } from "sonner";
import {
  Wallet,
  Loader2,
  ArrowLeft,
  MailCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  PieChart,
  Target,
  BarChart3,
  LockKeyhole,
  Clock,
  UserRound,
  UserPlus,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const [modo, setModo] = useState<"auth" | "recuperar" | "2fa">("auth");
  const [aba, setAba] = useState<"entrar" | "criar">("entrar");
  const [codigo2fa, setCodigo2fa] = useState("");

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    // Sem pré-checagem de variáveis: o próprio cliente informa se falta configuração.

    setCarregando("login");
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });
      if (error) {
        toast.error(mensagemDeErroDeLogin(error.message));
        return;
      }
      // 2FA opcional: só pede o segundo fator quando o usuário ativou.
      if (await precisaSegundoFator()) {
        setCodigo2fa("");
        setModo("2fa");
        return;
      }
      toast.success("Que bom te ver de novo!");
      navigate({ to: sanitizarDestino(search.redirect), replace: true });
    } catch (erro) {
      toast.error(
        erro instanceof Error && /Missing Supabase environment/i.test(erro.message)
          ? MENSAGEM_SEM_CONFIGURACAO
          : "Não foi possível entrar agora. Tente novamente.",
      );
    } finally {
      setCarregando(null);
    }
  }


  async function verificar2fa(e: React.FormEvent) {
    e.preventDefault();
    setCarregando("login");
    const { data: fatores } = await supabase.auth.mfa.listFactors();
    const fator = (fatores?.totp ?? []).find((f) => f.status === "verified");
    if (!fator) {
      setCarregando(null);
      toast.error("Nenhum autenticador encontrado para esta conta.");
      return;
    }
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: fator.id,
      code: codigo2fa.trim(),
    });
    setCarregando(null);
    if (error) {
      toast.error("Código inválido. Tente novamente.");
      return;
    }
    toast.success("Que bom te ver de novo!");
    navigate({ to: sanitizarDestino(search.redirect), replace: true });
  }

  async function cancelar2fa() {
    await supabase.auth.signOut();
    setCodigo2fa("");
    setSenha("");
    setModo("auth");
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
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(55rem_32rem_at_10%_0%,color-mix(in_oklab,var(--primary)_12%,transparent),transparent),radial-gradient(45rem_28rem_at_95%_100%,color-mix(in_oklab,var(--glow-cyan)_8%,transparent),transparent)]"
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Topo */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <span className="truncate text-xl font-extrabold tracking-tight sm:text-2xl">
              Finanças <span className="text-primary">Pessoais</span>
            </span>
          </div>
          <ThemeToggle className="shrink-0 border border-border/60 bg-card/70" />
        </header>

        {/* Painéis */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Painel direito no desktop (autenticação) — primeiro no mobile */}
          <section className="order-1 rounded-2xl border border-border/60 bg-card p-5 shadow-2xl shadow-primary/5 sm:p-8 lg:order-2">
            {modo === "2fa" ? (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mt-5 text-center text-2xl font-bold tracking-tight">
                  Verificação em dois fatores
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  Digite o código de 6 dígitos gerado pelo seu app autenticador.
                </p>
                <form onSubmit={verificar2fa} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="codigo-login-2fa">
                      Código de verificação
                    </Label>
                    <Input
                      id="codigo-login-2fa"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      maxLength={6}
                      placeholder="000000"
                      value={codigo2fa}
                      onChange={(ev) =>
                        setCodigo2fa(ev.target.value.replace(/\D/g, ""))
                      }
                      className="h-14 text-center text-xl tracking-[0.5em]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="h-14 w-full rounded-xl bg-linear-to-r from-primary to-glow-cyan text-lg font-extrabold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
                    disabled={carregando !== null || codigo2fa.length < 6}
                  >
                    {carregando === "login" ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-5 w-5" />
                    )}
                    Verificar e entrar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={cancelar2fa}
                    disabled={carregando !== null}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                </form>
              </>
            ) : modo === "recuperar" ? (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <Wallet className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mt-5 text-center text-2xl font-bold tracking-tight">
                  Recuperar senha
                </h2>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Informe seu e-mail para receber um link de redefinição.
                </p>
                <div className="mt-6">
                  <FormularioRecuperacao
                    email={email}
                    setEmail={setEmail}
                    onVoltar={() => setModo("auth")}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/10">
                  <Wallet className="h-10 w-10 text-primary" />
                </div>
                <h2 className="mt-5 text-center text-2xl font-bold tracking-tight sm:text-3xl">
                  Acesse sua conta
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-center text-sm text-muted-foreground">
                  Entre para acessar seu painel financeiro e gerenciar suas
                  finanças com segurança.
                </p>

                {/* Seletor de abas */}
                <div
                  role="tablist"
                  aria-label="Entrar ou criar conta"
                  className="mt-6 grid grid-cols-2 border-b border-border/70"
                >
                  <AbaBotao
                    ativo={aba === "entrar"}
                    onClick={() => setAba("entrar")}
                  >
                    Entrar
                  </AbaBotao>
                  <AbaBotao
                    ativo={aba === "criar"}
                    onClick={() => setAba("criar")}
                  >
                    Criar conta
                  </AbaBotao>
                </div>

                {aba === "entrar" ? (
                  <form onSubmit={entrar} className="mt-6 space-y-4">
                    <CampoEmail email={email} setEmail={setEmail} />
                    <CampoSenha senha={senha} setSenha={setSenha} />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground/85">
                        <Checkbox
                          checked={lembrar}
                          onCheckedChange={(v) => setLembrar(v === true)}
                        />
                        Lembrar-me
                      </label>
                      <button
                        type="button"
                        onClick={() => setModo("recuperar")}
                        className="text-sm font-semibold text-primary transition-colors hover:text-glow-cyan hover:underline"
                      >
                        Esqueceu sua senha?
                      </button>
                    </div>
                    <Button
                      type="submit"
                      className="h-14 w-full rounded-xl bg-linear-to-r from-primary to-glow-cyan text-lg font-extrabold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
                      disabled={carregando !== null}
                    >
                      {carregando === "login" ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <UserRound className="mr-2 h-5 w-5" />
                      )}
                      Entrar
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={cadastrar} className="mt-6 space-y-4">
                    <CampoEmail email={email} setEmail={setEmail} />
                    <CampoSenha senha={senha} setSenha={setSenha} />
                    <Button
                      type="submit"
                      className="h-16 w-full flex-col gap-0 rounded-xl bg-success text-base font-extrabold uppercase tracking-wide text-success-foreground shadow-lg shadow-success/20 transition-colors hover:bg-success/90"
                      disabled={carregando !== null}
                    >
                      <span className="flex items-center gap-2">
                        {carregando === "cadastro" ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <UserPlus className="h-5 w-5" />
                        )}
                        Criar conta grátis
                      </span>
                      <span className="text-xs font-medium normal-case opacity-90">
                        É rápido, fácil e seguro!
                      </span>
                    </Button>
                  </form>
                )}

                {aba === "entrar" && (
                  <div className="mt-6">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="h-px flex-1 bg-border/70" />
                      ou
                      <span className="h-px flex-1 bg-border/70" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setAba("criar")}
                      className="mt-4 flex h-16 w-full flex-col items-center justify-center rounded-xl bg-success font-extrabold uppercase tracking-wide text-success-foreground shadow-lg shadow-success/20 transition-colors hover:bg-success/90"
                    >
                      <span className="flex items-center gap-2 text-base">
                        <UserPlus className="h-5 w-5" />
                        Criar conta grátis
                      </span>
                      <span className="text-xs font-medium normal-case opacity-90">
                        É rápido, fácil e seguro!
                      </span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          {/* Painel esquerdo (apresentação) */}
          <section className="order-2 rounded-2xl border border-border/60 bg-card p-5 sm:p-8 lg:order-1">
            <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              Seu dinheiro.
              <br />
              Seus dados.
              <br />
              <span className="bg-linear-to-r from-primary via-glow-cyan to-success bg-clip-text text-transparent">
                Seu controle.
              </span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Organize suas finanças, acompanhe seus objetivos e tenha clareza
              total da sua vida financeira.
            </p>

            <ul className="mt-6 space-y-3">
              <Beneficio
                icone={<PieChart className="h-6 w-6 text-primary" />}
                corIcone="border-primary/30 bg-primary/10"
                corTitulo="text-primary"
                titulo="Visão completa"
                texto="Acompanhe receitas, despesas, orçamentos, metas e relatórios em tempo real."
              />
              <Beneficio
                icone={<Target className="h-6 w-6 text-success" />}
                corIcone="border-success/30 bg-success/10"
                corTitulo="text-success"
                titulo="Metas e objetivos"
                texto="Defina metas, acompanhe seu progresso e realize seus objetivos com planejamento."
              />
              <Beneficio
                icone={<BarChart3 className="h-6 w-6 text-nav-purple" />}
                corIcone="border-nav-purple/30 bg-nav-purple/10"
                corTitulo="text-nav-purple"
                titulo="Controle financeiro"
                texto="Tenha controle dos seus gastos e veja sua evolução financeira de forma clara."
              />
            </ul>

            <GraficoDecorativo />
          </section>
        </div>

        {/* Faixa inferior */}
        <div className="mt-5 grid gap-5 rounded-2xl border border-border/60 bg-card p-5 sm:p-6 md:grid-cols-3">
          <ItemFaixa
            icone={<ShieldCheck className="h-6 w-6 text-success" />}
            cor="border-success/30 bg-success/10"
            titulo="Privacidade em primeiro lugar"
            texto="Seus dados são seus e só aparecem depois que você entra."
          />
          <ItemFaixa
            icone={<LockKeyhole className="h-6 w-6 text-primary" />}
            cor="border-primary/30 bg-primary/10"
            titulo="Acesso protegido"
            texto="Suas informações ficam disponíveis somente após a autenticação."
          />
          <ItemFaixa
            icone={<Clock className="h-6 w-6 text-nav-purple" />}
            cor="border-nav-purple/30 bg-nav-purple/10"
            titulo="Sempre disponível"
            texto="Acesse suas finanças de onde estiver."
          />
        </div>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© 2026 Finanças Pessoais.</span>
          <span className="flex items-center gap-1.5">
            Feito com clareza e cuidado
            <Heart className="h-3.5 w-3.5 text-success" />
          </span>
        </footer>
      </div>
    </div>
  );
}

function AbaBotao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ativo}
      onClick={onClick}
      className={
        "-mb-px cursor-pointer border-b-2 pb-3 text-sm font-bold transition-colors " +
        (ativo
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground")
      }
    >
      {children}
    </button>
  );
}

function Beneficio({
  icone,
  corIcone,
  corTitulo,
  titulo,
  texto,
}: {
  icone: React.ReactNode;
  corIcone: string;
  corTitulo: string;
  titulo: string;
  texto: string;
}) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/40 p-3">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${corIcone}`}
      >
        {icone}
      </span>
      <div className="min-w-0">
        <p className={`text-base font-bold ${corTitulo}`}>{titulo}</p>
        <p className="text-sm leading-snug text-muted-foreground">{texto}</p>
      </div>
    </li>
  );
}

function ItemFaixa({
  icone,
  cor,
  titulo,
  texto,
}: {
  icone: React.ReactNode;
  cor: string;
  titulo: string;
  texto: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${cor}`}
      >
        {icone}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{titulo}</p>
        <p className="text-sm leading-snug text-muted-foreground">{texto}</p>
      </div>
    </div>
  );
}

/** Ilustração decorativa (sem dados reais ou fictícios rotulados). */
function GraficoDecorativo() {
  const barras = [14, 18, 22, 26, 24, 32, 38, 44, 52, 48, 62, 72, 84, 96, 78];
  const pontos: Array<[number, number]> = [
    [3, 88],
    [10, 80],
    [17, 84],
    [24, 66],
    [31, 62],
    [38, 68],
    [45, 52],
    [52, 46],
    [59, 50],
    [66, 34],
    [73, 30],
    [80, 22],
    [87, 26],
    [94, 8],
  ];
  const linha = pontos.map(([x, y]) => `${x},${y}`).join(" ");
  return (
    <div
      aria-hidden
      className="relative mt-6 overflow-hidden rounded-xl border border-border/50 bg-muted/40"
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--primary)_9%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--primary)_9%,transparent)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(20rem_10rem_at_70%_100%,color-mix(in_oklab,var(--success)_16%,transparent),transparent)]" />

      <div className="relative h-56 p-4 sm:h-64">
        <div className="absolute inset-x-4 bottom-4 flex h-[85%] items-end justify-between gap-1.5">
          {barras.map((h, i) => (
            <div
              key={i}
              style={{ height: `${h}%` }}
              className="flex-1 rounded-t-sm bg-linear-to-t from-primary/15 via-primary/50 to-glow-cyan/80"
            />
          ))}
        </div>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
        >
          <polyline
            points={linha}
            fill="none"
            stroke="var(--glow-cyan)"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          viewBox="0 0 100 100"
          className="pointer-events-none absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
          preserveAspectRatio="none"
        >
          {pontos.map(([x, y], i) => (
            <circle
              key={x}
              cx={x}
              cy={y}
              r="1.6"
              fill={i < 5 ? "var(--success)" : "var(--glow-cyan)"}
            />
          ))}
        </svg>

        <div className="absolute bottom-4 right-4 max-w-[16rem] rounded-xl border border-border/60 bg-card/90 p-3 backdrop-blur-sm">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <LockKeyhole className="h-4.5 w-4.5 text-primary" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">
                Acesso protegido
              </p>
              <p className="text-xs leading-snug text-muted-foreground">
                Seus dados ficam disponíveis somente após o login.
              </p>
            </div>
          </div>
        </div>
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
        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          className="h-14 rounded-xl border border-border/80 bg-background pl-12 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
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
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="senha"
          type={visivel ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
          required
          minLength={6}
          className="h-14 rounded-xl border border-border/80 bg-background pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40"
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
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
          <MailCheck className="h-6 w-6 text-primary" />
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
        className="h-14 w-full rounded-xl bg-linear-to-r from-primary to-glow-cyan text-base font-extrabold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition-opacity hover:opacity-90"
        disabled={enviando}
      >
        {enviando && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        Enviar link de recuperação
      </Button>
      <button
        type="button"
        onClick={onVoltar}
        className="flex w-full items-center justify-center gap-1.5 text-base font-semibold text-primary transition-colors hover:text-glow-cyan hover:underline"
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

const MENSAGEM_SEM_CONFIGURACAO =
  "Este site está sem a configuração de servidor. Não é problema da sua senha — publique novamente ou use a versão de prévia.";




/** Diferencia credenciais inválidas de falhas de rede/configuração. */
function mensagemDeErroDeLogin(mensagem: string): string {
  const m = mensagem.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "E-mail ou senha incorretos. Verifique e tente novamente.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirme seu e-mail antes de entrar.";
  }
  if (m.includes("failed to fetch") || m.includes("networkerror")) {
    return "Não foi possível falar com o servidor. Verifique sua conexão e tente de novo.";
  }
  return `Não foi possível entrar: ${mensagem}`;
}
