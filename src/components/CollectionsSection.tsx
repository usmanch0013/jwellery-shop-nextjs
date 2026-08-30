import CategoryCard from "@/components/CategoryCard";
import type { CategoryInfo } from "@/types";

export default function CollectionsSection({
  title,
  categories,
}: {
  title: string;
  categories: CategoryInfo[];
}) {
  const visible = categories.filter((cat) => cat.image);
  if (visible.length === 0) return null;

  let loop = [...visible];
  while (loop.length < 8) {
    loop = [...loop, ...visible];
  }
  const track = [...loop, ...loop];

  return (
    <section id="collections" className="bg-white py-8 sm:py-10 lg:py-14">
      <div className="mx-auto mb-6 max-w-[1400px] px-4 sm:mb-8 sm:px-6 lg:px-8">
        <h2 className="text-center font-serif text-xl capitalize text-foreground sm:text-2xl lg:text-[28px]">
          {title}
        </h2>
      </div>

      <div className="overflow-hidden">
        <div className="collections-marquee flex w-max gap-2 sm:gap-2.5">
          {track.map((cat, index) => (
            <div
              key={`${cat.slug}-${index}`}
              className="w-[46vw] shrink-0 sm:w-[31vw] md:w-[23.5vw] lg:w-[16.2vw] xl:w-[14.6vw]"
            >
              <CategoryCard category={cat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
