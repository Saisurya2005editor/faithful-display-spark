import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuthUser } from "@/lib/auth";
import { getAdminStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin sign in — BISmart" },
      {
        name: "description",
        content:
          "Restricted sign-in for BISmart administrators who manage the indexed Indian Standards knowledge base.",
      },
      { property: "og:title", content: "Admin sign in — BISmart" },
      {
        property: "og:description",
        content: "Restricted access to the BISmart document dashboard and ingestion tools.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, ready } = useAuthUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [checked, setChecked] = useState(false);

  // Already signed in as an admin? Go straight to the dashboard.
  useEffect(() => {
    if (!ready || !user || checked) return;
    setChecked(true);
    void getAdminStatus()
      .then((s) => {
        if (s.isAdmin) navigate({ to: "/admin/ingest", replace: true });
      })
      .catch(() => undefined);
  }, [ready, user, checked, navigate]);

  const submit = async () => {
    if (!email.trim() || !password) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const status = await getAdminStatus();
      if (status.isAdmin) {
        toast.success("Welcome back, admin");
        navigate({ to: "/admin/ingest", replace: true });
      } else if (!status.adminExists) {
        toast.info("No admin exists yet — you can claim access on the dashboard.");
        navigate({ to: "/admin/ingest", replace: true });
      } else {
        toast.error("This account does not have admin access.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-md px-4 py-16">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
              <ShieldCheck className="h-6 w-6 text-accent" />
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">Admin sign in</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Restricted area. Only accounts with admin rights can manage indexed standards, clauses
              and product links.
            </p>
          </div>

          <div className="card-surface mt-8 space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void submit()}
              />
            </div>
            <Button
              onClick={() => void submit()}
              disabled={busy || !email.trim() || !password}
              className="w-full gap-2"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Sign in as admin
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Not an administrator?{" "}
              <Link to="/auth" className="underline decoration-accent decoration-2 underline-offset-4">
                Use the regular sign-in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
