import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthUser } from "@/lib/auth";
import { claimFirstAdmin, getAdminStatus } from "@/lib/admin.functions";

type State = "loading" | "signedOut" | "denied" | "claimable" | "admin";

/** Guards /admin/* pages: only admins may see the children. */
export function AdminGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthUser();
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setState("signedOut");
      return;
    }
    let cancelled = false;
    void getAdminStatus()
      .then((s) => {
        if (cancelled) return;
        setState(s.isAdmin ? "admin" : s.adminExists ? "denied" : "claimable");
      })
      .catch(() => !cancelled && setState("denied"));
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  const claim = () => {
    void claimFirstAdmin()
      .then(() => {
        toast.success("Admin access granted");
        setState("admin");
      })
      .catch((e: Error) => toast.error(e.message));
  };

  let body: ReactNode;
  if (state === "loading" || loading) {
    body = (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-16">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  } else if (state === "signedOut") {
    body = (
      <Centered icon={<ShieldAlert className="h-6 w-6 text-accent" />} title="Sign in required">
        <p className="mt-2 text-sm text-muted-foreground">Admin tools need a signed-in account.</p>
        <Button asChild className="mt-4">
          <Link to="/auth">Sign in</Link>
        </Button>
      </Centered>
    );
  } else if (state === "claimable") {
    body = (
      <Centered icon={<ShieldCheck className="h-6 w-6 text-success" />} title="Set up admin access">
        <p className="mt-2 text-sm text-muted-foreground">
          No admin exists yet. As the first signed-in user, you can claim admin access to manage the
          document knowledge base.
        </p>
        <Button className="mt-4" onClick={claim}>
          Claim admin access
        </Button>
      </Centered>
    );
  } else if (state === "denied") {
    body = (
      <Centered icon={<ShieldAlert className="h-6 w-6 text-destructive" />} title="Access denied">
        <p className="mt-2 text-sm text-muted-foreground">
          This account does not have admin access.
        </p>
      </Centered>
    );
  } else {
    body = <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{body}</main>
    </div>
  );
}

function Centered({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">{icon}</span>
      <h1 className="mt-5 text-xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}
