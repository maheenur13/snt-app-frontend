import { useCallback, useEffect, useState } from 'react';
import { api, type Page } from './api';

export function usePaged<T>(path: string) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<T> | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    const separator = path.includes('?') ? '&' : '?';
    api<Page<T>>(`${path}${separator}page=${page}&limit=10`)
      .then((result) => {
        // e.g. the only item on the last page was deleted: step back instead of showing an empty page
        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }
        setData(result);
        setError('');
      })
      .catch((err: Error) => setError(err.message));
  }, [path, page]);

  useEffect(reload, [reload]);

  return { data, page, setPage, reload, error };
}
