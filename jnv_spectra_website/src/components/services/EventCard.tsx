import * as React from "react";
import { Link } from "react-router-dom";

// Utility to slugify a string
const slugify = (str: string) =>
  str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

interface EventCardProps {
  title: string;
  id: string;
  description: string;
  tagType: "premium" | "onDemand";
  backgroundImage: string;
  bulletPoints: { label: string; value: string }[];
}

function EventCard({
  title,
  description,
  id,
  tagType,
  backgroundImage,
  bulletPoints,
}: EventCardProps) {
  const slug = slugify(title);

  return (
    <section className="flex overflow-hidden relative flex-col items-end px-16 pt-14 pb-20 mt-28 max-w-full rounded-3xl min-h-[497px] w-[1504px] max-md:px-5 max-md:mt-10">
      <img
        src={backgroundImage}
        className="object-cover absolute inset-0 size-full"
        alt={`${title} background`}
      />
      <article className="overflow-hidden relative py-3 pr-3.5 pl-10 max-w-full bg-white rounded-3xl w-[477px] max-md:pl-5">
        <div className="flex gap-5 max-md:flex-col">
          <div className="w-[71%] max-md:ml-0 max-md:w-full">
            <div className="relative max-md:mt-10">
              <h2 className="text-3xl font-medium text-center text-black">{title}</h2>

              <div className="flex flex-col items-start pr-0.5 pl-2 mt-12 text-sm text-black max-md:mt-10">
                <ul className="mt-6 list-disc list-inside space-y-2 text-stone-700">
                  {bulletPoints.map((point, index) => (
                    <li key={index}>{point.value}</li>
                  ))}
                </ul>

                <Link
                  to={`/events/${slug}`}
                  state={{ id }}
                  className="mt-11 ml-2.5 text-base font-semibold text-stone-600 hover:underline max-md:mt-10"
                >
                  View in Detail
                </Link>
                <div className="shrink-0 mt-1.5 h-px border border-solid border-stone-600 w-[120px] max-md:ml-1" />
              </div>
            </div>
          </div>

          <div className="ml-5 w-[29%] max-md:ml-0 max-md:w-full">
            <div className="flex relative flex-col grow max-md:mt-10">
              {tagType === "premium" ? (
                <div className="px-5 py-2.5 text-sm font-medium text-center text-white whitespace-nowrap bg-fuchsia-800 rounded-xl">
                  Premium
                </div>
              ) : (
                <div className="px-2 py-2.5 text-sm font-medium text-center text-white bg-yellow-700 rounded-xl">
                  On Demand
                </div>
              )}
              {/* <div className="flex flex-col items-end self-end px-3 pt-3 mt-28 bg-stone-200 w-[59px] max-md:mt-10">
                <div className="flex z-10 shrink-0 mb-0 bg-stone-600 h-[188px] max-md:-mr-3.5 max-md:mb-2.5" />
              </div> */}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

export default EventCard;
