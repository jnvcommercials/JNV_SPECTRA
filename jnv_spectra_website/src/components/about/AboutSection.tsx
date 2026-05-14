import * as React from "react";

interface AboutSectionProps {
  title: string;
  description: React.ReactNode;
  imageUrl: string;
  imagePosition: "left" | "right";
}

const AboutSection = ({
  title,
  description,
  imageUrl,
  imagePosition,
}: AboutSectionProps) => {
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect screen size
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Tailwind's md breakpoint
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const contentSection = (
    <div className="flex-1 flex items-center">
      <div>
        <h2 className="mb-4 text-2xl font-medium text-black max-md:text-2xl">
          {title}
        </h2>
        <p className="text-lg text-black text-opacity-60 max-md:text-base">
          {description}
        </p>
      </div>
    </div>
  );

  const imageSection = (
    <div className="flex-1 flex items-center justify-center">
      <img
        src={imageUrl}
        alt=""
        className="w-full max-w-[450px] h-auto aspect-[4/3] rounded-[10px] border border-[#ACACAC] object-cover"
      />
    </div>
  );

  const renderLayout = () => {
    if (isMobile) {
      // Always show content then image on mobile
      return (
        <>
          {contentSection}
          {imageSection}
        </>
      );
    }

    // Desktop layout respects imagePosition
    if (imagePosition === "left") {
      return (
        <>
          {imageSection}
          {contentSection}
        </>
      );
    } else {
      return (
        <>
          {contentSection}
          {imageSection}
        </>
      );
    }
  };

  return (
    <section className="flex items-center gap-16 px-20 py-20 max-lg:px-10 max-md:flex-col max-md:gap-10 max-md:py-12 max-sm:px-5">
      {renderLayout()}
    </section>
  );
};

export default AboutSection;
