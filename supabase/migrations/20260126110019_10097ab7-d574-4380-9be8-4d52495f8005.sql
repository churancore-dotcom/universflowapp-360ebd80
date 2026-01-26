-- Drop the old public access policy
DROP POLICY IF EXISTS "Anyone can view comments" ON public.song_comments;

-- Create new policy that only allows authenticated users to view comments
CREATE POLICY "Authenticated users can view comments" 
ON public.song_comments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);