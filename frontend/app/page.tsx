import { parts, PARTS_PER_PAGE } from "@/lib/mock-parts";
import PartCard from "@/app/components/PartCard";
import Pagination from "@/app/components/Pagination";
import styles from "./page.module.css";

type SearchParams = Promise<{ page?: string }>;

export default async function Home(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const rawPage = parseInt(searchParams.page ?? "1", 10);
  const totalPages = Math.ceil(parts.length / PARTS_PER_PAGE);
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : Math.min(rawPage, totalPages);

  const start = (currentPage - 1) * PARTS_PER_PAGE;
  const pageParts = parts.slice(start, start + PARTS_PER_PAGE);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Catálogo de Repuestos</h1>
        <p className={styles.subtitle}>
          {parts.length.toLocaleString("es-CL")} repuestos disponibles
        </p>
      </header>

      <main className={styles.main}>
        <ul className={styles.grid}>
          {pageParts.map((part) => (
            <li key={part.id}>
              <PartCard part={part} />
            </li>
          ))}
        </ul>

        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </main>
    </div>
  );
}
