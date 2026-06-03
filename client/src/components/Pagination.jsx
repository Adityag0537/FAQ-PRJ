function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    const numbers = new Set([1, pages, page, page - 1, page + 1]);
    const sorted = [...numbers]
      .filter((n) => n >= 1 && n <= pages)
      .sort((a, b) => a - b);

    const result = [];

    sorted.forEach((num, index) => {
      if (index > 0 && num - sorted[index - 1] > 1) {
        result.push("...");
      }
      result.push(num);
    });

    return result;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </button>

      <div className="pagination-pages">
        {getPageNumbers().map((pageNumber, index) =>
          pageNumber === "..." ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
            <button
              key={pageNumber}
              type="button"
              className={`pagination-page ${pageNumber === page ? "active" : ""}`}
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? "page" : undefined}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </button>
    </nav>
  );
}

export default Pagination;
