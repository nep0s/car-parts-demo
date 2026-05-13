"use client";

import { useState } from "react";
import styles from "./PartImage.module.css";

export default function PartImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src || "/part-placeholder.svg");
  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc("/part-placeholder.svg")}
      className={styles.image}
    />
  );
}
