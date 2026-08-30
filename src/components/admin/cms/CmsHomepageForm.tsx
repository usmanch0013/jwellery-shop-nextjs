"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  saveCmsHeroAction,
  saveCmsHomepageSectionsAction,
  saveCmsTrustFeaturesAction,
  saveCmsVideoAction,
} from "@/actions/admin/cms";
import CmsImageField from "@/components/admin/cms/builder/CmsImageField";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import type {
  CmsHeroSettings,
  CmsHomepageSections,
  CmsPromoBanner,
  CmsTrustFeature,
  CmsVideoSettings,
} from "@/lib/cms/types";
import { Plus, Save, Trash2 } from "lucide-react";

const fieldClass =
  "h-10 rounded-lg border border-[var(--admin-border)] bg-white px-3 text-[13px]";

const SHOWCASE_KEYS: Array<{ key: string; label: string }> = [
  { key: "bridal-sets", label: "Bridal section" },
  { key: "necklace-sets", label: "Necklace section" },
  { key: "bracelet", label: "Bracelets section" },
  { key: "new-arrivals", label: "New arrivals section" },
  { key: "earrings", label: "Earrings section" },
  { key: "best-selling", label: "Best selling products" },
];

const VIDEO_ICON_OPTIONS = [
  { value: "exchange", label: "Exchange" },
  { value: "scale", label: "Scale / Purity" },
  { value: "diamond", label: "Diamond" },
  { value: "maintenance", label: "Maintenance" },
] as const;

type MediaTarget =
  | { kind: "hero-bg" }
  | { kind: "testimonials-bg" }
  | { kind: "video-poster" };

export default function CmsHomepageForm({
  hero: initialHero,
  sections: initialSections,
  video: initialVideo,
  trustFeatures: initialTrust,
}: {
  hero: CmsHeroSettings;
  sections: CmsHomepageSections;
  video: CmsVideoSettings;
  trustFeatures: CmsTrustFeature[];
}) {
  const router = useRouter();
  const [hero, setHero] = useState(initialHero);
  const [sections, setSections] = useState(initialSections);
  const [video, setVideo] = useState(initialVideo);
  const [trust, setTrust] = useState(initialTrust);
  const [loading, setLoading] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<MediaTarget | null>(null);

  function openMedia(target: MediaTarget) {
    setMediaTarget(target);
    setMediaOpen(true);
  }

  function handleMediaSelect(urls: string[]) {
    const url = urls[0];
    if (!url || !mediaTarget) return;
    if (mediaTarget.kind === "hero-bg") setHero((h) => ({ ...h, backgroundImage: url }));
    if (mediaTarget.kind === "testimonials-bg") {
      setSections((s) => ({
        ...s,
        testimonials: { ...s.testimonials, backgroundImage: url },
      }));
    }
    if (mediaTarget.kind === "video-poster") setVideo((v) => ({ ...v, posterImage: url }));
    setMediaOpen(false);
    setMediaTarget(null);
  }

  function updateShowcaseTitle(key: string, value: string) {
    setSections((s) => ({
      ...s,
      showcaseTitles: { ...s.showcaseTitles, [key]: value },
    }));
  }

  function addPromoBanner() {
    setSections((s) => ({
      ...s,
      promoBanners: [
        ...s.promoBanners,
        { label: "New promo", href: "/shop", bgColor: "champagne" },
      ],
    }));
  }

  function updatePromoBanner(index: number, patch: Partial<CmsPromoBanner>) {
    setSections((s) => {
      const next = [...s.promoBanners];
      next[index] = { ...next[index], ...patch };
      return { ...s, promoBanners: next };
    });
  }

  function removePromoBanner(index: number) {
    setSections((s) => ({
      ...s,
      promoBanners: s.promoBanners.filter((_, i) => i !== index),
    }));
  }

  function addVideoFeature() {
    setVideo((v) => ({
      ...v,
      features: [...v.features, { title: "New feature", icon: "diamond" }],
    }));
  }

  function updateVideoFeature(
    index: number,
    patch: Partial<{ title: string; icon: string }>
  ) {
    setVideo((v) => {
      const next = [...v.features];
      next[index] = { ...next[index], ...patch };
      return { ...v, features: next };
    });
  }

  function removeVideoFeature(index: number) {
    setVideo((v) => ({
      ...v,
      features: v.features.filter((_, i) => i !== index),
    }));
  }

  function addTrustFeature() {
    setTrust((items) => [
      ...items,
      { icon: "globe", title: "NEW FEATURE", description: "Description here" },
    ]);
  }

  function removeTrustFeature(index: number) {
    setTrust((items) => items.filter((_, i) => i !== index));
  }

  async function saveAll(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const results = await Promise.all([
      saveCmsHeroAction(hero),
      saveCmsHomepageSectionsAction(sections),
      saveCmsVideoAction(video),
      saveCmsTrustFeaturesAction(trust),
    ]);
    setLoading(false);
    const error = results.find((r) => r.error)?.error;
    if (error) toast.error(error);
    else {
      toast.success("Homepage content saved");
      router.refresh();
    }
  }

  return (
    <>
      <form onSubmit={saveAll} className="space-y-6">
        <div className="admin-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Hero section</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Eyebrow</Label>
              <Input
                className={fieldClass}
                value={hero.eyebrow}
                onChange={(e) => setHero({ ...hero, eyebrow: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <CmsImageField
                label="Background image (video poster / fallback)"
                value={hero.backgroundImage}
                onChange={(url) => setHero({ ...hero, backgroundImage: url })}
                onPick={() => openMedia({ kind: "hero-bg" })}
                fieldClass={fieldClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Background video</Label>
              <Input
                className={fieldClass}
                value={hero.backgroundVideo ?? ""}
                placeholder="/hero-jewellery.mp4"
                onChange={(e) =>
                  setHero({ ...hero, backgroundVideo: e.target.value })
                }
              />
              <p className="text-[12px] text-[var(--admin-text-subdued)]">
                MP4 URL or public path. Loops silently behind the hero text.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Headline line 1</Label>
              <Input
                className={fieldClass}
                value={hero.headlineLine1}
                onChange={(e) => setHero({ ...hero, headlineLine1: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Headline line 2 (script)</Label>
              <Input
                className={fieldClass}
                value={hero.headlineLine2}
                onChange={(e) => setHero({ ...hero, headlineLine2: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <textarea
              className={`${fieldClass} min-h-[80px] w-full py-2`}
              value={hero.description}
              onChange={(e) => setHero({ ...hero, description: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Primary button label</Label>
              <Input
                className={fieldClass}
                value={hero.primaryCtaLabel}
                onChange={(e) => setHero({ ...hero, primaryCtaLabel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Primary button link</Label>
              <Input
                className={fieldClass}
                value={hero.primaryCtaHref}
                onChange={(e) => setHero({ ...hero, primaryCtaHref: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary button label</Label>
              <Input
                className={fieldClass}
                value={hero.secondaryCtaLabel}
                onChange={(e) => setHero({ ...hero, secondaryCtaLabel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secondary button link</Label>
              <Input
                className={fieldClass}
                value={hero.secondaryCtaHref}
                onChange={(e) => setHero({ ...hero, secondaryCtaHref: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Scroll hint</Label>
              <Input
                className={fieldClass}
                value={hero.scrollHint}
                onChange={(e) => setHero({ ...hero, scrollHint: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="admin-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Product showcase titles</h3>
          <p className="text-[12px] text-[var(--admin-text-subdued)]">
            Headings for each product carousel on the homepage
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SHOWCASE_KEYS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-[12px]">{label}</Label>
                <Input
                  className={fieldClass}
                  value={sections.showcaseTitles[key] ?? ""}
                  onChange={(e) => updateShowcaseTitle(key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Promo banners</h3>
            <Button type="button" size="sm" variant="outline" className="gap-1 h-8" onClick={addPromoBanner}>
              <Plus className="h-3.5 w-3.5" />
              Add banner
            </Button>
          </div>
          {sections.promoBanners.length === 0 && (
            <p className="text-[12px] text-[var(--admin-text-subdued)]">No promo banners yet.</p>
          )}
          {sections.promoBanners.map((banner, i) => (
            <div
              key={`${banner.href}-${i}`}
              className="grid gap-3 rounded-lg border border-[var(--admin-border)] p-3 sm:grid-cols-[1fr_1fr_auto_auto]"
            >
              <Input
                className={fieldClass}
                value={banner.label}
                placeholder="Label"
                onChange={(e) => updatePromoBanner(i, { label: e.target.value })}
              />
              <Input
                className={fieldClass}
                value={banner.href}
                placeholder="/shop?max=1000"
                onChange={(e) => updatePromoBanner(i, { href: e.target.value })}
              />
              <select
                className={fieldClass}
                value={banner.bgColor}
                onChange={(e) =>
                  updatePromoBanner(i, {
                    bgColor: e.target.value as CmsPromoBanner["bgColor"],
                  })
                }
              >
                <option value="champagne">Champagne</option>
                <option value="primary">Primary (maroon)</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-red-600"
                onClick={() => removePromoBanner(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="admin-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">SEO content block</h3>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              className={fieldClass}
              value={sections.seoBlock.title}
              onChange={(e) =>
                setSections({
                  ...sections,
                  seoBlock: { ...sections.seoBlock, title: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Body</Label>
            <textarea
              className={`${fieldClass} min-h-[100px] w-full py-2`}
              value={sections.seoBlock.body}
              onChange={(e) =>
                setSections({
                  ...sections,
                  seoBlock: { ...sections.seoBlock, body: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Collections section title</Label>
            <Input
              className={fieldClass}
              value={sections.collectionsTitle}
              onChange={(e) =>
                setSections({ ...sections, collectionsTitle: e.target.value })
              }
            />
          </div>
        </div>

        <div className="admin-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Testimonials section</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Badge</Label>
              <Input
                className={fieldClass}
                value={sections.testimonials.badge}
                onChange={(e) =>
                  setSections({
                    ...sections,
                    testimonials: { ...sections.testimonials, badge: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                className={fieldClass}
                value={sections.testimonials.title}
                onChange={(e) =>
                  setSections({
                    ...sections,
                    testimonials: { ...sections.testimonials, title: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <CmsImageField
                label="Background image"
                value={sections.testimonials.backgroundImage}
                onChange={(url) =>
                  setSections({
                    ...sections,
                    testimonials: { ...sections.testimonials, backgroundImage: url },
                  })
                }
                onPick={() => openMedia({ kind: "testimonials-bg" })}
                fieldClass={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="admin-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">FAQ section</h3>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              className={fieldClass}
              value={sections.faq.title}
              onChange={(e) =>
                setSections({
                  ...sections,
                  faq: { ...sections.faq, title: e.target.value },
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <textarea
              className={`${fieldClass} min-h-[60px] w-full py-2`}
              value={sections.faq.subtitle}
              onChange={(e) =>
                setSections({
                  ...sections,
                  faq: { ...sections.faq, subtitle: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="admin-card p-5 space-y-4">
          <h3 className="text-sm font-semibold">Video section</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Background video path</Label>
              <Input
                className={fieldClass}
                value={video.backgroundVideo}
                onChange={(e) => setVideo({ ...video, backgroundVideo: e.target.value })}
                placeholder="/intro-video.mp4"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <CmsImageField
                label="Poster image"
                value={video.posterImage}
                onChange={(url) => setVideo({ ...video, posterImage: url })}
                onPick={() => openMedia({ kind: "video-poster" })}
                fieldClass={fieldClass}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>YouTube embed URL (popup video)</Label>
              <Input
                className={fieldClass}
                value={video.youtubeUrl}
                onChange={(e) => setVideo({ ...video, youtubeUrl: e.target.value })}
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <Label>Video feature pills</Label>
              <Button type="button" size="sm" variant="outline" className="gap-1 h-8" onClick={addVideoFeature}>
                <Plus className="h-3.5 w-3.5" />
                Add feature
              </Button>
            </div>
            {video.features.map((feature, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-lg border border-[var(--admin-border)] p-3 sm:grid-cols-[1fr_auto_auto]"
              >
                <Input
                  className={fieldClass}
                  value={feature.title}
                  placeholder="Feature title"
                  onChange={(e) => updateVideoFeature(i, { title: e.target.value })}
                />
                <select
                  className={fieldClass}
                  value={feature.icon}
                  onChange={(e) => updateVideoFeature(i, { icon: e.target.value })}
                >
                  {VIDEO_ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 text-red-600"
                  onClick={() => removeVideoFeature(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Trust bar</h3>
            <Button type="button" size="sm" variant="outline" className="gap-1 h-8" onClick={addTrustFeature}>
              <Plus className="h-3.5 w-3.5" />
              Add item
            </Button>
          </div>
          {trust.map((item, i) => (
            <div
              key={i}
              className="grid gap-3 rounded-lg border border-[var(--admin-border)] p-3 sm:grid-cols-[auto_1fr_1fr_1fr]"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-red-600"
                onClick={() => removeTrustFeature(i)}
                disabled={trust.length <= 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Input
                className={fieldClass}
                value={item.title}
                placeholder="Title"
                onChange={(e) => {
                  const next = [...trust];
                  next[i] = { ...item, title: e.target.value };
                  setTrust(next);
                }}
              />
              <Input
                className={fieldClass}
                value={item.description}
                placeholder="Description"
                onChange={(e) => {
                  const next = [...trust];
                  next[i] = { ...item, description: e.target.value };
                  setTrust(next);
                }}
              />
              <select
                className={fieldClass}
                value={item.icon}
                onChange={(e) => {
                  const next = [...trust];
                  next[i] = { ...item, icon: e.target.value };
                  setTrust(next);
                }}
              >
                <option value="globe">Globe (shipping)</option>
                <option value="shield">Shield (quality)</option>
                <option value="credit-card">Credit card (payment)</option>
              </select>
            </div>
          ))}
        </div>

        <Button type="submit" disabled={loading} className="gap-2 bg-[#008060] hover:bg-[#006e52]">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save homepage"}
        </Button>
      </form>

      <MediaPickerModal
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onSelect={handleMediaSelect}
        title="Choose or upload image"
      />
    </>
  );
}
