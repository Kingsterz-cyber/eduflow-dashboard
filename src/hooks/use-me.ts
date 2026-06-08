import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type AppRole = "director" | "dos" | "teacher" | "student";
export type AccountStatus = "pending" | "active" | "rejected" | "inactive";

export type MeContext = {
  session: Session | null;
  loading: boolean;
  profile: {
    id: string;
    school_id: string | null;
    full_name: string;
    email: string;
    status: AccountStatus;
  } | null;
  role: AppRole | null;
  roles: AppRole[];
  school: { id: string; name: string; logo_url: string | null; school_code: string } | null;
  refresh: () => Promise<void>;
};

export function useMe(): MeContext {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<MeContext["profile"]>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [school, setSchool] = useState<MeContext["school"]>(null);

  const load = async (uid: string) => {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, school_id, full_name, email, status")
        .eq("id", uid)
        .maybeSingle(),
      supabase.from("user_roles").select("role, school_id").eq("user_id", uid),
    ]);
    setProfile(p as MeContext["profile"]);
    const rs = (r ?? []).map((x: { role: AppRole }) => x.role);
    setRoles(rs);
    if (p?.school_id) {
      const { data: s } = await supabase
        .from("schools")
        .select("id, name, logo_url, school_code")
        .eq("id", p.school_id)
        .maybeSingle();
      setSchool(s as MeContext["school"]);
    } else {
      setSchool(null);
    }
  };

  const refresh = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    if (data.session?.user?.id) await load(data.session.user.id);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;
      setSession(sess);
      if (sess?.user?.id) {
        await load(sess.user.id);
      } else {
        setProfile(null);
        setRoles([]);
        setSchool(null);
      }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const role: AppRole | null =
    roles.includes("director") ? "director"
    : roles.includes("dos") ? "dos"
    : roles.includes("teacher") ? "teacher"
    : roles.includes("student") ? "student"
    : null;

  return { session, loading, profile, role, roles, school, refresh };
}
