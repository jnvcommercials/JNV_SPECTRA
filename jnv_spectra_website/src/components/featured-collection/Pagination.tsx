import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <nav
      aria-label="Pagination"
      className="self-center flex items-center gap-2.5 mt-[20px] max-md:mt-0"
    >
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="bg-[#4b1248cd] flex items-center justify-center w-[30px] h-[30px] px-2 rounded-[10px] disabled:opacity-50"
        // style={{
        //   background: 'linear-gradient(145deg, #4b1248, #8b6998)',
        //   // border: '1px solid #',
        // }}
        aria-label="Previous page"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/3a02bf99f865fa81a0805293713fb2f644c05e8d?placeholderIfAbsent=true"
          alt="Previous"
          className="aspect-[0.9] object-scale-down scale-75 w-4"
        />
      </button>

      {/* Dynamic Page Numbers (Hidden on Mobile) */}
      <div className="hidden md:flex gap-2">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${
              currentPage === page
                ? "bg-[#4b1248cd] text-white text-sm"
                : "bg-white text-black border text-sm border-[rgba(202,202,202,1)] border-solid"
            } text-2xl font-normal whitespace-nowrap w-[30px] h-[30px]  rounded-[10px]`}
            // style={{
            //   background: 'linear-gradient(145deg, #4b1248, #8b6998)',
            //   // border: '1px solid #',
            // }}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="bg-[#4b1248cd] flex items-center justify-center w-[30px] h-[30px] px-2 rounded-[10px] disabled:opacity-50"
        // style={{
        //   background: 'linear-gradient(145deg, #4b1248, #8b6998)',
        //   // border: '1px solid #',
        // }}
        aria-label="Next page"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets/b0421c6893b4459ca43e9069377d0210/c57601d278878d12aca9ac82502d8fe9b6cd00a9?placeholderIfAbsent=true"
          alt="Next"
          className="aspect-[1] object-scale-down scale-75 w-5"
        />
      </button>
    </nav>
  );
};

export default Pagination;
