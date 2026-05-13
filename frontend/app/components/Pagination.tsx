import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const btnBase =
  "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-[var(--background)] text-[var(--foreground)] border border-gray-200 no-underline transition-[background,border-color] duration-150 dark:border-gray-700";

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2 py-6 flex-wrap" aria-label="Paginación">
      {currentPage > 1 ? (
        <Link
          href={`/?page=${currentPage - 1}`}
          className={`${btnBase} hover:bg-gray-100 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500`}
        >
          ← Anterior
        </Link>
      ) : (
        <span className={`${btnBase} opacity-40 cursor-default pointer-events-none`}>← Anterior</span>
      )}

      <div className="flex gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          const isActive = page === currentPage;
          return (
            <Link
              key={page}
              href={`/?page=${page}`}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium border no-underline transition-[background,border-color] duration-150 ${
                isActive
                  ? "bg-blue-700 text-white border-blue-700 dark:bg-blue-600 dark:border-blue-600"
                  : "text-[var(--foreground)] border-gray-200 hover:bg-gray-100 hover:border-gray-300 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:border-gray-500"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={`/?page=${currentPage + 1}`}
          className={`${btnBase} hover:bg-gray-100 hover:border-gray-300 dark:hover:bg-gray-800 dark:hover:border-gray-500`}
        >
          Siguiente →
        </Link>
      ) : (
        <span className={`${btnBase} opacity-40 cursor-default pointer-events-none`}>Siguiente →</span>
      )}
    </nav>
  );
}
