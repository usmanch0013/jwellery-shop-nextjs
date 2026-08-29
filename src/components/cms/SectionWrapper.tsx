import {
  getSectionAdvanced,
  sectionWrapperClass,
  sectionWrapperStyle,
} from "@/lib/cms/section-style";

export default function SectionWrapper({
  settings,
  children,
}: {
  settings: Record<string, unknown>;
  children: React.ReactNode;
}) {
  const advanced = getSectionAdvanced(settings);

  return (
    <div
      id={advanced.cssId || undefined}
      className={sectionWrapperClass(settings)}
      style={sectionWrapperStyle(settings)}
    >
      {children}
    </div>
  );
}
