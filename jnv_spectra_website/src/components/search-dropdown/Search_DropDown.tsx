import * as React from "react";

function SearchBar({onSearch}:{onSearch:(filters:any)=>void}) {
  const [guests, setGuests] = React.useState("");
  const [venue, setVenue] = React.useState("");
  const [space, setSpace] = React.useState("");
  const [rating, setRating] = React.useState("");

  const dropdownBaseClasses =
    "bg-transparent appearance-none pr-8 pl-2 text-zinc-700 focus:outline-none cursor-pointer w-full text-sm md:text-base";

  const handleSearch = () => {
    const filters = { guests, venue, space, rating };
    // console.log("Searching with filters:", filters);
    onSearch(filters);
    // You can pass `filters` to your API call or filtering logic
  };

  return (
    <section className="flex flex-wrap justify-center gap-4 mt-12 w-full max-w-[1504px] text-base font-medium text-zinc-600 mx-auto px-4 md:px-6">
      {/* Guests Dropdown */}
      <div className="relative flex items-center px-4 py-3 bg-white rounded-xl border border-zinc-300 shadow-sm w-full sm:w-[48%] md:w-[200px]">
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className={dropdownBaseClasses}
          aria-label="Select number of guests"
        >
          <option value="" disabled>
            No. of Guests
          </option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
          <option value="1000">1000</option>
        </select>
        <CaretIcon />
      </div>

      {/* Venue Type Dropdown */}
      <div className="relative flex items-center px-4 py-3 bg-white rounded-xl border border-zinc-300 shadow-sm w-full sm:w-[48%] md:w-[200px]">
        <select
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          className={dropdownBaseClasses}
          aria-label="Select venue type"
        >
          <option value="" disabled>
            Venue
          </option>
          <option value="hall">Banquet Hall</option>
          <option value="outdoor">Garden & Outdoor</option>
          <option value="rooftop">Roof Top</option>
          <option value="resort">Resort</option>
          <option value="beachfront">Beach Front</option>
        </select>
        <CaretIcon />
      </div>

      {/* Space Preference Dropdown */}
      <div className="relative flex items-center px-4 py-3 bg-white rounded-xl border border-zinc-300 shadow-sm w-full sm:w-[48%] md:w-[220px]">
        <select
          value={space}
          onChange={(e) => setSpace(e.target.value)}
          className={dropdownBaseClasses}
          aria-label="Select space preference"
        >
          <option value="" disabled>
            Space Preference
          </option>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
          <option value="both">Both</option>
        </select>
        <CaretIcon />
      </div>

      {/* Rating Dropdown */}
      <div className="relative flex items-center px-4 py-3 bg-white rounded-xl border border-zinc-300 shadow-sm w-full sm:w-[48%] md:w-[180px]">
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className={dropdownBaseClasses}
          aria-label="Select rating"
        >
          <option value="" disabled>
            Rating
          </option>
          <option value="1">1★ & above</option>
          <option value="2">2★ & above</option>
          <option value="3">3★ & above</option>
          <option value="4">4★ & above</option>
        </select>
        <CaretIcon />
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="w-full sm:w-[48%] md:w-auto px-8 py-3 font-semibold text-white whitespace-nowrap rounded-xl transition max-md:px-5 shadow-md"
        style={{
          background: "linear-gradient(135deg, #4b1248cd 30%, rgb(61 9 61) 100%)",
          border: "1px solid #fff",
        }}
      >
        Search
      </button>
    </section>
  );
}

// Reusable SVG dropdown icon
const CaretIcon = () => (
  <svg
    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
);

export default SearchBar;
