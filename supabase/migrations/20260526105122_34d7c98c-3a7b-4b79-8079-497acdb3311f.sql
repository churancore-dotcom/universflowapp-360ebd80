-- Make premium activation notification trigger safe for both new and existing subscription rows
CREATE OR REPLACE FUNCTION public.on_premium_activated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_was_premium boolean := false;
  v_is_premium  boolean;
BEGIN
  v_is_premium := NEW.status = 'active'
    AND NEW.subscription_type IN ('premium_monthly','premium_yearly')
    AND (NEW.expires_at IS NULL OR NEW.expires_at > now());

  IF TG_OP = 'UPDATE' THEN
    v_was_premium := OLD.status = 'active'
      AND OLD.subscription_type IN ('premium_monthly','premium_yearly')
      AND (OLD.expires_at IS NULL OR OLD.expires_at > now());
  END IF;

  IF v_is_premium
     AND (
       TG_OP = 'INSERT'
       OR NOT v_was_premium
       OR NEW.expires_at IS DISTINCT FROM OLD.expires_at
     ) THEN
    IF NEW.notif_activated_at IS NULL
       OR NEW.notif_activated_at < now() - interval '5 minutes' THEN
      PERFORM public.notify_system_push(
        ARRAY[NEW.user_id],
        '👑 Premium unlocked',
        'Welcome to Universflow Premium. Unlimited downloads, zero ads, studio-grade audio — your music, elevated.',
        '/premium'
      );
      NEW.notif_activated_at := now();
      NEW.notif_warn_3d_at := NULL;
      NEW.notif_warn_1d_at := NULL;
      NEW.notif_expired_at := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Reliable admin-only approval/rejection function used by the admin panel
CREATE OR REPLACE FUNCTION public.admin_review_payment_request(
  p_request_id uuid,
  p_status text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_req public.payment_requests%ROWTYPE;
  v_expires timestamptz;
  v_type public.subscription_type;
  v_base timestamptz;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid review status';
  END IF;

  SELECT * INTO v_req
  FROM public.payment_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment request not found';
  END IF;

  UPDATE public.payment_requests
  SET status = p_status,
      reviewed_at = COALESCE(reviewed_at, now()),
      updated_at = now()
  WHERE id = p_request_id
  RETURNING * INTO v_req;

  IF p_status = 'approved' THEN
    SELECT GREATEST(now(), COALESCE(us.expires_at, now()))
      INTO v_base
      FROM public.user_subscriptions us
      WHERE us.user_id = v_req.user_id
      LIMIT 1;
    v_base := COALESCE(v_base, now());

    IF v_req.plan = 'lifetime' THEN
      v_expires := '2099-12-31 23:59:59+00'::timestamptz;
      v_type := 'premium_yearly'::public.subscription_type;
    ELSIF v_req.plan = 'quarterly' THEN
      v_expires := v_base + interval '90 days';
      v_type := 'premium_yearly'::public.subscription_type;
    ELSE
      v_expires := v_base + interval '30 days';
      v_type := 'premium_monthly'::public.subscription_type;
    END IF;

    INSERT INTO public.user_subscriptions (user_id, subscription_type, status, expires_at, platform)
    VALUES (v_req.user_id, v_type, 'active', v_expires, 'web')
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_type = EXCLUDED.subscription_type,
      status = 'active',
      expires_at = GREATEST(public.user_subscriptions.expires_at, EXCLUDED.expires_at),
      platform = 'web',
      updated_at = now();
  END IF;

  RETURN jsonb_build_object('success', true, 'status', p_status, 'user_id', v_req.user_id);
END;
$$;

-- Make the existing automatic trigger idempotent and lifetime-safe
CREATE OR REPLACE FUNCTION public.grant_premium_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_expires timestamptz;
  v_type public.subscription_type;
  v_base timestamptz;
BEGIN
  IF NEW.status IN ('approved','auto_approved')
     AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM NEW.status) THEN

    SELECT GREATEST(now(), COALESCE(us.expires_at, now()))
      INTO v_base
      FROM public.user_subscriptions us
      WHERE us.user_id = NEW.user_id
      LIMIT 1;
    v_base := COALESCE(v_base, now());

    IF NEW.plan = 'lifetime' THEN
      v_expires := '2099-12-31 23:59:59+00'::timestamptz;
      v_type := 'premium_yearly'::public.subscription_type;
    ELSIF NEW.plan = 'quarterly' THEN
      v_expires := v_base + interval '90 days';
      v_type := 'premium_yearly'::public.subscription_type;
    ELSE
      v_expires := v_base + interval '30 days';
      v_type := 'premium_monthly'::public.subscription_type;
    END IF;

    INSERT INTO public.user_subscriptions (user_id, subscription_type, status, expires_at, platform)
    VALUES (NEW.user_id, v_type, 'active', v_expires, 'web')
    ON CONFLICT (user_id) DO UPDATE SET
      subscription_type = EXCLUDED.subscription_type,
      status = 'active',
      expires_at = GREATEST(public.user_subscriptions.expires_at, EXCLUDED.expires_at),
      platform = 'web',
      updated_at = now();

    NEW.reviewed_at = COALESCE(NEW.reviewed_at, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grant_premium_on_approval ON public.payment_requests;
CREATE TRIGGER trg_grant_premium_on_approval
BEFORE INSERT OR UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.grant_premium_on_approval();

DROP TRIGGER IF EXISTS trg_on_premium_activated ON public.user_subscriptions;
CREATE TRIGGER trg_on_premium_activated
BEFORE INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.on_premium_activated();

-- Backfill users with approved payments but no active subscription.
-- If a user ever bought lifetime, lifetime wins.
ALTER TABLE public.user_subscriptions DISABLE TRIGGER USER;

WITH approved AS (
  SELECT
    pr.user_id,
    bool_or(pr.plan = 'lifetime') AS has_lifetime,
    COALESCE(sum(CASE
      WHEN pr.plan = 'quarterly' THEN 90
      WHEN pr.plan = 'monthly' THEN 30
      ELSE 0
    END), 0)::int AS duration_days,
    max(COALESCE(pr.reviewed_at, pr.created_at)) AS latest_reviewed_at
  FROM public.payment_requests pr
  WHERE pr.status IN ('approved','auto_approved')
  GROUP BY pr.user_id
), grants AS (
  SELECT
    a.user_id,
    CASE WHEN a.has_lifetime OR a.duration_days >= 365 THEN 'premium_yearly'::public.subscription_type
         ELSE 'premium_monthly'::public.subscription_type
    END AS subscription_type,
    CASE WHEN a.has_lifetime THEN '2099-12-31 23:59:59+00'::timestamptz
         ELSE GREATEST(now(), a.latest_reviewed_at) + make_interval(days => GREATEST(a.duration_days, 30))
    END AS expires_at
  FROM approved a
)
INSERT INTO public.user_subscriptions (user_id, subscription_type, status, expires_at, platform)
SELECT g.user_id, g.subscription_type, 'active'::public.subscription_status, g.expires_at, 'web'::public.subscription_platform
FROM grants g
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_subscriptions us WHERE us.user_id = g.user_id
)
ON CONFLICT (user_id) DO UPDATE SET
  subscription_type = EXCLUDED.subscription_type,
  status = 'active',
  expires_at = GREATEST(public.user_subscriptions.expires_at, EXCLUDED.expires_at),
  platform = 'web',
  updated_at = now();

ALTER TABLE public.user_subscriptions ENABLE TRIGGER USER;

-- Enable live updates used by the Premium page after admin review
ALTER TABLE public.payment_requests REPLICA IDENTITY FULL;
ALTER TABLE public.user_subscriptions REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'payment_requests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_requests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'user_subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_subscriptions;
  END IF;
END $$;