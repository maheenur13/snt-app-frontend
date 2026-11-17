import { useCallback, useEffect, useState } from 'react';
import { api, type Page } from './api';

export function usePaged<T>(path: string, limit = 10) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<T> | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    const separator = path.includes('?') ? '&' : '?';
    api<Page<T>>(`${path}${separator}page=${page}&limit=${limit}`)
      .then((result) => {
        setData(result);
        setError('');
      })
      .catch((err: Error) => setError(err.message));
  }, [path, page, limit]);

  useEffect(reload, [reload]);

  return { data, page, setPage, reload, error };
}

export function Pager({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <p>
      <button disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>{' '}
      Page {page} of {totalPages}{' '}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Next</button>
    </p>
  );
}
