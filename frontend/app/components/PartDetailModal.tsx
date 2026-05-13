"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchDetail, type Part, type VehicleCompatibility } from "@/lib/api";
import { formatCLP } from "@/lib/utils";
import PartImage from "@/app/components/PartImage";
import styles from "./PartDetailModal.module.css";

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

interface Props {
  part: Part;
  onClose: () => void;
}

export default function PartDetailModal({ part, onClose }: Props) {
  const sku = part.id.split(":")[1];
  const router = useRouter();

  const [price, setPrice] = useState(part.price);
  const [stock, setStock] = useState(part.stock);
  const [priceUpdated, setPriceUpdated] = useState(false);
  const [stockUpdated, setStockUpdated] = useState(false);

  const [description, setDescription] = useState(part.description);
  const [brand, setBrand] = useState(part.brand);
  const [oemCode, setOemCode] = useState(part.oemCode);
  const [category, setCategory] = useState(part.category);
  const [warehouse, setWarehouse] = useState(part.warehouse);
  const [weight, setWeight] = useState(part.weight);

  const [detailLoading, setDetailLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDetail(part.source, sku)
      .then((d) => {
        let changed = false;
        if (d.price !== part.price) {
          setPrice(d.price);
          setPriceUpdated(true);
          changed = true;
        }
        if (d.stock !== part.stock) {
          setStock(d.stock);
          setStockUpdated(true);
          changed = true;
        }
        if (changed) router.refresh();
        setDescription(d.description);
        setBrand(d.brand);
        setOemCode(d.oemCode);
        setCategory(d.category);
        setWarehouse(d.warehouse);
        setWeight(d.weight);
      })
      .catch(() => setError("No se pudo verificar el precio actual."))
      .finally(() => setDetailLoading(false));
  }, [part.source, sku]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">✕</button>

        <div className={styles.content}>
          <div className={styles.imageWrapper}>
            <PartImage src={part.images[0] ?? ""} alt={part.name} />
          </div>

          <div className={styles.body}>
            {SOURCE_LABELS[part.source] && (
              <span className={styles.sourceBadge}>{SOURCE_LABELS[part.source]}</span>
            )}
            <h2 className={styles.name}>{part.name}</h2>

            {(brand || oemCode || category) && (
              <div className={styles.metaRow}>
                {brand && <span className={styles.meta}>Marca: {brand}</span>}
                {oemCode && <span className={styles.meta}>OEM: {oemCode}</span>}
              </div>
            )}

            <div className={styles.priceBlock}>
              <p className={styles.priceLabel}>
                Precio actual
                {detailLoading && <span className={styles.liveSpinner} />}
              </p>
              <p className={`${styles.price} ${priceUpdated ? styles.updated : ""}`}>
                {formatCLP(price)}
              </p>
            </div>

            <div className={`${styles.stock} ${stockUpdated ? styles.updated : ""}`}>
              {stock > 0 ? (
                <span className={`${styles.badge} ${styles.inStock}`}>En stock</span>
              ) : (
                <span className={`${styles.badge} ${styles.outOfStock}`}>Sin stock</span>
              )}
              {stock > 0 && (
                <span className={styles.stockCount}>{stock.toLocaleString("es-CL")} disponibles</span>
              )}
            </div>

            {error && <p className={styles.errorInline}>{error}</p>}

            {description && <p className={styles.description}>{description}</p>}

            {(warehouse || weight) && (
              <div className={styles.logistics}>
                {warehouse && <span className={styles.logisticsItem}>Bodega: {warehouse}</span>}
                {weight && <span className={styles.logisticsItem}>Peso: {weight.value} {weight.unit}</span>}
              </div>
            )}

            {part.compatibleVehicles.length > 0 && (
              <div className={styles.vehicles}>
                <h3 className={styles.sectionTitle}>Vehículos compatibles</h3>
                <ul className={styles.vehicleList}>
                  {part.compatibleVehicles.map((v, i) => (
                    <li key={i} className={styles.vehicleItem}>{formatVehicle(v)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
