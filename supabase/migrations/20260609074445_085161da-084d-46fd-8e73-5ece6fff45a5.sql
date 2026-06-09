
-- STUDENTS: extend with full personal/contact/guardian/address fields
ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS middle_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS sector text,
  ADD COLUMN IF NOT EXISTS cell text,
  ADD COLUMN IF NOT EXISTS village text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS father_name text,
  ADD COLUMN IF NOT EXISTS mother_name text,
  ADD COLUMN IF NOT EXISTS guardian_email text,
  ADD COLUMN IF NOT EXISTS guardian_occupation text;

-- ASSESSMENTS: weight + ensure term link exists
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS weight numeric DEFAULT 1;

-- TEACHER ASSIGNMENTS: class-teacher marker
ALTER TABLE public.teacher_assignments
  ADD COLUMN IF NOT EXISTS is_class_teacher boolean NOT NULL DEFAULT false;

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_select_own" ON public.notifications;
CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notif_update_own" ON public.notifications;
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "notif_delete_own" ON public.notifications;
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_director_select" ON public.audit_log;
CREATE POLICY "audit_director_select" ON public.audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), school_id, 'director'::app_role));

-- REPORT CARDS
CREATE TABLE IF NOT EXISTS public.report_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  term_id uuid REFERENCES public.terms(id) ON DELETE SET NULL,
  total numeric,
  average numeric,
  grade text,
  position integer,
  comments text,
  pdf_url text,
  generated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, term_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_cards TO authenticated;
GRANT ALL ON public.report_cards TO service_role;
ALTER TABLE public.report_cards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rc_select" ON public.report_cards;
CREATE POLICY "rc_select" ON public.report_cards FOR SELECT TO authenticated USING (
  student_id = auth.uid()
  OR public.has_role(auth.uid(), school_id, 'director'::app_role)
  OR public.has_role(auth.uid(), school_id, 'dos'::app_role)
  OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = report_cards.class_id AND c.class_teacher_id = auth.uid())
);
DROP POLICY IF EXISTS "rc_modify" ON public.report_cards;
CREATE POLICY "rc_modify" ON public.report_cards FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), school_id, 'director'::app_role)
    OR public.has_role(auth.uid(), school_id, 'dos'::app_role)
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = report_cards.class_id AND c.class_teacher_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), school_id, 'director'::app_role)
    OR public.has_role(auth.uid(), school_id, 'dos'::app_role)
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = report_cards.class_id AND c.class_teacher_id = auth.uid())
  );
CREATE TRIGGER trg_report_cards_updated BEFORE UPDATE ON public.report_cards FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
