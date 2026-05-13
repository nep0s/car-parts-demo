import { fetchCatalog } from "@/lib/api";
import PartCard from "@/app/components/PartCard";
import Pagination from "@/app/components/Pagination";

const PARTS_PER_PAGE = 12;

type SearchParams = Promise<{ page?: string }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const rawPage = parseInt(searchParams.page ?? "1", 10);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;

  const { parts: pageParts, total, totalPages } = await fetchCatalog(currentPage, PARTS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages || 1);

  return (
    <div className="flex flex-col min-h-screen font-[var(--font-geist-sans)]">
      <header className="px-6 pt-10 pb-6 text-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-[2rem] font-bold tracking-tight max-sm:text-2xl">Catálogo de Repuestos</h1>
        <p className="mt-1.5 text-[0.95rem] text-gray-500 dark:text-gray-400">
          {total.toLocaleString("es-CL")} repuestos disponibles
        </p>
      </header>

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-8">
        <ul className="list-none grid grid-cols-4 gap-5 max-lg:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3.5 max-[400px]:grid-cols-1">
          {pageParts.map((part) => (
            <li key={part.id}>
              <PartCard part={part} />
            </li>
          ))}
        </ul>

        <Pagination currentPage={safePage} totalPages={totalPages} />
      </main>
    </div>
  );
}
