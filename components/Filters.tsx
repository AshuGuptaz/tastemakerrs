"use client";

import { CATEGORIES, CATEGORY_META, ALL_FLAVORS } from "@/lib/products";
import type { Category } from "@/types/product";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  cat: Category | "all";
  flavor: string;
  bestseller: boolean;
  max: number;
};

export default function Filters({ cat, flavor, bestseller, max }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const update = (key: string, val: string | null) => {
    const next = new URLSearchParams(sp.toString());
    if (val === null || val === "") next.delete(key);
    else next.set(key, val);
    router.replace(`/menu?${next.toString()}`, { scroll: false });
  };

  // Local state keeps the range thumb instant-responsive while the URL commit is debounced.
  const [localMax, setLocalMax] = useState(max);
  const maxTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Keep in sync when the URL-sourced prop changes (e.g. Reset, back/forward).
  useEffect(() => setLocalMax(max), [max]);
  useEffect(() => () => clearTimeout(maxTimeout.current), []);

  const onMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalMax(Number(val));
    clearTimeout(maxTimeout.current);
    maxTimeout.current = setTimeout(() => update("max", val), 150);
  };

  return (
    <div className="card p-5 md:sticky md:top-24">
      <h3 className="t-h3">Filters</h3>

      <div className="mt-4">
        <p className="label">Category</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => update("cat", null)}
            className={`rounded-pill px-3 py-1.5 text-xs font-semibold uppercase transition ${cat === "all" ? "bg-flame text-white" : "bg-surface hover:bg-surface"}`}>
            All
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => update("cat", c)}
              className={`rounded-pill px-3 py-1.5 text-xs font-semibold uppercase transition ${cat === c ? "bg-flame text-white" : "bg-surface hover:bg-surface"}`}>
              {CATEGORY_META[c].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="label">Max Price · ₹{localMax}</p>
        <input
          type="range" min={50} max={2500} step={50} value={localMax}
          onChange={onMaxChange}
          className="w-full accent-flame"
        />
      </div>

      <div className="mt-5">
        <p className="label">Flavor</p>
        <select
          value={flavor}
          onChange={(e) => update("flavor", e.target.value || null)}
          className="input"
        >
          <option value="">All flavors</option>
          {ALL_FLAVORS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <input
          id="bs" type="checkbox" checked={bestseller}
          onChange={(e) => update("bs", e.target.checked ? "1" : null)}
          className="h-5 w-5 accent-flame"
        />
        <label htmlFor="bs" className="text-sm font-semibold">Bestsellers only</label>
      </div>

      <button onClick={() => router.replace("/menu")} className="btn-line mt-6 w-full justify-center">
        Reset filters
      </button>
    </div>
  );
}
