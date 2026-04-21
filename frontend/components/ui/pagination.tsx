'use client';

type PaginationProps = {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  small?: boolean;
};

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  small = false,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div className={`${small ? 'mt-0 px-2 py-1.5 border-0 bg-transparent' : 'mt-4 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50'} flex items-center justify-between gap-3 text-sm text-slate-600`}>
      <p className={small ? 'text-[10px] font-bold' : ''}>
        {currentPage}/{totalPages}
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${small ? 'p-1.5' : 'px-3 py-2'} rounded-xl border border-slate-200 bg-white disabled:opacity-30`}
        >
          {small ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg> : 'Prev'}
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`${small ? 'p-1.5' : 'px-3 py-2'} rounded-xl border border-slate-200 bg-white disabled:opacity-30`}
        >
          {small ? <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg> : 'Next'}
        </button>
      </div>
    </div>
  );
}
