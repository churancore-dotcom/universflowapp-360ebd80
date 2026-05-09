DROP POLICY IF EXISTS "Anyone can view review reactions" ON public.review_reactions;
CREATE POLICY "Authenticated users can view review reactions"
ON public.review_reactions
FOR SELECT
TO authenticated
USING (true);