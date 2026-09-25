-- Allow authenticated users to upload to media bucket (signed URL + direct).
-- Service role bypasses RLS; this helps if you ever upload with user JWT.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Authenticated media upload'
  ) THEN
    CREATE POLICY "Authenticated media upload" ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'media');
  END IF;
END $$;
