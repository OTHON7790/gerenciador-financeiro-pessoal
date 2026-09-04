import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldOff,
  Loader2,
  KeyRound,
  Copy,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
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

type FatorVerificado = { id: string };

type Enroll = { id: string; uri: string; secret: string; qr: string };

async function limparFatoresNaoVerificados() {
  const { data: lista } = await supabase.auth.mfa.listFactors();
  for (const f of lista?.all ?? []) {
    if (f.factor_type === "totp" && f.status !== "verified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }
}

export function Seguranca2FA() {
  const [carregando, setCarregando] = useState(true);
  const [fator, setFator] = useState<FatorVerificado | null>(null);
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [codigo, setCodigo] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [desativando, setDesativando] = useState(false);

  const carregarStatus = useCallback(async () => {
    setCarregando(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    setCarregando(false);
    if (error) {
      toast.error("Não foi possível carregar o status do 2FA.");
      return;
    }
    const verificado = (data?.totp ?? []).find((f) => f.status === "verified");
    setFator(verificado ? { id: verificado.id } : null);
  }, []);

  useEffect(() => {
    void carregarStatus();
  }, [carregarStatus]);

  async function iniciarAtivacao() {
    setOcupado(true);
    // Descarta segredos de tentativas anteriores não concluídas.
    await limparFatoresNaoVerificados();
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      issuer: "Finanças Pessoais",
      friendlyName: `Finanças Pessoais ${Date.now()}`,
    });
    if (error || !data) {
      setOcupado(false);
      toast.error(error?.message ?? "Não foi possível iniciar a ativação.");
      return;
    }
    // Gera o QR localmente a partir do URI otpauth:// oficial do backend,
    // garantindo que QR e chave manual usem exatamente o mesmo segredo.
    let qr = "";
    try {
      qr = await QRCode.toDataURL(data.totp.uri, {
        margin: 1,
        width: 320,
        errorCorrectionLevel: "M",
      });
    } catch {
      toast.error("Não foi possível gerar o QR Code. Use a chave manual.");
    }
    setOcupado(false);
    setCodigo("");
    setEnroll({
      id: data.id,
      uri: data.totp.uri,
      qr,
      secret: data.totp.secret,
    });
  }

  async function cancelarAtivacao() {
    if (!enroll) return;
    setOcupado(true);
    await supabase.auth.mfa.unenroll({ factorId: enroll.id });
    setOcupado(false);
    setEnroll(null);
    setCodigo("");
  }

  async function confirmarAtivacao(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll) return;
    setOcupado(true);
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: enroll.id,
      code: codigo.trim(),
    });
    setOcupado(false);
    if (error) {
      toast.error("Código inválido. Verifique o app autenticador.");
      return;
    }
    toast.success("2FA ativado com sucesso!");
    setEnroll(null);
    setCodigo("");
    await carregarStatus();
  }

  async function confirmarDesativacao(e: React.FormEvent) {
    e.preventDefault();
    if (!fator) return;
    setOcupado(true);
    const { error: erroCodigo } = await supabase.auth.mfa.challengeAndVerify({
      factorId: fator.id,
      code: codigo.trim(),
    });
    if (erroCodigo) {
      setOcupado(false);
      toast.error("Código inválido. Não foi possível desativar o 2FA.");
      return;
    }
    const { error } = await supabase.auth.mfa.unenroll({ factorId: fator.id });
    setOcupado(false);
    if (error) {
      toast.error("Não foi possível desativar o 2FA.");
      return;
    }
    toast.success("2FA desativado.");
    setDesativando(false);
    setCodigo("");
    await carregarStatus();
  }

  const ativo = fator !== null;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Autenticação em dois fatores (2FA)
            </CardTitle>
            <CardDescription className="mt-1">
              Camada extra de proteção com um app autenticador (Google
              Authenticator, Authy, 1Password e similares).
            </CardDescription>
          </div>
          {carregando ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span
              className={
                ativo
                  ? "rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-semibold text-success"
                  : "rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground"
              }
            >
              {ativo ? "Ativada" : "Desativada"}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Ativação em andamento */}
        {enroll ? (
          <form onSubmit={confirmarAtivacao} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              1. Escaneie o QR Code no seu app autenticador. 2. Digite o código
              de 6 dígitos gerado para concluir a ativação.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              {enroll.qr ? (
                <img
                  src={enroll.qr}
                  alt="QR Code para configurar o 2FA"
                  className="h-44 w-44 shrink-0 rounded-xl border border-border bg-white p-2"
                />
              ) : (
                <div className="flex h-44 w-44 shrink-0 items-center justify-center rounded-xl border border-border bg-muted p-3 text-center text-xs text-muted-foreground">
                  QR Code indisponível. Use a chave manual abaixo.
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Chave manual (guarde como backup)
                </Label>
                <div className="flex items-center gap-2">
                  <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-muted px-3 py-2 text-xs">
                    {enroll.secret}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Copiar chave"
                    onClick={() => {
                      void navigator.clipboard.writeText(enroll.secret);
                      toast.success("Chave copiada.");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se você perder o app autenticador e a chave, o acesso à conta
                  precisará ser recuperado manualmente.
                </p>
              </div>
            </div>
            <CampoCodigo codigo={codigo} setCodigo={setCodigo} />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={ocupado || codigo.length < 6}>
                {ocupado && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirmar e ativar
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={cancelarAtivacao}
                disabled={ocupado}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          </form>
        ) : desativando && ativo ? (
          <form onSubmit={confirmarDesativacao} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Digite um código atual do app autenticador para confirmar a
              desativação do 2FA.
            </p>
            <CampoCodigo codigo={codigo} setCodigo={setCodigo} />
            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                variant="destructive"
                disabled={ocupado || codigo.length < 6}
              >
                {ocupado && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Desativar 2FA
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDesativando(false);
                  setCodigo("");
                }}
                disabled={ocupado}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {ativo ? (
              <Button
                variant="outline"
                onClick={() => {
                  setDesativando(true);
                  setCodigo("");
                }}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Desativar 2FA
              </Button>
            ) : (
              <Button onClick={iniciarAtivacao} disabled={ocupado}>
                {ocupado ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="mr-2 h-4 w-4" />
                )}
                Ativar 2FA
              </Button>
            )}
            <span className="text-xs text-muted-foreground">
              O 2FA é opcional. Sem ele, o acesso continua apenas com e-mail e
              senha.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CampoCodigo({
  codigo,
  setCodigo,
}: {
  codigo: string;
  setCodigo: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="codigo-2fa">Código de verificação</Label>
      <Input
        id="codigo-2fa"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
        className="max-w-40 tracking-[0.4em]"
      />
    </div>
  );
}
