export function Pager({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <p>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>{' '}
      Page {page} of {totalPages}{' '}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </p>
  );
}
