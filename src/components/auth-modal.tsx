import { useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { DEMO_ACCOUNTS, MSG_EMAIL_INSTITUCIONAL } from "@/lib/types";

function mensagemErro(e: unknown): string {
  const msg = e instanceof Error ? e.message : "";
  if (msg.includes("Invalid login credentials")) {
    return "E-mail ou senha incorretos. Tente novamente.";
  }
  if (msg.includes("User already registered")) {
    return "Este e-mail já está cadastrado. Entre na aba \"Entrar\".";
  }
  return msg || "Algo deu errado. Tente novamente.";
}

export function AuthModal() {
  const {
    authModalOpen,
    closeAuthModal,
    signIn,
    signUp,
  } = useAuth();
  const [aba, setAba] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const validarEmail = () => {
    if (!/^[^@\s]+@(alunos\.utfpr\.edu\.br|utfpr\.edu\.br)$/i.test(email)) {
      setErro(MSG_EMAIL_INSTITUCIONAL);
      return false;
    }
    return true;
  };

  const aoEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!validarEmail()) return;
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      if (aba === "entrar") {
        await signIn(email, senha);
      } else {
        await signUp(email, senha, nome.trim() || email.split("@")[0]);
      }
      toast.success(
        aba === "entrar" ? "Login feito! Continuando o que você ia fazer…" : "Conta criada! Bem-vindo(a) ao Campus Fácil.",
      );
      setEmail("");
      setSenha("");
      setNome("");
      closeAuthModal();
    } catch (e) {
      setErro(mensagemErro(e));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={(o) => !o && closeAuthModal()}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">
            Faça seu login para continuar
          </DialogTitle>
          <DialogDescription>
            Você precisa entrar com seu e-mail da UTFPR para fazer esta ação.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={aba}
          onValueChange={(v) => {
            setAba(v as "entrar" | "criar");
            setErro(null);
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrar">Entrar</TabsTrigger>
            <TabsTrigger value="criar">Criar conta</TabsTrigger>
          </TabsList>

          <form onSubmit={aoEnviar} className="mt-4 flex flex-col gap-3">
            {aba === "criar" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-nome">Seu nome</Label>
                <Input
                  id="auth-nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex.: Maria da Silva"
                  autoComplete="name"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-email">E-mail institucional</Label>
              <Input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@alunos.utfpr.edu.br"
                autoComplete="email"
                inputMode="email"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="auth-senha">Senha</Label>
              <Input
                id="auth-senha"
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo de 6 caracteres"
                autoComplete={aba === "entrar" ? "current-password" : "new-password"}
              />
            </div>

            {erro && (
              <p
                role="alert"
                className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
              >
                {erro}
              </p>
            )}

            <Button
              type="submit"
              disabled={enviando}
              className="h-12 w-full text-base"
            >
              {enviando ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : aba === "entrar" ? (
                <LogIn className="h-5 w-5" aria-hidden />
              ) : (
                <UserPlus className="h-5 w-5" aria-hidden />
              )}
              {aba === "entrar" ? "Entrar no Campus Fácil" : "Criar minha conta"}
            </Button>
          </form>
        </Tabs>

        <div className="rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Contas de demonstração (senha: Demo123!)
          </p>
          <ul className="mt-1.5 space-y-1">
            {DEMO_ACCOUNTS.map((c) => (
              <li key={c.email} className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{c.papel}:</span>{" "}
                {c.email}
              </li>
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
