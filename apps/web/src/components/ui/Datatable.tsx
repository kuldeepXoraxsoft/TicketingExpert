import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  render: (row: T, index: number) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;

  loading?: boolean;
  loadingText?: string;

  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;

  minWidth?: string;

  // Pagination
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;

  onRowClick?: (row: T) => void;
};

export default function DataTable<T>({
  columns,
  data,
  rowKey,

  loading = false,
  loadingText = "Loading...",

  emptyIcon,
  emptyTitle = "No records found",
  emptyDescription = "There are no records to display.",

  minWidth = "900px",

  page = 1,
  pageSize = 25,
  total = data.length,
  onPageChange,

  onRowClick,
}: DataTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = total === 0 ? 0 : Math.min(currentPage * pageSize, total);

  const canGoPrevious = currentPage > 1 && !loading;
  const canGoNext = currentPage < totalPages && !loading;

  function handlePrevious() {
    if (!canGoPrevious || !onPageChange) return;
    onPageChange(currentPage - 1);
  }

  function handleNext() {
    if (!canGoNext || !onPageChange) return;
    onPageChange(currentPage + 1);
  }

  const isInitialLoading = loading && data.length === 0;
  const isEmpty = !loading && data.length === 0;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative min-h-[400px] overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth }}>
          <thead className="border-b border-slate-100 bg-slate-50/70">
            <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              {columns.map((column) => (
                <th key={column.key} className={`px-5 py-3 ${column.headerClassName ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isInitialLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
                  <p className="mt-3 text-sm text-slate-500">{loadingText}</p>
                </td>
              </tr>
            ) : isEmpty ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-16 text-center">
                  {emptyIcon && (
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      {emptyIcon}
                    </div>
                  )}
                  <h3 className="mt-4 text-sm font-semibold text-slate-900">{emptyTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">{emptyDescription}</p>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={rowKey(row, index)}
                  onClick={() => onRowClick?.(row)}
                  className={`border-t border-slate-100 transition hover:bg-slate-50/70 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((column) => (
                    <td key={column.key} className={`px-5 py-4 ${column.className ?? ""}`}>
                      {column.render(row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Small loading overlay while changing page (data already present) */}
        {loading && data.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          Showing <span className="font-medium text-slate-600">{startItem}</span> to{" "}
          <span className="font-medium text-slate-600">{endItem}</span> of{" "}
          <span className="font-medium text-slate-600">{total}</span> records
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            Previous
          </button>

          <span className="min-w-[70px] text-center text-xs text-slate-500">
            Page <span className="font-medium text-slate-700">{currentPage}</span> of{" "}
            <span className="font-medium text-slate-700">{totalPages}</span>
          </span>

          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}