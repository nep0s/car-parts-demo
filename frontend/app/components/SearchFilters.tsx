"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const inputBase =
  "px-3 py-2 rounded-lg text-sm bg-[var(--background)] text-[var(--foreground)] border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 w-full";

export interface FilterValues {
  search: string;
  manufacturer: string;
  model: string;
  year: string;
}

interface SearchFiltersProps {
  initial: FilterValues;
}

export default function SearchFilters({ initial }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<FilterValues>(initial);

  function handleChange(field: keyof FilterValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    if (values.search.trim()) params.set("search", values.search.trim());
    else params.delete("search");
    if (values.manufacturer.trim()) params.set("manufacturer", values.manufacturer.trim());
    else params.delete("manufacturer");
    if (values.model.trim()) params.set("model", values.model.trim());
    else params.delete("model");
    if (values.year.trim() && !isNaN(Number(values.year))) params.set("year", values.year.trim());
    else params.delete("year");
    router.push(`/?${params.toString()}`);
  }

  function handleClear() {
    setValues({ search: "", manufacturer: "", model: "", year: "" });
    router.push("/");
  }

  const hasFilters = Object.values(values).some((v) => v.trim() !== "");

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap gap-3 items-end py-5"
    >
      <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Buscar por nombre</label>
        <input
          type="text"
          placeholder="ej. filtro de aceite"
          value={values.search}
          onChange={(e) => handleChange("search", e.target.value)}
          className={inputBase}
        />
      </div>

      <div className="flex flex-col gap-1 w-36 max-sm:flex-1 max-sm:min-w-[120px]">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Marca vehículo</label>
        <input
          type="text"
          placeholder="ej. Honda"
          value={values.manufacturer}
          onChange={(e) => handleChange("manufacturer", e.target.value)}
          className={inputBase}
        />
      </div>

      <div className="flex flex-col gap-1 w-36 max-sm:flex-1 max-sm:min-w-[120px]">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Modelo</label>
        <input
          type="text"
          placeholder="ej. Civic"
          value={values.model}
          onChange={(e) => handleChange("model", e.target.value)}
          className={inputBase}
        />
      </div>

      <div className="flex flex-col gap-1 w-24 max-sm:w-28">
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Año</label>
        <input
          type="number"
          placeholder="ej. 2018"
          min={1900}
          max={2100}
          value={values.year}
          onChange={(e) => handleChange("year", e.target.value)}
          className={inputBase}
        />
      </div>

      <button
        type="submit"
        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-700 text-white border border-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-700 transition-colors duration-150 self-end"
      >
        Buscar
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--background)] text-[var(--foreground)] border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150 self-end"
        >
          Limpiar
        </button>
      )}
    </form>
  );
}
