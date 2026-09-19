import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = (u: User | null) => {
      if (done) return;
      done = true;
      setUser(u);
      setReady(true);
    };
    // Local read first — no network, so `ready` never hangs offline.
    void supabase.auth
      .getSession()
      .then(({ data }) => finish(data.session?.user ?? null))
      .catch(() => finish(null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      finish(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, ready };
}
