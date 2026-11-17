import { useState, type FormEvent } from 'react';
import { api, type User } from '../api';
import { Pager, usePaged } from '../paging';

const emptyForm = { name: '', email: '', password: '', role: 'user' as User['role'] };

export function AdminUsers({ currentUserId }: { currentUserId: string }) {
  const { data, page, setPage, reload, error } = usePaged<User>('/users');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  async function run(action: () => Promise<unknown>) {
    setActionError('');
    try {
      await action();
      reload();
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    run(async () => {
      if (editingId) {
        // leave the password untouched unless a new one was typed
        const { password, ...rest } = form;
        await api(`/users/${editingId}`, 'PATCH', password ? form : rest);
      } else {
        await api('/users', 'POST', form);
      }
      resetForm();
    });
  }

  function startEdit(user: User) {
    setEditingId(user._id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
  }

  const set = (field: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm({ ...form, [field]: e.target.value });

  return (
    <section>
      <h2>Manage users</h2>
      <form onSubmit={submit} className="card">
        <strong>{editingId ? 'Edit user' : 'Add user'}</strong>
        <p>
          <input placeholder="Name" value={form.name} onChange={set('name')} required />{' '}
          <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />{' '}
          <input
            type="password"
            placeholder={editingId ? 'New password (optional)' : 'Password'}
            value={form.password}
            onChange={set('password')}
            minLength={8}
            required={!editingId}
          />{' '}
          <select value={form.role} onChange={set('role')}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </p>
        <button type="submit">{editingId ? 'Save changes' : 'Add user'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel</button>}
      </form>

      {(error || actionError) && <p className="error">{error || actionError}</p>}
      {data && <p>{data.total} users in total</p>}
      <table>
        <thead>
          <tr>
            <th align="left">Name</th>
            <th align="left">Email</th>
            <th align="left">Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data?.items.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => startEdit(user)}>Edit</button>{' '}
                {user._id !== currentUserId && (
                  <button
                    onClick={() =>
                      confirm(`Delete ${user.email} and all their notes and posts?`) &&
                      run(() => api(`/users/${user._id}`, 'DELETE'))
                    }
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && <Pager page={page} totalPages={data.totalPages} onChange={setPage} />}
    </section>
  );
}
