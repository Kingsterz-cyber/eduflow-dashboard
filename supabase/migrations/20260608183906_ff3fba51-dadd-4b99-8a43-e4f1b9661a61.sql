
-- =========================================================================
-- EduFlow Phase 1: Schema, Roles, RLS
-- =========================================================================

-- ----- Enums -----
CREATE TYPE public.app_role AS ENUM ('director', 'dos', 'teacher', 'student');
CREATE TYPE public.account_status AS ENUM ('pending', 'active', 'rejected', 'inactive');
CREATE TYPE public.assessment_type AS ENUM ('CAT', 'Quiz', 'Exam', 'Assignment');
CREATE TYPE public.attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE public.code_status AS ENUM ('unused', 'used', 'revoked');

-- ----- updated_at helper -----
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- =========================================================================
-- schools
-- =========================================================================
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  country TEXT,
  school_type TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  school_code TEXT NOT NULL UNIQUE,
  teacher_reg_code TEXT NOT NULL,
  student_reg_code TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT ALL ON public.schools TO service_role;
GRANT SELECT ON public.schools TO anon;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_schools_updated BEFORE UPDATE ON public.schools FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================================================================
-- profiles
-- =========================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  status public.account_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, COALESCE(NEW.email,''), COALESCE(NEW.raw_user_meta_data->>'full_name',''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- user_roles (separate table — security best practice)
-- =========================================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, school_id, role)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security-definer helpers
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _school_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND school_id = _school_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_school_member(_user_id UUID, _school_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND school_id = _school_id
  );
$$;

CREATE OR REPLACE FUNCTION public.current_school_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

-- =========================================================================
-- Academic structure
-- =========================================================================
CREATE TABLE public.divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.divisions TO authenticated;
GRANT ALL ON public.divisions TO service_role;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.levels TO authenticated;
GRANT ALL ON public.levels TO service_role;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  class_teacher_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.classes TO authenticated;
GRANT ALL ON public.classes TO service_role;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_classes_updated BEFORE UPDATE ON public.classes FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.departments TO authenticated;
GRANT ALL ON public.departments TO service_role;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subjects TO authenticated;
GRANT ALL ON public.subjects TO service_role;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- Teaching assignments + students
-- =========================================================================
CREATE TABLE public.teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (teacher_id, subject_id, class_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.teacher_assignments TO authenticated;
GRANT ALL ON public.teacher_assignments TO service_role;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.enrollment_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  status public.code_status NOT NULL DEFAULT 'unused',
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.enrollment_codes TO authenticated;
GRANT ALL ON public.enrollment_codes TO service_role;
GRANT SELECT, UPDATE ON public.enrollment_codes TO anon;
ALTER TABLE public.enrollment_codes ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.students (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  enrollment_code TEXT NOT NULL,
  guardian_name TEXT,
  guardian_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- Academic data
-- =========================================================================
CREATE TABLE public.terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.terms TO authenticated;
GRANT ALL ON public.terms TO service_role;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term_id UUID REFERENCES public.terms(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type public.assessment_type NOT NULL DEFAULT 'CAT',
  total_marks NUMERIC NOT NULL DEFAULT 100,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, student_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marks TO authenticated;
GRANT ALL ON public.marks TO service_role;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_marks_updated BEFORE UPDATE ON public.marks FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status public.attendance_status NOT NULL DEFAULT 'present',
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id, date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attendance TO authenticated;
GRANT ALL ON public.attendance TO service_role;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.grading_bands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  grade TEXT NOT NULL,
  min_score NUMERIC NOT NULL,
  max_score NUMERIC NOT NULL,
  label TEXT,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grading_bands TO authenticated;
GRANT ALL ON public.grading_bands TO service_role;
ALTER TABLE public.grading_bands ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience_roles public.app_role[] DEFAULT '{}',
  audience_class_ids UUID[] DEFAULT '{}',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  kind TEXT NOT NULL,
  description TEXT NOT NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- =========================================================================
-- RLS Policies
-- =========================================================================

-- schools: anyone (incl. anon for signup lookup by code) can read; only the director or system can create/update
CREATE POLICY "schools_select_public_basic" ON public.schools FOR SELECT USING (true);
CREATE POLICY "schools_insert_authenticated" ON public.schools FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "schools_update_director" ON public.schools FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), id, 'director'))
  WITH CHECK (public.has_role(auth.uid(), id, 'director'));

-- profiles
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_school_member(auth.uid(), school_id));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director'))
  WITH CHECK (id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director'));
CREATE POLICY "profiles_self_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- user_roles
CREATE POLICY "user_roles_select_self_or_director" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director'));
CREATE POLICY "user_roles_insert_self_or_director" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director')
  );
CREATE POLICY "user_roles_delete_director" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), school_id, 'director'));

-- Generic helper macro idea via repeated policies. School-scoped read for members, write for director/dos.

-- divisions / levels / classes / departments / subjects: read by school members; write by director or DOS
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['divisions','levels','classes','departments','subjects','terms','grading_bands']) LOOP
    EXECUTE format($f$CREATE POLICY "%1$s_select_members" ON public.%1$s FOR SELECT TO authenticated USING (public.is_school_member(auth.uid(), school_id));$f$, t);
    EXECUTE format($f$CREATE POLICY "%1$s_modify_admin" ON public.%1$s FOR ALL TO authenticated USING (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos')) WITH CHECK (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));$f$, t);
  END LOOP;
END $$;

-- teacher_assignments: teacher reads own; director/dos read+manage all in school
CREATE POLICY "ta_select_member" ON public.teacher_assignments FOR SELECT TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));
CREATE POLICY "ta_insert_self_or_admin" ON public.teacher_assignments FOR INSERT TO authenticated
  WITH CHECK (teacher_id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));
CREATE POLICY "ta_modify_admin" ON public.teacher_assignments FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'))
  WITH CHECK (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));
CREATE POLICY "ta_delete_admin" ON public.teacher_assignments FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));

-- enrollment_codes: school members read; class teacher or director/dos manage; anon can SELECT (to verify) and UPDATE (claim during signup)
CREATE POLICY "ec_select_members_or_anon" ON public.enrollment_codes FOR SELECT USING (true);
CREATE POLICY "ec_insert_class_or_admin" ON public.enrollment_codes FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.class_teacher_id = auth.uid())
  );
CREATE POLICY "ec_update_claim_or_admin" ON public.enrollment_codes FOR UPDATE
  USING (true) WITH CHECK (true);
CREATE POLICY "ec_delete_admin" ON public.enrollment_codes FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));

-- students
CREATE POLICY "students_select_member" ON public.students FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = class_id AND c.class_teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teacher_assignments ta WHERE ta.class_id = students.class_id AND ta.teacher_id = auth.uid())
  );
CREATE POLICY "students_self_insert" ON public.students FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "students_admin_modify" ON public.students FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'))
  WITH CHECK (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));

-- assessments
CREATE POLICY "assess_select_member" ON public.assessments FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.students s WHERE s.id = auth.uid() AND s.class_id = assessments.class_id)
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = assessments.class_id AND c.class_teacher_id = auth.uid())
  );
CREATE POLICY "assess_teacher_modify" ON public.assessments FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'))
  WITH CHECK (teacher_id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));

-- marks
CREATE POLICY "marks_select" ON public.marks FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR recorded_by = auth.uid()
    OR public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.assessments a JOIN public.classes c ON c.id = a.class_id WHERE a.id = marks.assessment_id AND c.class_teacher_id = auth.uid())
  );
CREATE POLICY "marks_teacher_modify" ON public.marks FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.teacher_id = auth.uid())
  );

-- attendance
CREATE POLICY "att_select" ON public.attendance FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = attendance.class_id AND c.class_teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teacher_assignments ta WHERE ta.class_id = attendance.class_id AND ta.teacher_id = auth.uid())
  );
CREATE POLICY "att_teacher_modify" ON public.attendance FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = attendance.class_id AND c.class_teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teacher_assignments ta WHERE ta.class_id = attendance.class_id AND ta.teacher_id = auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), school_id, 'director')
    OR public.has_role(auth.uid(), school_id, 'dos')
    OR EXISTS (SELECT 1 FROM public.classes c WHERE c.id = attendance.class_id AND c.class_teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.teacher_assignments ta WHERE ta.class_id = attendance.class_id AND ta.teacher_id = auth.uid())
  );

-- announcements: all school members read
CREATE POLICY "ann_select_member" ON public.announcements FOR SELECT TO authenticated USING (public.is_school_member(auth.uid(), school_id));
CREATE POLICY "ann_modify" ON public.announcements FOR ALL TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'))
  WITH CHECK (public.is_school_member(auth.uid(), school_id));

-- activity_log: director/dos read
CREATE POLICY "act_select_admin" ON public.activity_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), school_id, 'director') OR public.has_role(auth.uid(), school_id, 'dos'));
CREATE POLICY "act_insert_member" ON public.activity_log FOR INSERT TO authenticated WITH CHECK (public.is_school_member(auth.uid(), school_id));

-- =========================================================================
-- Realtime
-- =========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.marks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
