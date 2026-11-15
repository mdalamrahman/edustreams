-- Apply after schema.sql. Financial writes must go through the authenticated backend.
BEGIN;
DROP POLICY IF EXISTS "Allow full access to user_dsa_progress" ON public.user_dsa_progress;
DROP POLICY IF EXISTS "Users manage own progress" ON public.user_dsa_progress;
CREATE POLICY "Users manage own progress" ON public.user_dsa_progress
  FOR ALL TO authenticated
  USING (lower(user_email) = lower(auth.jwt()->>'email'))
  WITH CHECK (lower(user_email) = lower(auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Allow full access to billing_transactions" ON public.billing_transactions;
DROP POLICY IF EXISTS "Users read own billing" ON public.billing_transactions;
CREATE POLICY "Users read own billing" ON public.billing_transactions
  FOR SELECT TO authenticated USING (lower(user_email) = lower(auth.jwt()->>'email'));

DROP POLICY IF EXISTS "Users manage own attempts" ON public.question_attempts;
CREATE POLICY "Users manage own attempts" ON public.question_attempts
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own analytics" ON public.user_analytics;
CREATE POLICY "Users manage own analytics" ON public.user_analytics
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- The legacy SECURITY DEFINER RPC accepted arbitrary user IDs and negative amounts.
-- It is superseded by the backend ledger. Revoke it if installed on this database.
DO $$ BEGIN
  IF to_regprocedure('public.deduct_wallet_credits(uuid,numeric,text,text,text)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.deduct_wallet_credits(uuid,numeric,text,text,text) FROM PUBLIC, anon, authenticated;
  END IF;
END $$;
COMMIT;
