import { useState, type FormEvent } from 'react';
import { api, type Note } from '../api';
import { Pager } from '../Pager';
import { usePaged } from '../usePaged';

export function Notes() {
  const { data, page, setPage, reload, error } = usePaged<Note>('/notes');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  function resetForm() {
    setTitle('');
    setContent('');
    setEditingId(null);
  }

  async function run(action: () => Promise<unknown>) {
    setActionError('');
    try {
      await action();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      if (editingId) await api(`/notes/${editingId}`, 'PATCH', { title, content });
      else await api('/notes', 'POST', { title, content });
      resetForm();
    });
  }

  function startEdit(note: Note) {
    setEditingId(note._id);
    setTitle(note.title);
    setContent(note.content);
  }

  return (
    <section>
      <h2>My notes</h2>
      <form onSubmit={submit} className="card">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} />
        <button type="submit">{editingId ? 'Save changes' : 'Add note'}</button>
        {editingId && (
          <button type="button" onClick={resetForm}>
            Cancel
          </button>
        )}
      </form>

      {(error || actionError) && <p className="error">{error || actionError}</p>}
      {data?.items.length === 0 && <p>No notes yet.</p>}
      {data?.items.map((note) => (
        <article key={note._id} className="card">
          <h3>{note.title}</h3>
          <p style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
          <small>Updated {new Date(note.updatedAt).toLocaleString()}</small>
          <p>
            <button onClick={() => startEdit(note)}>Edit</button>{' '}
            <button onClick={() => confirm('Delete this note?') && run(() => api(`/notes/${note._id}`, 'DELETE'))}>
              Delete
            </button>
          </p>
        </article>
      ))}
      {data && <Pager page={page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
