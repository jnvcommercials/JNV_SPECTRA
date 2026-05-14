import React from "react";
import EnquireButton from "./EnquireButton";

interface BulletPoint {
  description: string;
}

interface EventServiceDescriptionProps {
  title?:string;
  description: string;
  bulletPoints: BulletPoint[];
}

const EventServiceDescription: React.FC<EventServiceDescriptionProps> = ({ title,description, bulletPoints }) => {
  return (
    <section className="flex flex-col gap-12 mt-12 px-4 sm:px-6 md:px-12">
      {/* Two Column Layout */}
      <div className="flex gap-12 max-md:flex-col">
        <article className="text-xl max-w-[650px] text-black text-opacity-40">
          <p>{description}</p>
        </article>

        <aside className="p-8 rounded-3xl border border-solid border-zinc-300 w-[750px] max-md:w-full max-sm:p-5">
          {/* <p className="mb-5 text-sm text-black text-opacity-40">
            Professional planning that impresses your clients and team
          </p> */}
          <p className="mb-5 text-lg text-black text-opacity-40">
            
            <span className="font-medium text-stone-600">{title}</span>
          </p>

          {/* Bullet Point List */}
          <ul className="list-disc pl-5 mb-8 text-black text-opacity-60 text-base flex flex-col gap-2">
            {bulletPoints && bulletPoints.length > 0 ? (
              bulletPoints.map((point, index) => (
                <li key={index}>{point.description}</li>
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

export default EventServiceDescription;
