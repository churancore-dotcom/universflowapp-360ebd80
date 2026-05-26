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
      expires_at = EXCLUDED.expires_at,
      platform = 'web',
      updated_at = now();

    NEW.reviewed_at = COALESCE(NEW.reviewed_at, now());
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS payment_requests_grant_premium ON public.payment_requests;
DROP TRIGGER IF EXISTS trg_grant_premium_on_approval ON public.payment_requests;
CREATE TRIGGER trg_grant_premium_on_approval
BEFORE INSERT OR UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.grant_premium_on_approval();

DROP TRIGGER IF EXISTS update_payment_requests_updated_at ON public.payment_requests;
CREATE TRIGGER update_payment_requests_updated_at
BEFORE UPDATE ON public.payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_on_premium_activated ON public.user_subscriptions;
CREATE TRIGGER trg_on_premium_activated
BEFORE INSERT OR UPDATE ON public.user_subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.on_premium_activated();