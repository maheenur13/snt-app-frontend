import type { Note } from '../api';
import { Pager, usePaged } from '../paging';

export function AllNotes() {
  const { data, page, setPage, error } = usePaged<Note>('/notes/all');

  return (
    <section>
      <h2>All notes</h2>
      {error && <p className="error">{error}</p>}
      {data && <p>{data.total} notes in total</p>}
      {data?.items.map((note) => (
        <article key={note._id} className="card">
          <h3>{note.title}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
          <small>
            By {typeof note.owner === 'object' && note.owner ? `${note.owner.name} (${note.owner.email})` : 'deleted user'}
          </small>
        </article>
      ))}
      {data && <Pager page={page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
