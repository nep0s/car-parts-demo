import Image from "next/image";
import type { Part } from "@/lib/mock-parts";
import { formatCLP } from "@/lib/mock-parts";
import styles from "./PartCard.module.css";

export default function PartCard({ part }: { part: Part }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        <Image
          src="/part-placeholder.svg"
          alt={part.name}
          fill
          className={styles.image}
        />
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>{part.name}</h2>
        <p className={styles.price}>{formatCLP(part.price)}</p>
        <div className={styles.stock}>
          {part.stock > 0 ? (
            <span className={`${styles.badge} ${styles.inStock}`}>En stock</span>
          ) : (
            <span className={`${styles.badge} ${styles.outOfStock}`}>Sin stock</span>
          )}
          {part.stock > 0 && (
            <span className={styles.stockCount}>{part.stock.toLocaleString("es-CL")} disponibles</span>
          )}
        </div>
      </div>
    </article>
  );
}
