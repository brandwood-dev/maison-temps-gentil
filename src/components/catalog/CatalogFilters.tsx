import { useEffect, useId, useState } from "react";
import type { CatalogQuery, CatalogResult } from "@/types/catalog";
import { millimesToDinars, dinarsToMillimes } from "@/lib/catalog";

type Props = {
  /** Unique prefix to avoid duplicate ids between desktop sidebar and mobile Sheet. */
  idPrefix: string;
  query: CatalogQuery;
  availableFilters: CatalogResult["availableFilters"];
  onChange: (patch: Partial<CatalogQuery>) => void;
  /** Hide the "En promotion uniquement" toggle (e.g. on the /promotions page). */
  hidePromoFilter?: boolean;
};

export function CatalogFilters({
  idPrefix,
  query,
  availableFilters,
  onChange,
  hidePromoFilter,
}: Props) {
  return (
    <div className="flex flex-col gap-6">
      {hidePromoFilter || (availableFilters.promotionCount === 0 && !query.promotionOnly) ? null : (
        <PromoFilter idPrefix={idPrefix} value={query.promotionOnly} onChange={onChange} />
      )}
      {availableFilters.brands.length > 0 ? (
        <BrandsFilter
          idPrefix={idPrefix}
          selected={query.brands}
          options={availableFilters.brands}
          onChange={onChange}
        />
      ) : null}
      {availableFilters.dialColors.length > 0 ? (
        <ColorsFilter
          idPrefix={idPrefix}
          selected={query.dialColors}
          options={availableFilters.dialColors}
          onChange={onChange}
        />
      ) : null}
      {availableFilters.attributes.map((attribute) => (
        <AttributesFilter
          key={attribute.id}
          idPrefix={idPrefix}
          attribute={attribute}
          selected={query.attributes[attribute.code] ?? []}
          allSelected={query.attributes}
          onChange={onChange}
        />
      ))}
      {availableFilters.priceRange ? (
        <PriceFilter
          idPrefix={idPrefix}
          minMillimes={query.minPriceMillimes}
          maxMillimes={query.maxPriceMillimes}
          range={availableFilters.priceRange}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-[color:var(--color-border)] pt-4 first:border-t-0 first:pt-0">
      <legend className="mb-3 text-sm font-semibold text-[color:var(--color-foreground)]">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function PromoFilter({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string;
  value: boolean;
  onChange: (patch: Partial<CatalogQuery>) => void;
}) {
  const id = `${idPrefix}-promo`;
  return (
    <Group title="Offres">
      <div className="flex min-h-11 items-center gap-2">
        <input
          id={id}
          type="checkbox"
          checked={value}
          onChange={(e) => onChange({ promotionOnly: e.target.checked, page: 1 })}
          className="h-4 w-4 rounded border-[color:var(--color-border-strong)] accent-[color:var(--color-foreground)]"
        />
        <label htmlFor={id} className="text-sm text-[color:var(--color-foreground)]">
          En promotion uniquement
        </label>
      </div>
    </Group>
  );
}

function BrandsFilter({
  idPrefix,
  selected,
  options,
  onChange,
}: {
  idPrefix: string;
  selected: string[];
  options: { value: string; label: string; count: number }[];
  onChange: (patch: Partial<CatalogQuery>) => void;
}) {
  const toggle = (val: string) => {
    const next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
    onChange({ brands: next, page: 1 });
  };
  return (
    <Group title="Marques">
      <ul className="flex flex-col gap-1">
        {options.map((o) => {
          const id = `${idPrefix}-brand-${o.value.replace(/\s+/g, "-").toLowerCase()}`;
          const checked = selected.includes(o.value);
          return (
            <li key={o.value}>
              <div className="flex min-h-11 items-center gap-2">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  className="h-4 w-4 rounded border-[color:var(--color-border-strong)] accent-[color:var(--color-foreground)]"
                />
                <label htmlFor={id} className="flex-1 text-sm text-[color:var(--color-foreground)]">
                  {o.label}
                </label>
                <span
                  className="text-xs text-[color:var(--color-muted-foreground)]"
                  aria-label={`${o.count} produit${o.count > 1 ? "s" : ""}`}
                >
                  ({o.count})
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Group>
  );
}

function ColorsFilter({
  idPrefix,
  selected,
  options,
  onChange,
}: {
  idPrefix: string;
  selected: string[];
  options: { value: string; label: string; count: number }[];
  onChange: (patch: Partial<CatalogQuery>) => void;
}) {
  const toggle = (val: string) => {
    const next = selected.includes(val) ? selected.filter((v) => v !== val) : [...selected, val];
    onChange({ dialColors: next, page: 1 });
  };
  return (
    <Group title="Couleur du cadran">
      <ul className="flex flex-col gap-1">
        {options.map((o) => {
          const id = `${idPrefix}-color-${o.value.replace(/\s+/g, "-").toLowerCase()}`;
          const checked = selected.includes(o.value);
          return (
            <li key={o.value}>
              <div className="flex min-h-11 items-center gap-2">
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(o.value)}
                  className="h-4 w-4 rounded border-[color:var(--color-border-strong)] accent-[color:var(--color-foreground)]"
                />
                <label htmlFor={id} className="flex-1 text-sm text-[color:var(--color-foreground)]">
                  {o.label}
                </label>
                <span
                  className="text-xs text-[color:var(--color-muted-foreground)]"
                  aria-label={`${o.count} produit${o.count > 1 ? "s" : ""}`}
                >
                  ({o.count})
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Group>
  );
}

function AttributesFilter({
  idPrefix,
  attribute,
  selected,
  allSelected,
  onChange,
}: {
  idPrefix: string;
  attribute: CatalogResult["availableFilters"]["attributes"][number];
  selected: string[];
  allSelected: Record<string, string[]>;
  onChange: (patch: Partial<CatalogQuery>) => void;
}) {
  const toggle = (value: string) => {
    const nextValues = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    const nextAttributes = { ...allSelected };
    if (nextValues.length > 0) nextAttributes[attribute.code] = nextValues;
    else delete nextAttributes[attribute.code];
    onChange({
      attributes: nextAttributes,
      page: 1,
    });
  };

  return (
    <Group title={attribute.label}>
      <ul className="flex flex-col gap-1">
        {attribute.options.map((option) => {
          const id = `${idPrefix}-attribute-${attribute.code}-${option.value}`;
          return (
            <li key={option.value}>
              <div className="flex min-h-11 items-center gap-2">
                <input
                  id={id}
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggle(option.value)}
                  className="h-4 w-4 rounded border-[color:var(--color-border-strong)] accent-[color:var(--color-foreground)]"
                />
                <label htmlFor={id} className="flex-1 text-sm text-[color:var(--color-foreground)]">
                  {option.label}
                </label>
                <span
                  className="text-xs text-[color:var(--color-muted-foreground)]"
                  aria-label={`${option.count} produit${option.count > 1 ? "s" : ""}`}
                >
                  ({option.count})
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </Group>
  );
}

function PriceFilter({
  idPrefix,
  minMillimes,
  maxMillimes,
  range,
  onChange,
}: {
  idPrefix: string;
  minMillimes: number | undefined;
  maxMillimes: number | undefined;
  range: { minMillimes: number; maxMillimes: number };
  onChange: (patch: Partial<CatalogQuery>) => void;
}) {
  const minId = useId();
  const maxId = useId();
  const [minDt, setMinDt] = useState(millimesToDinars(minMillimes));
  const [maxDt, setMaxDt] = useState(millimesToDinars(maxMillimes));

  // Keep local inputs in sync when URL changes externally (browser nav, chip removal…).
  useEffect(() => {
    setMinDt(millimesToDinars(minMillimes));
  }, [minMillimes]);
  useEffect(() => {
    setMaxDt(millimesToDinars(maxMillimes));
  }, [maxMillimes]);

  const apply = () => {
    onChange({
      minPriceMillimes: dinarsToMillimes(minDt),
      maxPriceMillimes: dinarsToMillimes(maxDt),
      page: 1,
    });
  };

  const hint = `Disponible entre ${Math.round(range.minMillimes / 1000)} DT et ${Math.round(range.maxMillimes / 1000)} DT`;

  return (
    <Group title="Prix (DT)">
      <p className="mb-2 text-xs text-[color:var(--color-muted-foreground)]">{hint}</p>
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label
            htmlFor={`${idPrefix}-${minId}`}
            className="mb-1 block text-xs font-medium text-[color:var(--color-muted-foreground)]"
          >
            Prix minimum
          </label>
          <input
            id={`${idPrefix}-${minId}`}
            type="number"
            inputMode="numeric"
            min={0}
            step={10}
            value={minDt}
            onChange={(e) => setMinDt(e.target.value)}
            onBlur={apply}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="0"
            className="h-11 w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor={`${idPrefix}-${maxId}`}
            className="mb-1 block text-xs font-medium text-[color:var(--color-muted-foreground)]"
          >
            Prix maximum
          </label>
          <input
            id={`${idPrefix}-${maxId}`}
            type="number"
            inputMode="numeric"
            min={0}
            step={10}
            value={maxDt}
            onChange={(e) => setMaxDt(e.target.value)}
            onBlur={apply}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="—"
            className="h-11 w-full rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-gold)]"
          />
        </div>
      </div>
      <button
        type="button"
        onClick={apply}
        className="mt-3 inline-flex h-9 items-center rounded-[var(--radius-md)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-background)] px-3 text-xs font-semibold text-[color:var(--color-foreground)] hover:bg-[color:var(--color-surface-cream)]"
      >
        Appliquer
      </button>
    </Group>
  );
}
