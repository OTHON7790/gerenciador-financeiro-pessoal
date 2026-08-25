import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, Loader2, ArrowLeft, MailCheck } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Finanças Pessoal</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie receitas, despesas e orçamentos num só lugar.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            {modo === "recuperar" ? (
              <>
                <CardTitle className="text-xl">Recuperar senha</CardTitle>
                <CardDescription>
                  Informe seu e-mail para receber um link de redefinição.
                </CardDescription>
              </>
            ) : (
              <>
                <CardTitle className="text-xl">Acesse sua conta</CardTitle>
                <CardDescription>
                  Entre para visualizar seu painel financeiro.
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
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="entrar">Entrar</TabsTrigger>
                  <TabsTrigger value="criar">Criar conta</TabsTrigger>
                </TabsList>
                <TabsContent value="entrar">
                  <form onSubmit={entrar} className="space-y-4">
                    <CampoEmail email={email} setEmail={setEmail} />
                    <CampoSenha senha={senha} setSenha={setSenha} />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={carregando !== null}
                    >
                      {carregando === "login" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Entrar
                    </Button>
                    <button
                      type="button"
                      onClick={() => setModo("recuperar")}
                      className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </form>
                </TabsContent>
                <TabsContent value="criar">
                  <form onSubmit={cadastrar} className="space-y-4">
                    <CampoEmail email={email} setEmail={setEmail} />
                    <CampoSenha senha={senha} setSenha={setSenha} />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={carregando !== null}
                    >
                      {carregando === "cadastro" && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Criar conta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
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
      <Label htmlFor="email">E-mail</Label>
      <Input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="voce@email.com"
        required
      />
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
  return (
    <div className="space-y-2">
      <Label htmlFor="senha">Senha</Label>
      <Input
        id="senha"
        type="password"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        placeholder="••••••••"
        required
        minLength={6}
      />
    </div>
  );
}

function sanitizarDestino(raw?: string): string {
  if (!raw) return "/dashboard";
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
