import Link from "next/link";
import styles from "./Pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Paginación">
      {currentPage > 1 ? (
        <Link href={`/?page=${currentPage - 1}`} className={styles.btn}>
          ← Anterior
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`}>← Anterior</span>
      )}

      <div className={styles.pages}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Link
            key={page}
            href={`/?page=${page}`}
            className={`${styles.pageBtn} ${page === currentPage ? styles.active : ""}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        ))}
      </div>

      {currentPage < totalPages ? (
        <Link href={`/?page=${currentPage + 1}`} className={styles.btn}>
          Siguiente →
        </Link>
      ) : (
        <span className={`${styles.btn} ${styles.disabled}`}>Siguiente →</span>
      )}
    </nav>
  );
}
