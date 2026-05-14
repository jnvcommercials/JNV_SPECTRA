import React from "react";
import EnquireButton from "./EnquireButton";

interface BulletPoint {
  value: string;
}

interface ServiceDescriptionProps {
  title?: string;
  description: string;
  bulletPoints: BulletPoint[];
}

const ServiceDescription: React.FC<ServiceDescriptionProps> = ({
  title,
  description,
  bulletPoints,
}) => {
  return (
    <section className="flex flex-col gap-12 mt-12 px-4 sm:px-6 lg:px-8">
      {/* Two Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Description Text */}
        <article className="text-base sm:text-lg text-black text-opacity-60 max-w-full lg:max-w-[650px]">
          <p>{description}</p>
        </article>

        {/* Bullet Points and CTA Box */}
        <aside className="p-5 sm:p-6 md:p-8 rounded-3xl border border-zinc-300 w-full lg:w-[750px]">
          <p className="mb-5 text-base sm:text-lg text-black text-opacity-60">
            <span className="font-semibold text-stone-700">{title}</span>
          </p>

          <ul className="list-disc pl-5 mb-8 text-black text-opacity-70 text-sm sm:text-base flex flex-col gap-2">
            {bulletPoints && bulletPoints.length > 0 ? (
              bulletPoints.map((point, index) => (
                <li key={index}>{point.value}</li>
              ))
            ) : (
              <>
                <li>Custom theme-based decoration</li>
                <li>Stage setup and backdrops</li>
              </>
            )}
          </ul>

          <EnquireButton />
        </aside>
      </div>
    </section>
  );
};

export default ServiceDescription;
