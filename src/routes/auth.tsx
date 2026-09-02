import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
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
  DatabaseBackup,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Entrar · Finanças Pessoal" },
      {
        name: "description",
        content: "Acesse sua conta para gerenciar suas finanças pessoais.",
      },
      { property: "og:title", content: "Entrar · Finanças Pessoal" },
      {
        property: "og:description",
        content: "Acesse sua conta para gerenciar suas finanças pessoais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const destino = sanitizarDestino(search.redirect);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
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
    navigate({ to: destino, replace: true });
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
      navigate({ to: destino, replace: true });
    } else {
      toast.success("Conta criada! Confirme seu e-mail para entrar.");
    }
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-8">
        {/* Fundo predominantemente preto/grafite com detalhes luminosos nas laterais */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-primary/15 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-1/2 -z-10 h-[36rem] w-[36rem] -translate-y-1/2 rounded-full bg-glow-cyan/10 blur-[140px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 -z-10 h-[70vh] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-glow-cyan/40 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[70vh] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/3 top-0 -z-10 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]"
        />

        {/* Identidade no topo */}
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-glow-cyan shadow-lg shadow-primary/40">
            <Wallet className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-[2.6rem]">
            <span className="text-foreground">Finanças</span>{" "}
            <span className="bg-linear-to-r from-primary to-glow-cyan bg-clip-text text-transparent">
              Pessoal
            </span>
          </h1>
          <p className="mt-1.5 text-lg font-medium text-foreground/90">
            Seu dinheiro. Seus dados. Seu controle.
          </p>
        </div>

        {/* Card de login */}
        <Card className="mt-7 w-full max-w-[440px] rounded-2xl border border-primary/40 bg-black/55 py-6 shadow-2xl shadow-primary/20 backdrop-blur-xl">
          <CardHeader className="pb-1 text-center">
            {modo === "recuperar" ? (
              <>
                <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                  Recuperar senha
                </CardTitle>
                <CardDescription className="text-lg text-foreground/85">
                  Informe seu e-mail para receber um link de redefinição.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
                  Acesse sua conta
                </CardTitle>
                <CardDescription className="text-lg text-foreground/85">
                  Entre para acessar seu painel financeiro.
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent>
            {modo === "recuperar" ? (
              <FormularioRecuperacao
                email={email}
                setEmail={setEmail}
                onVoltar={() => setModo("auth")}
              />
            ) : (
              <Tabs defaultValue="entrar">
                <TabsList className="mb-5 grid h-12 w-full grid-cols-2 gap-2 rounded-none border-b border-border/50 bg-transparent p-0">
                  <TabsTrigger
                    value="entrar"
                    className="h-12 rounded-none border-b-2 border-transparent bg-transparent text-base font-bold uppercase tracking-wider text-foreground/65 shadow-none transition-colors data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger
                    value="criar"
                    className="h-12 rounded-none border-b-2 border-transparent bg-transparent text-base font-bold uppercase tracking-wider text-foreground/65 shadow-none transition-colors data-[state=active]:border-glow-cyan data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    Criar conta
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="entrar" className="mt-0">
                  <form onSubmit={entrar} className="space-y-4">
                    <CampoEmail email={email} setEmail={setEmail} />
                    <CampoSenha senha={senha} setSenha={setSenha} />
                    <Button
                      type="submit"
                      className="mt-2 h-14 w-full bg-linear-to-r from-primary to-glow-cyan text-lg font-extrabold tracking-wide text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.01] hover:shadow-primary/60"
                      disabled={carregando !== null}
                    >
                      {carregando === "login" ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowRight className="ml-2 h-5 w-5" />
                      )}
                      ENTRAR
                    </Button>
                    <button
                      type="button"
                      onClick={() => setModo("recuperar")}
                      className="w-full text-center text-lg font-bold text-glow-cyan transition-colors hover:text-foreground hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </form>
                </TabsContent>
                <TabsContent value="criar" className="mt-0">
                  <form onSubmit={cadastrar} className="space-y-4">
                    <CampoEmail email={email} setEmail={setEmail} />
                    <CampoSenha senha={senha} setSenha={setSenha} />
                    <Button
                      type="submit"
                      className="mt-2 h-14 w-full bg-linear-to-r from-primary to-glow-cyan text-lg font-extrabold tracking-wide text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.01] hover:shadow-primary/60"
                      disabled={carregando !== null}
                    >
                      {carregando === "cadastro" ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowRight className="ml-2 h-5 w-5" />
                      )}
                      CRIAR CONTA
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Segurança em uma única linha */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-base font-medium text-foreground/85">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-glow-cyan" />
            100% Seguro
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <Lock className="h-4.5 w-4.5 text-glow-cyan" />
            Privacidade Total
          </span>
          <span className="text-border">|</span>
          <span className="flex items-center gap-1.5">
            <DatabaseBackup className="h-4.5 w-4.5 text-glow-cyan" />
            Dados protegidos
          </span>
        </div>

        {/* Rodapé */}
        <p className="mt-6 text-base font-medium text-foreground/75">
          Finanças Pessoal • Feito para você gerenciar seu dinheiro com clareza.
        </p>
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
      <Label htmlFor="email" className="text-lg font-semibold text-foreground">
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
          className="h-[52px] rounded-xl border border-border/80 bg-secondary/40 pl-11 text-lg text-foreground shadow-inner placeholder:text-muted-foreground/70 focus-visible:border-glow-cyan focus-visible:ring-2 focus-visible:ring-primary/50"
        />
      </div>
    </div>
  );
}

function
CampoSenha({
  senha,
  setSenha,
}: {
  senha: string;
  setSenha: (v: string) => void;
}) {
  const [visivel, setVisivel] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor="senha" className="text-lg font-semibold text-foreground">
        Senha
      </Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text
-glow-cyan" />
        <Input
          id="senha"
          type={visivel ? "text" : "password"}
          value={senha}
          onChange={(e) => setSenha
(e.target.value)}
          placeholder="••••••••"
          required
          minLength={6}
          className="h-[52px] rounded-xl border border-border/80 bg-secondary/40 pl-11 pr-11 text-lg text-foreground shadow-inner placeholder:text-muted-foreground/70 focus-visible:border-glow-cyan focus-visible:ring-2 focus-visible:ring-primary/50"
        />
        <button
          type="button"
          onClick={() =>
            setVisivel((v) => !v)}
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-glow-cyan/70 transition-colors hover:text-glow-cyan"
        >
          {visivel ? <EyeOff className="h-5 w-5" /> : <Eye className
="h-5 w-5" />}
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
          className="h-12 w-full border-border/70 bg-black/30 text-base font-semibold text-foreground hover:border-primary/50"
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
        className="mt-2 h-14 w-full bg-linear-to-r from-primary to-glow-cyan text-lg font-extrabold tracking-wide text-primary-foreground shadow-lg shadow-primary/40 transition-all duration-200 hover:scale-[1.01] hover:shadow-primary/60"
        disabled={enviando}
      >
        {enviando && <Loader2 className="mr-2
 h-5 w-5
animate-spin" />}
        Enviar link de recuperação
      </Button>
      <button
        type="button"
        onClick={onVoltar}
        className="flex w-full items-center justify-center gap-1.5 text-lg font-bold text-glow-cyan transition-colors hover:text-foreground hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para o login
      </button>
    </form>
  );
}

function sanitizarDestino(raw?: string): string {
  if (!raw) return "/dashboard";
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin === window.location.origin && url.pathname.startsWith("/"))
      {
      return url.pathname + url.search;
    }
  } catch {
    /* inválido */
  }
  return "/dashboard";
}
