import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import heroImg from "@/assets/cat-women.jpg";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/lib/auth";
import { BrandMark, useBrandName } from "@/components/BrandMark";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Off Track" }] }),
  component: LoginPage,
});

const field = "h-12 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none focus:border-gold";

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const brandName = useBrandName();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/" });
  };

  const handleGoogle = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-[calc(100vh-6rem)] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={heroImg} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/30" />
        <div className="absolute bottom-10 left-10 text-background">
          <p className="font-display text-4xl">Welcome back</p>
          <p className="mt-2 max-w-xs text-sm text-background/80">Sign in to your {brandName} account to access your orders, wishlist and exclusive member offers.</p>
        </div>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-6 inline-flex font-display text-2xl font-semibold">
            <BrandMark className="font-display font-semibold" />
          </Link>
          <h1 className="font-display text-4xl">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">Enter your details to continue.</p>
          {error && <p className="mt-4 rounded-lg bg-destructive/10 px-4 py-2.5 text-sm text-destructive">{error}</p>}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className={field} />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={field} />
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-foreground text-xs font-medium uppercase tracking-luxe text-background hover:bg-gold hover:text-gold-foreground disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign In
            </button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>
          <button onClick={handleGoogle} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border text-sm hover:border-gold">
            <GoogleIcon /> Continue with Google
          </button>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here? <Link to="/register" className="text-gold link-underline">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
