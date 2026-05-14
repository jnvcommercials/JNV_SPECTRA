import * as React from "react";

const FeaturedEventSection = () => {
  return (
    <section className="flex items-center overflow-hidden mx-40 rounded-3xl border border-stone-300 max-lg:mx-10 max-md:flex-col max-md:mx-6 max-sm:mx-4">
      {/* Image Section */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/91cc7f5d7e37889144559022097e84df3140c431"
        alt="Featured event"
        className="w-[420px] h-[380px] object-cover rounded-l-3xl max-md:rounded-t-3xl max-md:rounded-l-none max-md:w-full max-md:h-[250px]"
      />

      {/* Content Section */}
      <article className="flex flex-col flex-1 justify-center p-10 max-md:p-6">
        <p className="mb-2.5 text-sm uppercase text-black text-opacity-50">
          One of our best
        </p>

        <h2 className="mb-4 text-2xl font-medium text-black max-md:text-xl">
          Events That Leave an Impression
        </h2>

        <p className="mb-6 text-base text-black text-opacity-60 max-md:text-sm">
          Expertly planned, flawlessly executed. With attention to every detail,
          we transform your vision into unforgettable experiences. Leave the
          planning to us and enjoy the celebration you deserve.
        </p>

        {/* <button className="text-base font-medium text-white rounded-xl bg-[#605C4C] hover:bg-[#4F4B3D] h-12 w-60 max-sm:w-full"
        style={{
          background: 'linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)',
          border: '1px solid #fff'
        }}>
          More Details
        </button> */}
      </article>
    </section>
  );
};

export default FeaturedEventSection;
