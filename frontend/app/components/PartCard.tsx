"use client";

import { useState } from "react";
import type { Part, VehicleCompatibility } from "@/lib/api";
import { formatCLP } from "@/lib/utils";
import PartImage from "@/app/components/PartImage";
import PartDetailModal from "@/app/components/PartDetailModal";
import styles from "./PartCard.module.css";

const SOURCE_LABELS: Record<string, string> = {
  autopartsplus: "AutoParts Plus",
  repuestosmax: "Repuestos Max",
  globalparts: "Global Parts",
};

function formatVehicle(v: VehicleCompatibility): string {
  const years = `${v.yearStart}–${v.yearEnd}`;
  const extra = [v.engine, v.trim].filter(Boolean).join(" · ");
  return `${v.manufacturer} ${v.model} (${years})${extra ? " · " + extra : ""}`;
}

export default function PartCard({ part }: { part: Part }) {
  const [open, setOpen] = useState(false);
  const visibleVehicles = part.compatibleVehicles.slice(0, 3);
  const hiddenCount = part.compatibleVehicles.length - visibleVehicles.length;

  return (
    <>
    <article
      className={styles.card}
      onClick={() => setOpen(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
    >
      <div className={styles.imageWrapper}>
        <PartImage src={part.images[0] ?? ""} alt={part.name} />
      </div>
      <div className={styles.body}>
        {SOURCE_LABELS[part.source] && (
          <span className={styles.sourceBadge}>{SOURCE_LABELS[part.source]}</span>
        )}
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
        {visibleVehicles.length > 0 && (
          <ul className={styles.vehicleList}>
            {visibleVehicles.map((v, i) => (
              <li key={i} className={styles.vehicleItem}>{formatVehicle(v)}</li>
            ))}
            {hiddenCount > 0 && (
              <li className={styles.moreVehicles}>y {hiddenCount} más</li>
            )}
          </ul>
        )}
      </div>
    </article>
    {open && (
      <PartDetailModal part={part} onClose={() => setOpen(false)} />
    )}
    </>
  );
}
