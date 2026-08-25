import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Wallet, Loader2, Eye, EyeOff } from "lucide-react";
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

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Redefinir senha · Finanças Pessoal" },
      {
        name: "description",
        content: "Defina uma nova senha para sua conta.",
      },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [valido, setValido] = useState(false);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    // Verifica se chegou aqui via link de recuperação (type=recovery no hash)
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const accessToken = params.get("access_token");

    if (type === "recovery" || accessToken) {
      setValido(true);
    }
    setVerificando(false);
  }, []);

  async function redefinir(e: React.FormEvent) {
    e.preventDefault();

    if (senha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmar) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Senha redefinida com sucesso! Faça login para continuar.");
    navigate({ to: "/auth", replace: true });
  }

  if (verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!valido) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
        <div className="w-full max-w-md text-center">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <Wallet className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Link inválido</h1>
          </div>
          <Card className="shadow-xl">
            <CardContent className="pt-6">
              <p className="mb-6 text-sm text-muted-foreground">
                Este link de recuperação é inválido ou já expirou. Solicite um
                novo link para redefinir sua senha.
              </p>
              <Button
                className="w-full"
                onClick={() => navigate({ to: "/auth", replace: true })}
              >
                Voltar para o login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Wallet className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Redefinir senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Defina uma nova senha para acessar sua conta.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">Nova senha</CardTitle>
            <CardDescription>
              Escolha uma senha segura com pelo menos 6 caracteres.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={redefinir} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Nova senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmar">Confirmar senha</Label>
                <Input
                  id="confirmar"
                  type={mostrarSenha ? "text" : "password"}
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={carregando}>
                {carregando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Redefinir senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
