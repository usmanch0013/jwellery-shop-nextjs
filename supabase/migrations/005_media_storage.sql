-- Media library improvements: unique URLs, source tracking, storage bucket

ALTER TABLE media_library
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual';

CREATE UNIQUE INDEX IF NOT EXISTS media_library_url_unique_idx
  ON media_library (url);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects' AND policyname = 'Public media read'
  ) THEN
    CREATE POLICY "Public media read" ON storage.objects
      FOR SELECT USING (bucket_id = 'media');
  END IF;
END $$;
