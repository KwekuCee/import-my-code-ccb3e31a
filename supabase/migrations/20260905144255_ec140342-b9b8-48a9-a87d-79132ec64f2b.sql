-- 1. Remove the old counting-based promotion triggers
DROP TRIGGER IF EXISTS trg_leader_promotion_check ON public.leaders;

-- 2. Growth rules engine
CREATE OR REPLACE FUNCTION public.apply_leader_growth_rules()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_rounds INT := 0;
  v_changed INT := 0;
  r RECORD;
BEGIN
  LOOP
    v_rounds := v_rounds + 1;
    v_changed := 0;

    FOR r IN
      WITH promo AS (
        SELECT l.id,
               CASE
                 WHEN l.leader_type = 'BSCT' AND (SELECT count(*) FROM public.leaders c WHERE c.parent_leader_id = l.id AND c.leader_type = 'BSCT') >= 4 THEN 'Cell Leader'
                 WHEN l.leader_type = 'Cell Leader' AND (SELECT count(*) FROM public.leaders c WHERE c.parent_leader_id = l.id AND c.leader_type = 'Cell Leader') >= 4 THEN 'PCF Leader'
                 WHEN l.leader_type = 'PCF Leader' AND (SELECT count(*) FROM public.leaders c WHERE c.parent_leader_id = l.id AND c.leader_type = 'PCF Leader') >= 4 THEN 'Church Coordinator'
                 ELSE NULL
               END AS target
        FROM public.leaders l
        WHERE COALESCE(l.is_appointed, false) = false
      )
      UPDATE public.leaders lu
      SET leader_type = promo.target::leader_type_enum,
          promotion_status = 'Confirmed',
          cell_or_pcf_name = CASE
            WHEN promo.target = 'Cell Leader' THEN COALESCE(NULLIF(lu.cell_or_pcf_name, ''), lu.full_name) || ' Cell'
            WHEN promo.target = 'PCF Leader' THEN COALESCE(NULLIF(lu.cell_or_pcf_name, ''), lu.full_name) || ' PCF'
            ELSE lu.cell_or_pcf_name
          END
      FROM promo
      WHERE lu.id = promo.id AND promo.target IS NOT NULL
      RETURNING lu.id, lu.full_name, lu.church_id, lu.church_name, lu.leader_type
    LOOP
      v_changed := v_changed + 1;
      INSERT INTO public.audit_logs (actor, church_id, church_name, action, category, icon)
      VALUES ('System', r.church_id, r.church_name,
        r.full_name || ' automatically became a ' || r.leader_type || ' after four groups grew under them.',
        'Leader', 'trending_up');
    END LOOP;

    EXIT WHEN v_changed = 0 OR v_rounds >= 6;
  END LOOP;

  -- Keep the downstream counters in step with the structure
  UPDATE public.leaders l
  SET downstream_count = (
        SELECT count(*) FROM public.members m WHERE m.invited_by_leader_id = l.id
      ) + (
        SELECT count(*) FROM public.leaders c WHERE c.parent_leader_id = l.id
      )
  WHERE l.downstream_count IS DISTINCT FROM (
        SELECT count(*) FROM public.members m WHERE m.invited_by_leader_id = l.id
      ) + (
        SELECT count(*) FROM public.leaders c WHERE c.parent_leader_id = l.id
      );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_leader_growth_rules() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_leader_growth_rules() TO service_role;

-- 3. Replace the old row trigger function with a no-op-safe version and a structure watcher
CREATE OR REPLACE FUNCTION public.trigger_leader_promotion_check()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_leader_structure_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF pg_trigger_depth() <= 1 THEN
    PERFORM public.apply_leader_growth_rules();
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_leader_structure_changed
AFTER INSERT OR UPDATE OF leader_type, parent_leader_id OR DELETE ON public.leaders
FOR EACH STATEMENT EXECUTE FUNCTION public.trigger_leader_structure_changed();

-- 4. Foundation school graduation makes a member a Bible study class teacher
CREATE OR REPLACE FUNCTION public.trigger_member_foundation_graduation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE v_exists UUID; v_new UUID;
BEGIN
  IF COALESCE(NEW.foundation_class, 0) < 7 THEN
    RETURN NEW;
  END IF;

  SELECT id INTO v_exists FROM public.leaders
  WHERE (NEW.email IS NOT NULL AND NEW.email <> '' AND LOWER(email) = LOWER(NEW.email))
     OR (LOWER(full_name) = LOWER(NEW.full_name) AND COALESCE(church_id::text,'') = COALESCE(NEW.church_id::text,''))
  LIMIT 1;

  IF v_exists IS NOT NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.leaders (
    church_id, church_name, full_name, email, contact, dob, location,
    leader_type, cell_or_pcf_name, parent_leader_id, is_appointed, promotion_status
  ) VALUES (
    NEW.church_id, NEW.church_name, NEW.full_name, NEW.email, NEW.phone, NEW.dob, NEW.location,
    'BSCT', NEW.full_name || '''s Bible Study Class', NEW.invited_by_leader_id, false, 'Confirmed'
  ) RETURNING id INTO v_new;

  UPDATE public.members SET role = 'Leader' WHERE id = NEW.id AND role IS DISTINCT FROM 'Leader';

  INSERT INTO public.audit_logs (actor, church_id, church_name, action, category, icon)
  VALUES ('System', NEW.church_id, NEW.church_name,
    NEW.full_name || ' finished foundation school and now leads ' || NEW.full_name || '''s Bible Study Class.',
    'Leader', 'school');

  PERFORM public.apply_leader_growth_rules();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_foundation_graduation ON public.members;
CREATE TRIGGER trg_member_foundation_graduation
AFTER INSERT OR UPDATE OF foundation_class ON public.members
FOR EACH ROW EXECUTE FUNCTION public.trigger_member_foundation_graduation();

-- 5. Bring existing records in line with the new rules
DO $$
DECLARE m RECORD;
BEGIN
  FOR m IN SELECT * FROM public.members WHERE COALESCE(foundation_class,0) >= 7 LOOP
    IF NOT EXISTS (
      SELECT 1 FROM public.leaders
      WHERE (m.email IS NOT NULL AND m.email <> '' AND LOWER(email) = LOWER(m.email))
         OR (LOWER(full_name) = LOWER(m.full_name) AND COALESCE(church_id::text,'') = COALESCE(m.church_id::text,''))
    ) THEN
      INSERT INTO public.leaders (church_id, church_name, full_name, email, contact, dob, location,
        leader_type, cell_or_pcf_name, parent_leader_id, is_appointed, promotion_status)
      VALUES (m.church_id, m.church_name, m.full_name, m.email, m.phone, m.dob, m.location,
        'BSCT', m.full_name || '''s Bible Study Class', m.invited_by_leader_id, false, 'Confirmed');
    END IF;
  END LOOP;
END $$;

SELECT public.apply_leader_growth_rules();