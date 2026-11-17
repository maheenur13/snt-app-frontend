import { useCallback, useEffect, useState } from 'react';
import { api, type Page } from './api';

export const PAGE_SIZE = 10;

export function usePaged<T>(path: string) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Page<T> | null>(null);
  const [error, setError] = useState('');
  // the request whose result is on screen; while it differs from the current one, we're loading
  const [loadedUrl, setLoadedUrl] = useState('');

  const url = `${path}${path.includes('?') ? '&' : '?'}page=${page}&limit=${PAGE_SIZE}`;

  const reload = useCallback(() => {
    api<Page<T>>(url)
      .then((result) => {
        // e.g. the only item on the last page was deleted: step back instead of showing an empty page
        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }
        setData(result);
        setError('');
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadedUrl(url));
  }, [url, page]);

  useEffect(reload, [reload]);

  return { data, page, setPage, reload, loading: loadedUrl !== url, error };
}
