REVOKE EXECUTE ON FUNCTION public.grant_premium_on_approval() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_premium_activated() FROM PUBLIC, anon, authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_review_payment_request(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_review_payment_request(uuid, text) TO authenticated;