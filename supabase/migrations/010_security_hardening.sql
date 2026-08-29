-- Security: prevent users from self-promoting to admin via profiles.role

CREATE OR REPLACE FUNCTION public.protect_profiles_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF COALESCE(auth.jwt() ->> 'role', '') <> 'service_role' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profiles_role ON public.profiles;
CREATE TRIGGER protect_profiles_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profiles_role();

-- CMS: deny direct writes from anon/authenticated (admin uses service role)
CREATE POLICY "Deny public insert cms_settings" ON cms_settings FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update cms_settings" ON cms_settings FOR UPDATE USING (false);
CREATE POLICY "Deny public delete cms_settings" ON cms_settings FOR DELETE USING (false);

CREATE POLICY "Deny public insert cms_pages" ON cms_pages FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update cms_pages" ON cms_pages FOR UPDATE USING (false);
CREATE POLICY "Deny public delete cms_pages" ON cms_pages FOR DELETE USING (false);

CREATE POLICY "Deny public insert cms_testimonials" ON cms_testimonials FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update cms_testimonials" ON cms_testimonials FOR UPDATE USING (false);
CREATE POLICY "Deny public delete cms_testimonials" ON cms_testimonials FOR DELETE USING (false);

CREATE POLICY "Deny public insert cms_faqs" ON cms_faqs FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update cms_faqs" ON cms_faqs FOR UPDATE USING (false);
CREATE POLICY "Deny public delete cms_faqs" ON cms_faqs FOR DELETE USING (false);

CREATE POLICY "Deny public insert cms_nav_links" ON cms_nav_links FOR INSERT WITH CHECK (false);
CREATE POLICY "Deny public update cms_nav_links" ON cms_nav_links FOR UPDATE USING (false);
CREATE POLICY "Deny public delete cms_nav_links" ON cms_nav_links FOR DELETE USING (false);
