import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchKeys,
  filters,
  rightActions,
  emptyLabel = "No records",
}: {
  data: T[];
  columns: Column<T>[];
  searchKeys?: (keyof T)[];
  filters?: ReactNode;
  rightActions?: ReactNode;
  emptyLabel?: string;
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim() || !searchKeys) return data;
    const s = q.toLowerCase();
    return data.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(s)),
    );
  }, [q, data, searchKeys]);

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 p-3 border-b border-border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="w-full h-9 rounded-lg bg-secondary/50 border border-border pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>
        {filters}
        <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card hover:bg-secondary text-xs">
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </button>
        {rightActions}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/40">
              {columns.map((c) => (
                <th key={c.key} className={`text-left font-medium text-[11px] uppercase tracking-wider text-muted-foreground px-4 py-2.5 ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-sm text-muted-foreground">{emptyLabel}</td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3 ${c.className ?? ""}`}>{c.render(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border text-[11px] text-muted-foreground">
        <span>{filtered.length} of {data.length}</span>
        <div className="flex gap-1">
          <button className="px-2 py-1 rounded hover:bg-secondary">Prev</button>
          <button className="px-2 py-1 rounded hover:bg-secondary">Next</button>
        </div>
      </div>
    </div>
  );
}
